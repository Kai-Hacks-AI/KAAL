// Case release/T1341 tests: release/F90
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
export const id = 'release/T1341';
export const tests = ['release/F90'];
export const title = 'a pull request that is not an ACT is reported as such by every job and passes, flag on or off';
export async function run() {
  const plan = [`${ROOT}/00-changes/C2-first-thing/change.md`];
  const { exitCodeOf } = await runner();
  for (const j of ['hold', 'demand', 'verify', 'limit']) {
    const a = await answerOf(j, undefined, plan);
    assert.equal(a.verdict, 'PASS', `${j}: ${a.message}`); assert.equal(a.applies, false, j); assert.match(a.message, /not an ACT/);
    for (const flag of [undefined, 'off', 'on']) assert.equal(exitCodeOf(a, flag), 0, `${j} flag ${flag}`);
  }
}
