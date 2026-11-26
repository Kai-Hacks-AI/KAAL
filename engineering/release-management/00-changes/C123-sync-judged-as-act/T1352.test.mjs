// Case release/T1352 tests: release/C123
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LIB, RUNNER, RM, makeFolders } from './isolation-fixtures.mjs';
export const id = 'release/T1352';
export const tests = ['release/C123'];
export const title = 'a pure SYNC brings nothing of its own: every changed path equals what main holds in the result, so isolate Changes finds no own path and limit Act answers "not an ACT"';
export async function run() {
  const f = makeFolders([{ path: 'engineering/cap/00-changes/C2-first-thing/C2.md', before: null, after: 'from main\n' }, { path: 'engineering/cap/02-learnings/retros/RT9.md', before: null, after: 'from main\n' }, { path: '.github/workflows/x.yml', before: 'old\n', after: 'from main\n' }]);
  try {
    const { isolateChanges } = await import(pathToFileURL(LIB).href);
    const a = isolateChanges({ before: f.before, after: f.after, contained: f.contained });
    assert.equal(a.complete, true); assert.deepEqual(a.own, []);
    assert.deepEqual(a.inherited, ['.github/workflows/x.yml', 'engineering/cap/00-changes/C2-first-thing/C2.md', 'engineering/cap/02-learnings/retros/RT9.md']);
    const { readTree } = await import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
    const { judgeOf } = await import(pathToFileURL(RUNNER).href);
    for (const j of ['limit', 'demand', 'verify', 'hold']) {
      const r = judgeOf(j, await readTree({ main: f.main, collector: f.after, changed: a.own }), f.after, a);
      assert.equal(r.verdict, 'PASS', `${j} Act answers ${r.verdict}: ${r.message}`); assert.equal(r.applies, false); assert.match(r.message, /not an ACT/);
    }
  } finally { f.cleanup(); }
}
