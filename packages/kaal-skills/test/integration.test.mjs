// skills/C1 Cases, run in kaal-skills' npm test. Each Case file exports id, tests, title and run(). They are the planned Cases, unchanged.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'plan/integration-readiness');
describe('Skill integration readiness (skills/C1)', async () => {
  for (const f of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    const m = await import(pathToFileURL(join(dir, f)).href);
    it(`${m.id} (${m.tests.join(', ')}): ${m.title}`, async () => { await m.run(); });
  }
});
