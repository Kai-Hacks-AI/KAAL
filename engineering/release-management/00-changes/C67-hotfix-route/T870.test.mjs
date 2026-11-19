// Case release/T870 tests: release/C67
import assert from 'node:assert/strict';
import { hotfix, routeProblems, verify } from './fixtures.mjs';
export const id = 'release/T870';
export const tests = ['release/C67', 'release/D1'];
export const title = 'a HOTFIX into a hotfix/ branch from a head outside hotfix/ is on its route: no finding on the route, the base is judged and no longer reported as not judged, and the verdict stays UNKNOWN for what the review decides';
export async function run() {
  const r = await verify(hotfix);
  assert.deepEqual(routeProblems(r), [], `the agreed HOTFIX route is a finding: ${r.problems.join('; ')}`);
  assert.equal(r.ok, true, `a valid HOTFIX into a hotfix/ branch is refused: ${r.problems.join('; ')}`);
  assert.equal(r.verdict, 'UNKNOWN', 'a HOTFIX is never PASS from the envelope alone');
  assert.ok(!r.notJudged.some((n) => /base of a HOTFIX/.test(n)), 'the base of a HOTFIX is still reported as not judged');
  assert.ok(r.notJudged.some((n) => /corrects only its defect/.test(n)), 'what the review decides is no longer reported');
}
