// Case release/T1356 tests: release/C123
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LIB, RUNNER, RM, OWN_PATH, makeFolders } from './attribution-fixtures.mjs';
export const id = 'release/T1356';
export const tests = ['release/C123'];
export const title = 'unavailable or ambiguous provenance is UNKNOWN, never an invented own path and never a free PASS: with a folder absent or unreadable no judge answers PASS or FAIL';
export async function run() {
  const f = makeFolders([{ path: OWN_PATH, before: 'old\n', after: 'new\n', contained: 'old\n' }]);
  try {
    const { attributeChanges } = await import(pathToFileURL(LIB).href);
    const { readTree } = await import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
    const { judgeOf } = await import(pathToFileURL(RUNNER).href);
    for (const [name, dirs, missing] of [['contained', { before: f.before, after: f.after, contained: join(f.after, 'nowhere') }, 'contained'], ['before', { before: undefined, after: f.after, contained: f.contained }, 'before'], ['unreadable', { before: join(f.after, OWN_PATH), after: f.after, contained: f.contained }, 'unreadable']]) {
      const a = attributeChanges(dirs);
      assert.equal(a.complete, false, name); assert.deepEqual(a.own, [], name); assert.deepEqual(a.inherited, [], name); assert.match(a.missing.join(' '), new RegExp(missing), name);
      for (const j of ['limit', 'demand', 'verify', 'hold']) {
        const r = judgeOf(j, await readTree({ main: f.main, collector: f.after, changed: a.own }), f.after, a);
        assert.equal(r.verdict, 'UNKNOWN', `${j} with ${name} gone answers ${r.verdict}`); assert.match(r.message, /cannot tell what the pull request changed itself/);
      }
    }
  } finally { f.cleanup(); }
}
