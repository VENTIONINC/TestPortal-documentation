import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publicContentErrors, shellErrors, yamlErrors} from '../checks.mjs';

const contract = JSON.parse(await readFile(new URL('../cli-contract.json', import.meta.url), 'utf8'));

test('CLI examples require input, provider, and supported options', () => {
  assert.deepEqual(shellErrors('npx test-portal-cli -i report.json -t playwright --stdout', contract), []);
  assert.deepEqual(shellErrors('test-portal-cli -h', contract), []);
  assert.deepEqual(shellErrors('test-portal-cli -i a.json -t jest\ntest-portal-cli -i b.json -t playwright', contract), []);
  assert.ok(shellErrors('npx test-portal-cli report.json', contract).length);
  assert.ok(shellErrors('test-portal-cli -i report.json -t unknown', contract).length);
  assert.ok(shellErrors('test-portal-cli -i report.json -t jest --imaginary', contract).length);
  assert.ok(shellErrors('echo "unterminated', contract).length);
});

test('report upload examples require multipart file and API-key header', () => {
  assert.deepEqual(shellErrors('curl -X POST https://portal.example.com/api/v2/upload-ctrf-report-api-key -H "X-API-Key: $TEST_PORTAL_API_KEY" -F "report=@report.json"', contract), []);
  assert.ok(shellErrors('curl https://portal.example.com/api/v2/upload-ctrf-report-api-key -d "{}"', contract).length);
});

test('public-content checks reject leaked values and private references', () => {
  for (const text of [
    '-----BEGIN PRIVATE KEY-----',
    'ghp_' + 'a'.repeat(36),
    '/Users/example/private.txt',
    'https://service.internal/api',
    'https://yt-wod.ventionteams.com',
    'CONTRIBUTING.md',
    'docs/engineering/private.md',
    'api_key="' + 's'.repeat(24) + '"',
  ]) assert.ok(publicContentErrors(text, 'fixture').length, text);
  assert.deepEqual(publicContentErrors('https://portal.example.com/api/v2/mcp\nTEST_PORTAL_API_KEY="$TEST_PORTAL_API_KEY"', 'fixture'), []);
});

test('workflow examples reject duplicate keys, shell errors, and absent environment inputs', () => {
  assert.ok(yamlErrors('name: one\nname: two', contract).length);
  const workflow = 'on: push\njobs:\n  test:\n    steps:\n      - run: echo "$TEST_PORTAL_API_KEY"\n';
  assert.ok(yamlErrors(workflow, contract).includes('workflow must supply TEST_PORTAL_API_KEY in env'));
  assert.deepEqual(yamlErrors(workflow + '        env:\n          TEST_PORTAL_API_KEY: ${{ secrets.TEST_PORTAL_API_KEY }}\n', contract), []);
});
