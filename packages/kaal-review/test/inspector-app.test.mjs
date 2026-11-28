// review/C6: runs the Cases of the Inspector (review/T1535 to review/T1538) against the delivered judgements and declaration.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'plan/inspector-app');

describe('the Cases of review/C6', () => {
  for (const file of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(file, async () => {
      const m = await import(pathToFileURL(join(dir, file)).href);
      await m.run();
    });
  }
});
