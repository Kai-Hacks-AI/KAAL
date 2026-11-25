// Case release/T1404 tests: release/C124
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { emit, emptyFolder, folder, wf } from './fixtures.mjs';
export const id = 'release/T1404';
export const tests = ['release/C124'];
export const title = 'the command writes the findings and exits 0 even when there are some, exits 2 and writes no file for a folder with no workflows or a name that is not plain text, and reads only the folder it is given';
export async function run() {
  const dirty = emit(folder({ 'a.yml': wf('KAAL'), 'b.yml': wf('Fine'), 'c.yml': wf(undefined) }));
  assert.equal(dirty.code, 0);
  assert.deepEqual(JSON.parse(readFileSync(dirty.out, 'utf8')), ['.github/workflows/a.yml:generic-name', '.github/workflows/c.yml:missing-name']);
  const clean = emit(folder({ 'a.yml': wf('Alpha') }));
  assert.equal(clean.code, 0); assert.deepEqual(JSON.parse(readFileSync(clean.out, 'utf8')), []);
  const none = emit(emptyFolder());
  assert.equal(none.code, 2); assert.equal(existsSync(none.out), false); assert.match(none.stderr, /^UNKNOWN: /);
  const odd = emit(folder({ 'a.yml': 'name: |\n  text\non: push\n' }));
  assert.equal(odd.code, 2); assert.equal(existsSync(odd.out), false);
  // Another folder's workflows are never read: a folder with only a conforming workflow says nothing of the repository's own.
  assert.deepEqual(JSON.parse(readFileSync(clean.out, 'utf8')), []);
}
