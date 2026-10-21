import {readFile, stat} from 'node:fs/promises';
import {resolve, relative, extname} from 'node:path';
import {load} from 'cheerio';
import {filesUnder, scanPublicFiles} from './checks.mjs';

const settings = JSON.parse(await readFile('site-settings.json', 'utf8'));
const manifest = JSON.parse(await readFile('public-content.json', 'utf8'));
const root = resolve('build');
const files = await filesUnder(root);
const paths = new Set(files.map(p => relative(root, p)));
const errors = [];
const base = new URL(settings.baseUrl, settings.url);
const expectedHtml = new Set(['index.html', '404.html', 'search.html', ...manifest.docs.map(p => `docs${p.slug}.html`)]);
for (const path of paths) {
  if (path.endsWith('.html') && !expectedHtml.has(path)) errors.push(`Unexpected public page: ${path}`);
  if (/(?:^|\/)(?:CONTRIBUTING\.md|README\.md|public-content\.json|scripts|openspec|\.env)(?:\/|$)/i.test(path)) errors.push(`Excluded artifact: ${path}`);
}
for (const required of [...expectedHtml, 'sitemap.xml', '.nojekyll']) {
  if (!paths.has(required)) errors.push(`Missing artifact: ${required}`);
  else if (required !== '.nojekyll' && (await stat(resolve(root, required))).size === 0) errors.push(`Empty artifact: ${required}`);
}
if (![...paths].some(p => /search-index.*\.json$/.test(p))) errors.push('Missing local search index');
const html = new Map();
for (const path of paths) if (extname(path) === '.html') html.set(path, load(await readFile(resolve(root, path), 'utf8')));
function localTarget(url) {
  if (!url.pathname.startsWith(settings.baseUrl)) return null;
  const path = decodeURIComponent(url.pathname.slice(settings.baseUrl.length)).replace(/\/$/, '');
  return [path || 'index.html', `${path}.html`, `${path.replace(/\/$/, '')}/index.html`].find(p => paths.has(p));
}
for (const [path, $] of html) {
  const pageUrl = new URL(path === 'index.html' ? '' : path.replace(/\.html$/, ''), base);
  for (const element of $('a[href],link[href],script[src],img[src],source[src]').toArray()) {
    const value = $(element).attr('href') ?? $(element).attr('src');
    if (!value || /^(?:mailto:|tel:|data:|javascript:)/.test(value)) continue;
    const url = new URL(value, pageUrl);
    if (url.origin !== base.origin) continue;
    const target = localTarget(url);
    if (!target) { errors.push(`${path}: missing target or incorrect base path: ${url.pathname}`); continue; }
    if (url.hash && html.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      const targetDoc = html.get(target);
      if (!targetDoc('[id],a[name]').toArray().some(el => targetDoc(el).attr('id') === id || targetDoc(el).attr('name') === id)) errors.push(`${path}: missing anchor ${url.hash} in ${target}`);
    }
  }
}
if (paths.has('sitemap.xml')) {
  const sitemap = load(await readFile(resolve(root, 'sitemap.xml'), 'utf8'), {xmlMode: true});
  for (const el of sitemap('loc').toArray()) {
    const url = new URL(sitemap(el).text());
    if (url.origin !== base.origin || !localTarget(url)) errors.push(`Invalid sitemap URL: ${url.href}`);
  }
}
errors.push(...await scanPublicFiles(files));
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${html.size} HTML pages, local links/assets/anchors, sitemap, search index, and public output.`);
