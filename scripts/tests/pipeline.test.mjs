import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'testportal-check-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  async function write(path, text) {
    await mkdir(join(root, path, '..'), {recursive: true});
    await writeFile(join(root, path), text);
  }
  function run(script) {
    return spawnSync(process.execPath, [fileURLToPath(new URL(`../${script}`, import.meta.url))], {cwd: root, encoding: 'utf8'});
  }
  return {root, write, run};
}

test('source pipeline rejects invalid examples, metadata, and unreviewed inputs', async t => {
  const {root, write, run} = await fixture(t);
  for (const path of ['docs', 'src', 'static', '.github/workflows']) await mkdir(join(root, path), {recursive: true});
  await write('scripts/cli-contract.json', await readFile(new URL('../cli-contract.json', import.meta.url)));
  await write('public-content.json', JSON.stringify({docs: [{path: 'docs/check.md', slug: '/check', review: 'approved', sources: [`https://github.com/VENTIONINC/TestPortal-cli/blob/${'a'.repeat(40)}/src/cli.ts`]}], siteFiles: []}));
  const page = '---\ntitle: Check\ndescription: Valid fixture\nslug: /check\n---\n\n# Check\n';
  await write('docs/check.md', page);
  assert.equal(run('validate-docs.mjs').status, 0);
  await write('docs/check.md', page + '\n```json\n{broken}\n```\n');
  assert.match(run('validate-docs.mjs').stderr, /invalid json example/);
  await write('docs/check.md', page.replace('description: Valid fixture\n', ''));
  assert.match(run('validate-docs.mjs').stderr, /missing description/);
  await write('docs/check.md', page);
  await write('static/private.txt', 'unreviewed');
  assert.match(run('validate-docs.mjs').stderr, /Unreviewed public input/);
});

test('artifact pipeline rejects missing artifacts, broken targets, bad base paths and excluded content', async t => {
  const {root, write, run} = await fixture(t);
  await write('site-settings.json', JSON.stringify({url: 'https://ventioninc.github.io', baseUrl: '/TestPortal-documentation/'}));
  await write('public-content.json', JSON.stringify({docs: []}));
  for (const page of ['index.html', '404.html', 'search.html']) await write(`build/${page}`, '<html><body><h1 id="intro">Test Portal</h1></body></html>');
  await write('build/sitemap.xml', '<urlset><url><loc>https://ventioninc.github.io/TestPortal-documentation/</loc></url></urlset>');
  await write('build/.nojekyll', '');
  await write('build/search-index.json', '[]');
  assert.equal(run('validate-artifacts.mjs').status, 0);
  for (const [html, pattern] of [
    ['<a href="/TestPortal-documentation/missing">Broken</a>', /missing target/],
    ['<img src="/assets/missing.svg">', /incorrect base path/],
    ['<a href="#missing">Missing heading</a>', /missing anchor/],
    ['<p>MIGRATION.md</p>', /migration inventory/],
  ]) {
    await write('build/index.html', html);
    const result = run('validate-artifacts.mjs');
    assert.equal(result.status, 1);
    assert.match(result.stderr, pattern);
  }
  await write('build/index.html', '<h1>Test Portal</h1>');
  await rm(join(root, 'build/sitemap.xml'));
  assert.match(run('validate-artifacts.mjs').stderr, /Missing artifact: sitemap.xml/);
});
