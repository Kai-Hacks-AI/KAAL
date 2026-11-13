// Runs the Cases of coordination/C1 (the Show WIP Script and its command). T39 is the acceptance on the real repository, recorded in evidence/ and run by hand.
import { describe, it } from 'node:test';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('../plan/coordination/', import.meta.url));
const cases = readdirSync(dir).filter((f) => /^T\d+\.test\.mjs$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

describe('coordination/C1 Show WIP', () => {
  for (const file of cases) {
    it(file.replace('.test.mjs', ''), async () => {
      const mod = await import(pathToFileURL(join(dir, file)).href);
      await mod.run();
    });
  }
});
