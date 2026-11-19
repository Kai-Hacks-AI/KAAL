// testing/C66 Cases (T370 to T373), run in Testing's npm test. Each Case file exports id, tests, title and run().
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'standalone');
describe('An installed kaal-testing stands alone (testing/C66)', () => {
  for (const f of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(f, { timeout: 600000 }, async () => {
      const m = await import(pathToFileURL(join(dir, f)).href);
      await m.run();
    });
  }
});
