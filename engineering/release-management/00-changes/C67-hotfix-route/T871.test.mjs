// Case release/T871 tests: release/C67
import assert from 'node:assert/strict';
import { hotfix, routeProblems, verify } from './fixtures.mjs';
export const id = 'release/T871';
export const tests = ['release/C67', 'release/D1'];
export const title = 'a HOTFIX off its route is a finding naming the route: into main, into a collector, into a bare hotfix branch, or from a head under hotfix/';
export async function run() {
  for (const [label, over] of [
    ['into main', { base: 'main' }],
    ['into a collector', { base: 'kaal/release/sample' }],
    ['into a bare hotfix branch', { base: 'hotfix' }],
    ['from a hotfix/ head into a hotfix/ base', { head: 'hotfix/other' }],
    ['from a hotfix/ head into main', { base: 'main', head: 'hotfix/restore-sample' }],
  ]) {
    const r = await verify({ ...hotfix, ...over });
    assert.equal(r.verdict, 'FAIL', `a HOTFIX ${label} is not a FAIL`);
    assert.ok(routeProblems(r).some((p) => /route of a HOTFIX/.test(p) && /hotfix\//.test(p)), `a HOTFIX ${label} does not name its route: ${r.problems.join('; ')}`);
  }
}
