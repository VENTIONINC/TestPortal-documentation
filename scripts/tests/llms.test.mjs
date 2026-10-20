import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'yaml';
import {cleanMarkdown, expectedExports} from '../llms.mjs';

const settings = {url: 'https://example.com', baseUrl: '/project/'};
const pages = [
  {path: 'docs/start.md', permalink: '/project/docs/custom-start'},
  {path: 'docs/section/index.md', permalink: '/project/docs/section'},
];
test('exports follow resolved slugs and rewrite index/source links, fragments and queries', () => {
  const input = '# Start\n\n[Section](section/index.md?q=one#heading) and [here](#start).\n\n```js\nimport x from "x";\n```\n';
  const output = cleanMarkdown(input, 'docs/start.md', pages, settings);
  assert.match(output, /https:\/\/example.com\/project\/docs\/section\?q=one#heading/);
  assert.match(output, /https:\/\/example.com\/project\/docs\/custom-start#start/);
  assert.ok(output.includes('```js\nimport x from "x";\n```'));
});
test('imports are removed outside code while unsupported rendered components fail', () => {
  assert.equal(cleanMarkdown('import X from "x";\n\n# Start', 'docs/start.md', pages, settings), '# Start\n');
  assert.throws(() => cleanMarkdown('<Widget value="important" />', 'docs/start.md', pages, settings), /unsupported rendered syntax/);
  assert.throws(() => cleanMarkdown('[Missing](private.md)', 'docs/start.md', pages, settings), /unresolved source link/);
  assert.ok(cleanMarkdown('[Local](/docs/section)', 'docs/start.md', pages, settings).includes('/project/docs/section'));
});
test('unapproved, draft and unresolved routes cannot enter generation', async () => {
  await assert.rejects(expectedExports([{source: '@site/private.md'}], settings, {docs: []}), /Unapproved/);
  await assert.rejects(expectedExports([{source: '@site/docs/start.md', draft: true}], settings, {docs: [{path: 'docs/start.md'}]}), /Unapproved/);
  await assert.rejects(expectedExports([], settings, {docs: [{path: 'docs/start.md', review: 'approved'}]}), /missing\/ambiguous/);
});
test('deployment is main-only, validation-gated and grants write permissions only to deploy', async () => {
  const workflow = parse(await readFile('.github/workflows/deploy.yml', 'utf8'));
  assert.deepEqual(workflow.on, {push: {branches: ['main']}});
  assert.deepEqual(workflow.permissions, {contents: 'read'});
  assert.equal(workflow.jobs.deploy.needs, 'build');
  assert.deepEqual(workflow.jobs.deploy.permissions, {pages: 'write', 'id-token': 'write'});
  assert.equal(workflow.jobs.deploy.environment.name, 'github-pages');
  assert.ok(workflow.jobs.build.steps.some(s => s.run === 'npm run validate'));
  assert.ok(workflow.jobs.build.steps.some(s => s.uses?.startsWith('actions/upload-pages-artifact@')));
  assert.ok(workflow.jobs.deploy.steps.some(s => s.uses?.startsWith('actions/deploy-pages@')));
  assert.equal(workflow.jobs.smoke.needs, 'deploy');
  assert.equal(workflow.concurrency['cancel-in-progress'], false);
});
