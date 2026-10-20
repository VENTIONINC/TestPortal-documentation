import {readFile} from 'node:fs/promises';
import {relative, resolve} from 'node:path';
import {load} from 'cheerio';
import {filesUnder, scanPublicFiles} from './checks.mjs';
import {builtDocs, expectedExports, parser, walk} from './llms.mjs';

const settings = JSON.parse(await readFile('site-settings.json', 'utf8'));
const manifest = JSON.parse(await readFile('public-content.json', 'utf8'));
const expected = await expectedExports(await builtDocs(), settings, manifest);
const root = resolve('build');
const files = await filesUnder(root);
const paths = new Set(files.map(p => relative(root, p)));
const cachedHtml = new Map(await Promise.all([...paths].filter(p => p.endsWith('.html')).map(async p => [p, await readFile(resolve(root, p), 'utf8')])));
const errors = [];
for (const path of paths) {
  if ((/\.mdx?$/.test(path) || /^llms.*\.txt$/.test(path)) && !expected.has(path)) errors.push(`Unexpected LLM artifact: ${path}`);
}
for (const [path, expectedText] of expected) {
  if (!paths.has(path)) { errors.push(`Missing LLM artifact: ${path}`); continue; }
  const text = await readFile(resolve(root, path), 'utf8');
  if (!text.trim() || text !== expectedText) errors.push(`Incomplete, stale or altered LLM artifact: ${path}`);
  walk(parser.parse(text), node => {
    if (!['link', 'image', 'definition'].includes(node.type)) return;
    let url;
    try { url = new URL(node.url); } catch { errors.push(`${path}: nonabsolute URL`); return; }
    if (url.origin !== new URL(settings.url).origin) return;
    if (!url.pathname.startsWith(settings.baseUrl)) { errors.push(`${path}: incorrect origin/base path`); return; }
    const target = decodeURIComponent(url.pathname.slice(settings.baseUrl.length));
    const file = [target || 'index.html', target + '.html'].find(p => paths.has(p));
    if (!file) { errors.push(`${path}: missing link target ${target}`); return; }
    if (url.hash && file.endsWith('.html')) {
      // Anchor checks use rendered IDs, including Docusaurus's slugging rules.
      const $ = load(cachedHtml.get(file));
      if (!$('[id]').toArray().some(el => $(el).attr('id') === decodeURIComponent(url.hash.slice(1)))) errors.push(`${path}: missing anchor ${url.hash}`);
    }
  });
}
errors.push(...await scanPublicFiles([...expected.keys()].filter(p => paths.has(p)).map(p => resolve(root, p))));
if (!paths.has('sitemap.xml')) errors.push('Missing sitemap.xml');
if (errors.length) throw new Error(errors.join('\n'));
console.log(`Validated ${expected.size} complete, clean, public-only LLM artifacts and their links.`);
