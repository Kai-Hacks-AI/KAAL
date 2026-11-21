// Case release/T1353 tests: release/C123
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LIB, RUNNER, RM, OWN_PATH, makeFolders } from './attribution-fixtures.mjs';
export const id = 'release/T1353';
export const tests = ['release/C123'];
export const title = 'mixed contributions: the collector\'s own path is judged and a FAIL on it stays a FAIL, while what main brought in the same pull request is not named';
export async function run() {
  const f = makeFolders([{ path: OWN_PATH, before: 'old\n', after: 'the collector\'s own work\n', contained: 'old\n' }, { path: '.github/workflows/x.yml', before: 'old\n', after: 'from main\n' }, { path: 'engineering/cap/00-changes/C3-other/C3.md', before: null, after: 'from main\n' }]);
  try {
    const { attributeChanges } = await import(pathToFileURL(LIB).href);
    const a = attributeChanges({ before: f.before, after: f.after, contained: f.contained });
    assert.deepEqual(a.own, [OWN_PATH]); assert.deepEqual(a.inherited, ['.github/workflows/x.yml', 'engineering/cap/00-changes/C3-other/C3.md']);
    const { readTree } = await import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
    const { judgeOf } = await import(pathToFileURL(RUNNER).href);
    const r = judgeOf('limit', await readTree({ main: f.main, collector: f.after, changed: a.own }), f.after, a);
    assert.equal(r.verdict, 'PASS'); assert.equal(r.applies, false, 'the own path lies outside the folders an ACT writes, so the pull request is no ACT');
    const act = makeFolders([{ path: 'engineering/cap/02-learnings/retros/RT7.md', before: null, after: 'own retro\n', contained: null }, { path: OWN_PATH, before: null, after: 'own, outside the route\n', contained: null }, { path: '.github/workflows/x.yml', before: 'old\n', after: 'from main\n' }]);
    try {
      const b = attributeChanges({ before: act.before, after: act.after, contained: act.contained });
      const fail = judgeOf('limit', await readTree({ main: act.main, collector: act.after, changed: b.own }), act.after, b);
      assert.equal(fail.verdict, 'FAIL', 'an own path outside the route stays a FAIL'); assert.match(fail.message, /C2\.md/); assert.doesNotMatch(fail.message, /x\.yml/);
    } finally { act.cleanup(); }
  } finally { f.cleanup(); }
}
