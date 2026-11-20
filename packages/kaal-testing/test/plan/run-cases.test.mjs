// testing/C63 Cases (T363 to T369), run in Testing's npm test. Each Case file exports id, tests, title and run().
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'run-cases');
describe('Run Cases and report their outcomes (testing/C63)', () => {
  for (const f of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(f, { timeout: 600000 }, async () => {
      const m = await import(pathToFileURL(join(dir, f)).href);
      await m.run();
    });
  }
});
