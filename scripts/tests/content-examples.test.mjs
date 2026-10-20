import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, mkdtemp, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {shellErrors} from '../checks.mjs';

const contract = JSON.parse(await readFile(new URL('../cli-contract.json', import.meta.url), 'utf8'));

test('pinned npm installation is distinct from package execution', () => {
  const pinned = `${contract.packageName}@${contract.version}`;
  assert.deepEqual(shellErrors(`npm install --global ${pinned}`, contract), []);
  assert.ok(shellErrors(`npx ${pinned}`, contract).includes('CLI input is required'));
  assert.deepEqual(shellErrors(`npx ${pinned} -i report.json -t playwright`, contract), []);
});

async function normalizer(t, name, data) {
  const dir = await mkdtemp(join(tmpdir(), 'portal-normalize-'));
  t.after(() => rm(dir, {recursive: true, force: true}));
  const page = await readFile(new URL(`../../docs/integrations/${name}.md`, import.meta.url), 'utf8');
  const code = page.match(/```javascript\n([\s\S]*?)\n```/)[1];
  await writeFile(join(dir, 'normalize.cjs'), code);
  await writeFile(join(dir, 'input.json'), JSON.stringify(data));
  const result = spawnSync(process.execPath, ['normalize.cjs', 'input.json', 'output.json'], {cwd: dir, encoding: 'utf8'});
  return {result, output: result.status === 0 ? JSON.parse(await readFile(join(dir, 'output.json'), 'utf8')) : null};
}

test('Jest recipe adapts standard JSON names and rejects count loss', async t => {
  const input = {numTotalTests: 1, testResults: [{name: 'example.test.js', startTime: 100, endTime: 125, assertionResults: [{title: 'check'}]}]};
  const good = await normalizer(t, 'jest', input);
  assert.equal(good.result.status, 0);
  assert.equal(good.output.testResults[0].testFilePath, 'example.test.js');
  assert.equal(good.output.testResults[0].perfStats.runtime, 25);
  const bad = await normalizer(t, 'jest', {...input, numTotalTests: 2});
  assert.notEqual(bad.result.status, 0);
  assert.match(bad.result.stderr, /count mismatch/);
});

test('Cypress recipe preserves nested tests and full titles and rejects count loss', async t => {
  const input = {stats: {tests: 2}, results: [{file: 'example.cy.js', tests: [{title: 'root', fullTitle: 'root', state: 'passed'}], suites: [{title: 'child', tests: [{title: 'fails', fullTitle: 'child fails', state: 'failed'}], suites: []}]}]};
  const good = await normalizer(t, 'cypress', input);
  assert.equal(good.result.status, 0);
  assert.equal(good.output.results.length, 2);
  assert.equal(good.output.results[1].file, 'example.cy.js');
  assert.deepEqual(good.output.results[1].tests[0].title, ['fails']);
  assert.equal(good.output.results[1].tests[0].fullTitle, 'child fails');
  const bad = await normalizer(t, 'cypress', {...input, stats: {tests: 3}});
  assert.notEqual(bad.result.status, 0);
  assert.match(bad.result.stderr, /count mismatch/);
  const unknown = structuredClone(input);
  unknown.results[0].tests[0].state = 'unknown';
  assert.notEqual((await normalizer(t, 'cypress', unknown)).result.status, 0);
});
