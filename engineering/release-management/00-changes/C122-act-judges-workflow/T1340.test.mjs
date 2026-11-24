// Case release/T1340 tests: release/F90
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, RM, RUNNER, ROOT, RETROS, ACT_PATHS, makeTrees, gitMerge, retroText } from './act-fixtures.mjs';
const lib = () => import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
const runner = () => import(pathToFileURL(RUNNER).href);
const answerOf = async (name, spec, changed = ACT_PATHS) => {
  const t = makeTrees(spec);
  try { const { readTree } = await lib(); const { judgeOf } = await runner(); return judgeOf(name, await readTree({ main: t.main, collector: t.pr, changed }), t.pr); } finally { t.cleanup(); }
};
export const id = 'release/T1340';
export const tests = ['release/F90'];
export const title = "the runner asks the named judge: a well-formed ACT passes demand, verify and limit, and each fault is the named judge's";
export async function run() {
  for (const j of ['demand', 'verify', 'limit']) {
    const a = await answerOf(j, undefined);
    assert.equal(a.verdict, 'PASS', `${j}: ${a.message}`); assert.equal(a.applies, true, j);
  }
  const two = await answerOf('demand', { retros: [{ n: 1, reflects: ['cap/C2'] }, { n: 2, reflects: ['cap/C2'] }] }, [`${RETROS}/RT1.md`, `${RETROS}/RT2.md`]);
  assert.equal(two.verdict, 'FAIL'); assert.match(two.message, /more than one ACT/);
  const none = await answerOf('demand', { retros: [{ n: 1, reflects: ['cap/C9'] }] });
  assert.notEqual(none.verdict, 'PASS', 'a retro that reflects no carried Change is not an ACT of the collector');
  const bad = await answerOf('verify', { retros: [{ n: 1, reflects: ['cap/C2'], text: '---\nid: cap/RT1\nformat: 4L\nreflects: [cap/C2]\n---\nAccount of: me.\n\n## Liked\n- nothing\n' }] });
  assert.equal(bad.verdict, 'FAIL'); assert.match(bad.message, /retro form|not well formed|finder/);
  const out = await answerOf('limit', undefined, [...ACT_PATHS, `${ROOT}/00-changes/C2-first-thing/do.md`]);
  assert.equal(out.verdict, 'FAIL'); assert.match(out.message, /do\.md/);
  const legacy = await answerOf('demand', { retros: [] }, [`${ROOT}/00-changes/C2-first-thing/act.md`]);
  assert.notEqual(legacy.verdict, 'PASS', 'an ACT with no retro does not pass demand');
}
