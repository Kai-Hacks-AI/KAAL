// Case release/T1343 tests: release/F90
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
export const id = 'release/T1343';
export const tests = ['release/F90'];
export const title = 'hold Act says it cannot tell until Testing observes the Cases: UNKNOWN with its reason, exit 0 flag off and 1 flag on';
export async function run() {
  const { exitCodeOf, NO_OBSERVATION } = await runner();
  const a = await answerOf('hold', undefined);
  assert.equal(a.verdict, 'UNKNOWN'); assert.equal(a.applies, true); assert.ok(a.message.includes(NO_OBSERVATION));
  assert.equal(exitCodeOf(a, undefined), 0); assert.equal(exitCodeOf(a, 'on'), 1);
}
