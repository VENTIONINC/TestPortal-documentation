// Optional local contract verification against an independently built, audited CLI.
// Usage: node scripts/verify-cli-examples.mjs /path/to/dist/cli.js /path/to/generated/reports
// The reports directory must contain real playwright.json, jest.json and cypress.json.
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
const [cliArg, reportsArg] = process.argv.slice(2);
if (!cliArg || !reportsArg) throw new Error('Supply audited CLI entry and generated reports directory');
const cli = resolve(cliArg);
const reports = resolve(reportsArg);
const dir = await mkdtemp(join(tmpdir(), 'portal-cli-examples-'));
function run(entry, args, extraEnv = {}) {
  return new Promise((resolveRun, reject) => {
    const env = {...process.env, TEST_PORTAL_URL: '', TEST_PORTAL_API_KEY: '', ...extraEnv};
    const child = spawn(process.execPath, [entry, ...args], {cwd: dir, env});
    let output = '';
    child.stdout.on('data', d => output += d);
    child.stderr.on('data', d => output += d);
    child.on('error', reject);
    child.on('close', code => resolveRun({code, output}));
  });
}
try {
  const tutorial = await readFile('docs/getting-started/first-report.md', 'utf8');
  await writeFile(join(dir, 'sample.json'), tutorial.match(/```json\n([\s\S]*?)\n```/)[1]);
  for (const name of ['sample', 'playwright', 'jest', 'cypress']) {
    let input = name === 'sample' ? join(dir, 'sample.json') : join(reports, `${name}.json`);
    if (['jest', 'cypress'].includes(name)) {
      const page = await readFile(`docs/integrations/${name}.md`, 'utf8');
      const adapter = join(dir, `normalize-${name}.cjs`);
      await writeFile(adapter, page.match(/```javascript\n([\s\S]*?)\n```/)[1]);
      const normalized = join(dir, `${name}.normalized.json`);
      const result = await run(adapter, [input, normalized]);
      assert.equal(result.code, 0, `${name} normalization failed`);
      input = normalized;
    }
    const output = join(dir, `${name}.ctrf.json`);
    const result = await run(cli, ['--input', input, '--type', name === 'sample' ? 'playwright' : name, '--output', output]);
    assert.equal(result.code, 0, `${name} conversion failed`);
    const report = JSON.parse(await readFile(output, 'utf8'));
    const expected = {sample: 1, playwright: 2, jest: 2, cypress: 3}[name];
    assert.equal(report.results.tests.length, expected, `${name} lost tests`);
    assert.equal(report.results.summary.tests, expected);
    assert.ok(report.results.tests.every(t => t.name.length > 1));
    assert.equal(report.results.tests.filter(t => t.status === 'failed').length, name === 'sample' ? 0 : 1);
    if (name === 'playwright') assert.ok(report.results.tests.some(t => t.retries === 1));
    if (name === 'cypress') assert.ok(report.results.tests.some(t => t.status === 'skipped'));
    console.log(`${name}: ${expected} tests converted; counts, names and statuses checked`);
  }
  let received = false;
  const server = createServer((req, res) => {
    received = true;
    assert.match(req.headers['content-type'], /^multipart\/form-data; boundary=/);
    assert.equal(req.headers['x-api-key'], 'EXAMPLE_KEY');
    req.resume();
    res.writeHead(401, {'Content-Type': 'application/json'});
    res.end('{"error":"Invalid API key"}');
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  try {
    const result = await run(cli, ['--input', 'sample.json', '--type', 'playwright', '--webhook', `http://127.0.0.1:${server.address().port}`, '--retries', '1'], {TEST_PORTAL_API_KEY: 'EXAMPLE_KEY'});
    assert.equal(result.code, 0);
    assert.ok(received);
    assert.match(result.output, /Webhook failed/);
    console.log('Mock HTTP 401: multipart/key verified; webhook failure reproduces exit 0');
  } finally { await new Promise(r => server.close(r)); }
} finally { await rm(dir, {recursive: true, force: true}); }
