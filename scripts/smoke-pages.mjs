import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {setTimeout} from 'node:timers/promises';
import matter from 'gray-matter';
import {publicContentErrors} from './checks.mjs';

const deadline = globalThis.setTimeout(() => {
  console.error('HTTP smoke exceeded its four-minute deadline');
  process.exit(1);
}, 240000);
deadline.unref();

const settings = JSON.parse(await readFile('site-settings.json', 'utf8'));
const manifest = JSON.parse(await readFile('public-content.json', 'utf8'));
const base = new URL(settings.baseUrl, process.env.DOCS_SMOKE_ORIGIN || settings.url);
const publicBase = new URL(settings.baseUrl, settings.url);
const paths = ['', ...manifest.docs.map(p => 'docs' + p.slug), 'llms.txt', 'llms-full.txt', 'sitemap.xml', ...manifest.docs.map(p => 'docs' + p.slug + '.md')];
const assets = new Set();
const navigation = new Set();
const responses = new Map();
async function get(path) {
  if (responses.has(path)) return responses.get(path);
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(new URL(path, base), {signal: AbortSignal.timeout(10000), redirect: 'error'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!text.trim()) throw new Error('empty body');
      responses.set(path, text);
      return text;
    } catch (error) {
      failure = error;
      if (attempt < 2) await setTimeout(2000);
    }
  }
  throw new Error(`${path || '/'}: ${failure.message}`);
}
for (const path of paths) {
  const text = await get(path);
  const issues = publicContentErrors(text, path || 'homepage');
  if (issues.length) throw new Error(issues.join('\n'));
  if (path.endsWith('.md')) {
    const source = manifest.docs.find(p => 'docs' + p.slug + '.md' === path);
    const {content} = matter(await readFile(source.path, 'utf8'));
    // Code fences must survive deployment; a soft 404 cannot satisfy this check.
    const heading = content.match(/^# .+$/m)?.[0];
    if (!heading || !text.includes(heading)) throw new Error(`${path}: incorrect Markdown content`);
  } else if (path.endsWith('.txt')) {
    if (!text.startsWith('# Test Portal\n') || !text.includes(publicBase.href)) throw new Error(`${path}: incorrect LLM content`);
    if (path === 'llms.txt') for (const p of manifest.docs) {
      if (!text.includes(new URL('docs' + p.slug + '.md', publicBase).href)) throw new Error(`${path}: missing export link`);
    }
  } else if (path.endsWith('.xml')) {
    const $ = load(text, {xmlMode: true});
    const urls = $('loc').toArray().map(el => $(el).text());
    for (const route of ['', ...manifest.docs.map(p => 'docs' + p.slug)]) if (!urls.includes(new URL(route, publicBase).href)) throw new Error(`sitemap: missing ${route}`);
  } else {
    const $ = load(text);
    if (!$('h1').text().trim() || !$('title').text().includes('Test Portal')) throw new Error(`${path}: incorrect page`);
    const page = manifest.docs.find(p => 'docs' + p.slug === path);
    if (page) {
      const {data} = matter(await readFile(page.path, 'utf8'));
      if (!$('title').text().includes(data.title)) throw new Error(`${path}: incorrect title`);
    }
    for (const el of $('a[href],link[rel="stylesheet"][href],script[src]').toArray()) {
      const value = $(el).attr('href') ?? $(el).attr('src');
      const url = new URL(value, new URL(path, base));
      if (![base.origin, publicBase.origin].includes(url.origin)) continue;
      if (!url.pathname.startsWith(settings.baseUrl)) throw new Error(`${path}: incorrect asset/navigation base path`);
      const target = url.pathname.slice(settings.baseUrl.length);
      if (el.tagName === 'a') navigation.add(target);
      else assets.add(target);
    }
  }
}
for (const path of [...assets, ...navigation]) await get(path);
if (![...assets].some(p => p.endsWith('.css')) || ![...assets].some(p => p.endsWith('.js'))) throw new Error('Missing stylesheets or JavaScript');
console.log(`HTTP smoke passed: ${paths.length} pages/exports/sitemap, ${assets.size} assets, ${navigation.size} navigation targets at ${base.href}`);
