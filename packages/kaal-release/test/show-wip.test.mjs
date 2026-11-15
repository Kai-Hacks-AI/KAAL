// Runs the Cases of coordination/C1 (the Show WIP Script and its command) and of coordination/C2 (the review sequence).
// Each Case lives in test/coordination/T<n>.test.mjs and is reported under its scoped id, as "<id> (<tests>): <title>", the id the host's execution record carries.
// T39 is the acceptance on the real repository, recorded in evidence/ and run by hand.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const dir = fileURLToPath(new URL('./coordination/', import.meta.url));
const files = readdirSync(dir).filter((f) => /^T\d+\.test\.mjs$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

for (const file of files) {
  let loaded;
  try { loaded = await import(pathToFileURL(join(dir, file)).href); } catch (error) { loaded = { error }; }
  const named = typeof loaded.id === 'string' && /^[a-z][a-z-]*\/T\d+$/.test(loaded.id);
  const label = named ? `${loaded.id} (${[loaded.tests ?? []].flat().join(', ')}): ${loaded.title ?? ''}` : `unnamed Case file ${file}`;
  test(label, async () => {
    if (loaded.error) throw loaded.error;
    assert.ok(named, `${file} exports no scoped id`);
    assert.equal(loaded.id, `coordination/${file.replace('.test.mjs', '')}`, `${file} exports an id its path does not name`);
    await loaded.run();
  });
}
