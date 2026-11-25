// Case engineering/T1425 tests: engineering/F96
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { src, runs } from '../F95-workflow-names-workflow/fixture.mjs';
export const id = 'engineering/T1425';
export const tests = ['engineering/F96'];
export const title = 'the accepted baseline is the base commit\'s file, the default branch\'s where the base has none, and the step says which';
export async function run() {
  const all = runs(readFileSync(src, 'utf8')).join('\n');
  assert.match(all, /git show "?\$\{?BASE_SHA\}?:/, 'the base commit\'s baseline is not read with git show');
  assert.match(all, /CTL36-verify-workflow-names\/baseline\.json/, 'the baseline is not the one of CTL36');
  assert.match(all, /default branch/i, 'the step does not say it fell back to the default branch\'s baseline');
  const prev = all.match(/--previous\s+"?([^\s"]+)"?/);
  assert.ok(prev, 'judge-mode gets no --previous');
  assert.ok(/RUNNER_TEMP/.test(prev[1]), '--previous is not the file the step wrote');
}
