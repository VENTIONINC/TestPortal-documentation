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
    ['<p>CONTRIBUTING.md</p>', /contributor instructions/],
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

test('LLM pipeline rejects missing, stale, excluded and broken-route artifacts', async t => {
  const {root, write, run} = await fixture(t);
  await write('site-settings.json', JSON.stringify({url: 'https://example.com', baseUrl: '/project/'}));
  await write('public-content.json', JSON.stringify({docs: [{path: 'docs/intro.md', slug: '/intro', review: 'approved'}]}));
  await write('docs/intro.md', '---\ntitle: Intro\ndescription: Fixture\nslug: /intro\n---\n\n# Intro\n\n[Here](#intro)\n');
  await write('.docusaurus/docusaurus-plugin-content-docs/default/site-docs-intro.json', JSON.stringify({source: '@site/docs/intro.md', slug: '/intro', permalink: '/project/docs/intro', title: 'Intro', description: 'Fixture'}));
  await write('build/docs/intro.html', '<h1 id="intro">Intro</h1>');
  await write('build/sitemap.xml', '<urlset/>');
  const moduleUrl = new URL('../llms.mjs', import.meta.url).href;
  const generated = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import {readFile, mkdir, writeFile} from 'node:fs/promises';
    import {dirname} from 'node:path';
    import {builtDocs, expectedExports} from ${JSON.stringify(moduleUrl)};
    const outputs = await expectedExports(await builtDocs(), JSON.parse(await readFile('site-settings.json')), JSON.parse(await readFile('public-content.json')));
    for (const [path, text] of outputs) { await mkdir(dirname('build/' + path), {recursive: true}); await writeFile('build/' + path, text); }
  `], {cwd: root, encoding: 'utf8'});
  assert.equal(generated.status, 0, generated.stderr);
  assert.equal(run('validate-llms.mjs').status, 0);
  const original = await readFile(join(root, 'build/llms.txt'), 'utf8');
  for (const text of ['', original.replace('/project/', '/wrong/'), original + '\nimport X from "x";\n', original + '\nCONTRIBUTING.md\n']) {
    await write('build/llms.txt', text);
    assert.notEqual(run('validate-llms.mjs').status, 0);
  }
  await write('build/llms.txt', original);
  await write('build/private.md', '# Internal');
  assert.match(run('validate-llms.mjs').stderr, /Unexpected LLM artifact/);
  await rm(join(root, 'build/private.md'));
  await write('build/docs/intro.html', '<h1>No anchor</h1>');
  assert.match(run('validate-llms.mjs').stderr, /missing anchor/);
  await rm(join(root, 'build/docs/intro.md'));
  assert.match(run('validate-llms.mjs').stderr, /Missing LLM artifact/);
});
