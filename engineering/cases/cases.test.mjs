// Runs every engineering Case (engineering/<scope>/00-changes/<change>/T<n>.test.mjs) as one test named by its own id,
// so the job log holds "✔ <scope>/T<n>" or "✖ <scope>/T<n>" per Case (pull/F35). A Case that throws is a failed test;
// a Case file that cannot be loaded or has no scoped id is a failed test too, never skipped.
// KAAL_CASES_ROOT replaces the engineering folder (the fixtures of Case pull/T34).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = process.env.KAAL_CASES_ROOT ?? join(here, '..');

const files = [];
for (const scope of readdirSync(root).sort()) {
  const changes = join(root, scope, '00-changes');
  if (!existsSync(changes)) continue;
  for (const change of readdirSync(changes).sort()) {
    for (const f of readdirSync(join(changes, change)).sort()) if (/^T\d+\.test\.mjs$/.test(f)) files.push(join(changes, change, f));
  }
}
files.sort((a, b) => (a.replace(/.*\/T/, '').match(/\d+/)[0] - b.replace(/.*\/T/, '').match(/\d+/)[0]) || a.localeCompare(b));

for (const file of files) {
  const rel = relative(root, file);
  let loaded;
  try { loaded = await import(pathToFileURL(file).href); } catch (error) { loaded = { error }; }
  const named = typeof loaded.id === 'string' && /^[a-z][a-z-]*\/T\d+$/.test(loaded.id);
  const label = named ? `${loaded.id} (${[loaded.tests ?? []].flat().join(', ')}): ${loaded.title ?? ''}` : `unnamed Case file ${rel}`;
  test(label, async () => {
    if (loaded.error) throw loaded.error;
    assert.ok(named, `${rel} exports no scoped id`);
    assert.equal(typeof loaded.run, 'function', `${rel} exports no run()`);
    await loaded.run();
  });
}
