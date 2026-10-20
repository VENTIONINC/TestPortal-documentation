import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {relative} from 'node:path';
import {filesUnder} from './checks.mjs';

async function snapshot() {
  const paths = (await filesUnder('build')).filter(p => /(?:\.md|\/llms(?:-full)?\.txt)$/.test(p));
  if (!paths.length) throw new Error('Build and validate LLM exports before checking stability');
  return Promise.all(paths.map(async p => [relative('build', p), createHash('sha256').update(await readFile(p)).digest('hex')]));
}
const before = await snapshot();
execFileSync('npm', ['run', 'build'], {stdio: 'inherit'});
execFileSync('npm', ['run', 'check:llms'], {stdio: 'inherit'});
const after = await snapshot();
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('LLM artifacts changed between production builds');
console.log(`Repeated production builds produced identical bytes for ${after.length} LLM artifacts.`);
