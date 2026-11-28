// review/C8: runs the Cases of the Approver (review/T1587 to review/T1589) against the delivered judgements and declaration.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'plan/approver-app');

describe('the Cases of review/C8', () => {
  for (const file of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(file, async () => {
      const m = await import(pathToFileURL(join(dir, file)).href);
      await m.run();
    });
  }
});
