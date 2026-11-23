// testing/C78 outer Cases, run in Testing's npm test once the DO wires them. Each Case file exports id, tests, title and run().
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'act-library-sensitivity');
describe('ACT library sensitivity (testing/C78)', () => {
  for (const f of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(f, async () => {
      const m = await import(pathToFileURL(join(dir, f)).href);
      await m.run();
    });
  }
});
