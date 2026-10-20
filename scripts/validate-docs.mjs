import {readFile} from 'node:fs/promises';
import {resolve, relative} from 'node:path';
import matter from 'gray-matter';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import {filesUnder, scanPublicFiles, shellErrors, yamlErrors} from './checks.mjs';

const root = process.cwd();
const manifest = JSON.parse(await readFile('public-content.json', 'utf8'));
const contract = JSON.parse(await readFile('scripts/cli-contract.json', 'utf8'));
const errors = [];
const actual = (await Promise.all(['docs', 'src', 'static'].map(filesUnder))).flat().map(p => relative(root, p));
const approved = [...manifest.docs.map(p => p.path), ...manifest.siteFiles];
for (const path of actual) if (!approved.includes(path)) errors.push(`Unreviewed public input: ${path}`);
for (const path of approved) if (!actual.includes(path)) errors.push(`Missing approved input: ${path}`);
const routes = new Set();
for (const page of manifest.docs) {
  if (page.review !== 'approved' || !page.sources?.length) errors.push(`${page.path}: public review and sources required`);
  for (const source of page.sources ?? []) {
    if (!/^https:\/\/github\.com\/VENTIONINC\/TestPortal-(?:client|backend|cli)\/blob\/[a-f0-9]{40}\//.test(source)) errors.push(`${page.path}: source must use an audited commit permalink`);
  }
  const {data, content} = matter(await readFile(page.path, 'utf8'));
  for (const field of ['title', 'description', 'slug']) if (typeof data[field] !== 'string' || !data[field].trim()) errors.push(`${page.path}: missing ${field}`);
  if (data.draft || data.unlisted) errors.push(`${page.path}: excluded content cannot be approved`);
  if (data.slug !== page.slug || !/^\/[a-z0-9/-]+$/.test(data.slug)) errors.push(`${page.path}: invalid or mismatched slug`);
  if (routes.has(data.slug)) errors.push(`${page.path}: duplicate slug`);
  routes.add(data.slug);
  let tree;
  try { tree = unified().use(remarkParse).use(remarkMdx).parse(content); }
  catch { errors.push(`${page.path}: invalid Markdown/MDX`); continue; }
  function walk(node) {
    if (node.type === 'link' && !node.url) errors.push(`${page.path}: empty link`);
    if (node.type === 'code') {
      let issues = [];
      try {
        if (node.lang === 'json') JSON.parse(node.value);
        if (['yaml', 'yml'].includes(node.lang)) issues = yamlErrors(node.value, contract);
        if (['bash', 'sh', 'shell'].includes(node.lang)) issues = shellErrors(node.value, contract);
      } catch { issues.push(`invalid ${node.lang} example`); }
      errors.push(...issues.map(issue => `${page.path}:${node.position.start.line}: ${issue}`));
    }
    for (const child of node.children ?? []) walk(child);
  }
  walk(tree);
}
errors.push(...await scanPublicFiles(actual.map(p => resolve(p))));
// Workflow syntax and shell checks use the same validation as documentation examples.
for (const path of await filesUnder('.github/workflows')) {
  errors.push(...yamlErrors(await readFile(path, 'utf8'), contract).map(e => `${relative(root, path)}: ${e}`));
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${manifest.docs.length} approved pages, public inputs, examples, and workflow YAML.`);
