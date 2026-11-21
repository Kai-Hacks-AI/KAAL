// Case release/T1354 tests: release/C123
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { LIB, OWN_PATH, makeFolders } from './attribution-fixtures.mjs';
export const id = 'release/T1354';
export const tests = ['release/C123'];
export const title = 'a conflict resolution is the collector\'s own: a path that equals neither the collector before nor main in the result is attributed to the collector';
export async function run() {
  const f = makeFolders([{ path: OWN_PATH, before: 'the collector\'s version\n', after: 'a resolution of both\n', contained: 'main\'s version\n' }]);
  try {
    const { attributeChanges } = await import(pathToFileURL(LIB).href);
    const a = attributeChanges({ before: f.before, after: f.after, contained: f.contained });
    assert.deepEqual(a.own, [OWN_PATH]); assert.deepEqual(a.inherited, []); assert.equal(a.complete, true);
  } finally { f.cleanup(); }
}
