// Runs every engineering Case (engineering/<scope>/0n-*/**/T<n>.test.mjs) as one test named by its own id,
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

// A Case file is engineering/<scope>/<00-changes | 01-intent .. 06-*>/**/T<n>.test.mjs, at any depth (the declaration's shape).
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
const files = [];
for (const scope of readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
  const base = join(root, scope);
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.isDirectory() && /^0[0-6]-/.test(entry.name)) for (const f of walk(join(base, entry.name))) if (/\/T\d+\.test\.mjs$/.test(f)) files.push(f);
  }
}
files.sort((a, b) => (a.match(/T(\d+)\.test\.mjs$/)[1] - b.match(/T(\d+)\.test\.mjs$/)[1]) || a.localeCompare(b));

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
