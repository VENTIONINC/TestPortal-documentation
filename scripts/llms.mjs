import {readFile} from 'node:fs/promises';
import {posix} from 'node:path';
import matter from 'gray-matter';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import {filesUnder, publicContentErrors} from './checks.mjs';

export const parser = unified().use(remarkParse).use(remarkMdx);
export function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

// Consume the docs plugin's resolved metadata, never infer routes from filenames.
export async function builtDocs() {
  const files = await filesUnder('.docusaurus/docusaurus-plugin-content-docs/default');
  return Promise.all(files.filter(p => /\/site-docs-.*\.json$/.test(p)).map(async p => JSON.parse(await readFile(p, 'utf8'))));
}

export function cleanMarkdown(content, source, pages, settings) {
  const tree = parser.parse(content);
  const edits = [];
  const base = new URL(settings.baseUrl, settings.url);
  const page = pages.find(p => p.path === source);
  walk(tree, node => {
    if (node.type === 'mdxjsEsm') {
      edits.push({start: node.position.start.offset, end: node.position.end.offset, text: ''});
    }
    // Components/expressions can contain rendered text in props. Fail rather than
    // silently omit it; authors must provide ordinary Markdown before publishing.
    if (/^mdx(?:Jsx|FlowExpression|TextExpression)/.test(node.type) || node.type === 'html') {
      throw new Error(`${source}: unsupported rendered syntax; use plain Markdown for exports`);
    }
    if (!['link', 'image', 'definition'].includes(node.type)) return;
    const value = node.url;
    let target;
    if (/^(?:https?:|mailto:|tel:)/.test(value)) {
      const url = new URL(value);
      if (url.origin !== base.origin) return;
      if (!url.pathname.startsWith(settings.baseUrl)) throw new Error(`${source}: link outside configured base path`);
      target = url.href;
    } else if (value.startsWith('#')) {
      target = new URL(page.permalink + value, base.origin).href;
    } else {
      const [, pathname, suffix] = value.match(/^([^?#]*)(.*)$/s);
      if (pathname.startsWith('/')) {
        const route = pathname.startsWith(settings.baseUrl) ? pathname : settings.baseUrl + pathname.replace(/^\//, '');
        target = new URL(route + suffix, base.origin).href;
      } else {
        const path = posix.normalize(posix.join(posix.dirname(source), decodeURIComponent(pathname)));
        const doc = pages.find(p => p.path === path);
        if (!doc) throw new Error(`${source}: unresolved source link ${value}`);
        target = new URL(doc.permalink + suffix, base.origin).href;
      }
    }
    const raw = content.slice(node.position.start.offset, node.position.end.offset);
    const at = node.type === 'definition' ? raw.indexOf(value, raw.indexOf(']:') + 2) : raw.indexOf(value, raw.lastIndexOf('](') + 2);
    if (at < 0) throw new Error(`${source}: unsupported link syntax`);
    edits.push({start: node.position.start.offset + at, end: node.position.start.offset + at + value.length, text: target});
  });
  let result = content;
  for (const edit of edits.sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  result = result.trim() + '\n';
  const errors = publicContentErrors(result, source);
  if (errors.length) throw new Error(errors.join('\n'));
  return result;
}

const categories = [
  ['Overview', '/intro'], ['Getting Started', '/getting-started'],
  ['User Guides', '/guides'], ['Integrations', '/integrations'],
  ['CLI', '/cli'], ['REST API', '/api'], ['MCP', '/mcp'], ['Troubleshooting', '/troubleshooting'],
];

export async function expectedExports(metadata, settings, manifest) {
  const pages = [];
  const approved = new Set(manifest.docs.map(p => p.path));
  for (const doc of metadata) {
    const path = doc.source?.replace(/^@site\//, '');
    if (doc.draft || doc.unlisted || !approved.has(path)) throw new Error('Unapproved or unpublished resolved document');
  }
  for (const entry of manifest.docs) {
    const matches = metadata.filter(d => d.source === `@site/${entry.path}`);
    if (matches.length !== 1 || entry.review !== 'approved') throw new Error(`${entry.path}: missing/ambiguous approved route`);
    const doc = matches[0];
    if (doc.slug !== entry.slug || !doc.permalink.startsWith(settings.baseUrl)) throw new Error(`${entry.path}: route mismatch`);
    const {content, data} = matter(await readFile(entry.path, 'utf8'));
    if (data.draft || data.unlisted || data.slug !== doc.slug) throw new Error(`${entry.path}: source metadata mismatch`);
    const category = categories.find(([, slug]) => doc.slug === slug || doc.slug.startsWith(slug + '/'));
    if (!category) throw new Error(`${entry.path}: add an explicit export category`);
    pages.push({...entry, ...doc, path: entry.path, content, category: category[0]});
  }
  pages.sort((a, b) => categories.findIndex(c => c[0] === a.category) - categories.findIndex(c => c[0] === b.category) || a.slug.localeCompare(b.slug, 'en'));
  const outputs = new Map();
  let index = '# Test Portal\n\n> Unified Test Reporting and Analytics\n';
  let full = '# Test Portal\n\n> Unified Test Reporting and Analytics\n';
  for (const [category] of categories) {
    index += `\n## ${category}\n\n`;
    for (const page of pages.filter(p => p.category === category)) {
      const body = cleanMarkdown(page.content, page.path, pages, settings);
      const path = page.permalink.slice(settings.baseUrl.length) + '.md';
      if (!/^docs\/[a-z0-9/-]+\.md$/.test(path) || outputs.has(path)) throw new Error('Unsafe or duplicate Markdown export path');
      outputs.set(path, body);
      index += `- [${page.title.replace(/[\\[\]]/g, '\\$&')}](${new URL(page.permalink + '.md', settings.url).href}): ${page.description}\n`;
      full += `\n---\n\nSource: ${new URL(page.permalink, settings.url).href}\n\n${body}`;
    }
  }
  outputs.set('llms.txt', index);
  outputs.set('llms-full.txt', full);
  return outputs;
}
