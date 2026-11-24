// Case controls/T1121 tests: controls/F40
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const findingsOf = (tree) => tree.filter((f) => f.startsWith('bad:'));
const judgeOk = (base, head) => head.filter((f) => f.startsWith('bad:') && !base.includes(f));
export const id = 'controls/T1121';
export const tests = ['controls/F40'];
export const title = 'a control that judges a change as what the head adds over the base holds the property, and a difference is named';
export async function run() {
  const lib = join(S, 'scope.mjs');
  assert.ok(existsSync(lib), 'scripts/scope.mjs is absent');
  const { holdsProperty } = await import(pathToFileURL(lib).href);
  const base = ['ok:1', 'bad:old'], head = ['ok:1', 'bad:old', 'bad:new'];
  const good = holdsProperty({ findingsOf, judge: judgeOk, base, head });
  assert.equal(good.holds, true, 'a control that reports what the head adds was refused');
  const reportsAll = holdsProperty({ findingsOf, judge: (b, h) => h.filter((f) => f.startsWith('bad:')), base, head });
  assert.equal(reportsAll.holds, false, 'a judge that reports the old finding too was accepted');
  assert.deepEqual(reportsAll.onlyInJudge, ['bad:old'], 'the extra finding was not named');
  const misses = holdsProperty({ findingsOf, judge: () => [], base, head });
  assert.equal(misses.holds, false, 'a judge that misses the new finding was accepted');
  assert.deepEqual(misses.onlyInDiff, ['bad:new'], 'the missed finding was not named');
  const twice = holdsProperty({ findingsOf: () => ['bad:x', 'bad:x'], judge: () => [], base, head });
  assert.equal(twice.holds, false, 'a name twice was accepted');
  assert.equal(twice.reason, 'unstable-findings', 'the unstable findings were not named');
  assert.equal(holdsProperty({ findingsOf: () => [1, 2], judge: () => [], base, head }).reason, 'unstable-findings', 'non-string findings were accepted');
}
