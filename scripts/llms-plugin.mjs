import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {expectedExports} from './llms.mjs';

export default function llmsPlugin() {
  let versions;
  return {
    name: 'approved-public-llms',
    async allContentLoaded({allContent}) {
      versions = allContent['docusaurus-plugin-content-docs'].default.loadedVersions;
    },
    async postBuild({outDir, siteConfig}) {
      const manifest = JSON.parse(await readFile('public-content.json', 'utf8'));
      if (versions.length !== 1) throw new Error('LLM exports require a reviewed single-version setup');
      const outputs = await expectedExports(versions.flatMap(v => v.docs), siteConfig, manifest);
      for (const [path, text] of outputs) {
        const destination = join(outDir, path);
        await mkdir(dirname(destination), {recursive: true});
        await writeFile(destination, text);
      }
      console.log(`Generated ${outputs.size - 2} approved Markdown exports and both LLM files.`);
    },
  };
}
