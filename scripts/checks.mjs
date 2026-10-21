import {readdir, readFile} from 'node:fs/promises';
import {resolve, relative, extname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {parse as parseShell} from 'shell-quote';
import {parseDocument} from 'yaml';

export async function filesUnder(root) {
  const result = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, {withFileTypes: true})) {
      const path = resolve(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in public inputs: ${path}`);
      if (entry.isDirectory()) await walk(path);
      else result.push(path);
    }
  }
  await walk(root);
  return result.sort();
}

// Deliberately small rules: supplement these with human public-content review.
// Report rule names and files, never the matched credential itself.
const rules = [
  ['private key', /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['provider token', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ['JWT value', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['local absolute path', /(?:\/Users\/|\/home\/|\/private\/|\/tmp\/|[A-Z]:\\Users\\)/],
  ['internal domain', /(?:https?:\/\/)?(?:[a-z0-9.-]+\.)?(?:ventionteams\.com|[a-z0-9-]+\.internal|[a-z0-9-]+\.local)\b/i],
  ['internal source reference', /(?:openspec\/|__prompts-tests__\/|docs\/engineering\/|CARTODEX_MAP\.md)/i],
  ['contributor instructions', /CONTRIBUTING\.md/i],
  ['credential literal', /(?:api[_-]?key|secret|password|token)\s*["']?\s*[:=]\s*["'](?!\$|<|YOUR_|EXAMPLE_|REPLACE_)[A-Za-z0-9_+\/-]{16,}["']/i],
];
export function publicContentErrors(text, label) {
  return rules.filter(([, pattern]) => pattern.test(text)).map(([rule]) => `${label}: ${rule}`);
}
export async function scanPublicFiles(paths) {
  const errors = [];
  for (const path of paths) {
    // Binary uploads need a deliberate review policy; accept only reviewed SVGs for now.
    if (!['.md', '.mdx', '.tsx', '.ts', '.css', '.json', '.js', '.html', '.xml', '.txt', '.svg', ''].includes(extname(path))) continue;
    errors.push(...publicContentErrors(await readFile(path, 'utf8'), relative(process.cwd(), path)));
  }
  return errors;
}

function commandBoundaries(code) {
  let quote = null;
  let escaped = false;
  let result = '';
  for (const ch of code.replace(/\\\n/g, ' ')) {
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && quote !== "'") { result += ch; escaped = true; continue; }
    if (ch === quote) quote = null;
    else if (!quote && (ch === "'" || ch === '"')) quote = ch;
    result += ch === '\n' && !quote ? ' ; ' : ch;
  }
  return result;
}

export function shellErrors(code, contract) {
  const errors = [];
  const syntax = spawnSync('bash', ['-n'], {input: code, encoding: 'utf8'});
  if (syntax.status !== 0) errors.push('invalid shell syntax');
  let tokens;
  try { tokens = parseShell(commandBoundaries(code), name => `$${name}`); }
  catch { return [...errors, 'cannot parse shell example']; }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== 'test-portal-cli' && tokens[i] !== `${contract.packageName}@${contract.version}`) continue;
    // A pinned package in an npm install command is an installation target,
    // not a CLI invocation. Keep checking npx/npm exec invocations below.
    if (tokens[i] === `${contract.packageName}@${contract.version}`) {
      let start = i - 1;
      while (start >= 0 && typeof tokens[start] === 'string') start--;
      const command = tokens.slice(start + 1, i);
      if (command[0] === 'npm' && ['install', 'i', 'ci'].includes(command[1])) continue;
    }
    const args = [];
    for (let j = i + 1; j < tokens.length && typeof tokens[j] === 'string'; j++) args.push(tokens[j]);
    const seen = new Map();
    for (let j = 0; j < args.length; j++) {
      const [flag, inline] = args[j].split(/=(.*)/s);
      if (!(flag in contract.flags)) { errors.push(`unsupported CLI option or positional argument: ${flag}`); continue; }
      if (contract.flags[flag]) {
        const value = inline ?? args[++j];
        if (!value || value.startsWith('-')) errors.push(`missing value for ${flag}`);
        seen.set(flag, value);
      } else seen.set(flag, true);
    }
    if (!['--help', '-h', '--version', '-V'].some(flag => seen.has(flag))) {
      if (!seen.has('-i') && !seen.has('--input')) errors.push('CLI input is required');
      const provider = seen.get('-t') ?? seen.get('--type');
      if (!provider) errors.push('CLI type is required');
      else if (!contract.providers.includes(provider)) errors.push(`unsupported CLI provider: ${provider}`);
    }
  }
  // Validate the report-upload shape when a concrete Test Portal upload URL is present.
  if (/\bcurl\b/.test(code) && /\/api\/v2\/upload-(?:ctrf|json)-report/.test(code)) {
    if (!/(?:-F|--form)\s+['"]?report=@/.test(code)) errors.push('report upload must use multipart report=@file');
    if (/report-api-key/.test(code) && !/X-API-Key:/i.test(code)) errors.push('API-key upload requires X-API-Key');
  }
  return errors;
}

export function yamlErrors(code, contract) {
  const doc = parseDocument(code, {uniqueKeys: true});
  if (doc.errors.length) return ['invalid YAML'];
  const value = doc.toJS();
  if (!value?.jobs) return [];
  const errors = [];
  if (!value.on) errors.push('workflow trigger is required');
  for (const job of Object.values(value.jobs)) {
    for (const step of job.steps ?? []) {
      if (!step.run) continue;
      errors.push(...shellErrors(step.run, contract));
      const environment = {...value.env, ...job.env, ...step.env};
      for (const name of contract.environment) {
        if (new RegExp(`\\$(?:${name}\\b|\\{${name}\\})`).test(step.run) && !(name in environment)) {
          errors.push(`workflow must supply ${name} in env`);
        }
      }
    }
  }
  return errors;
}
