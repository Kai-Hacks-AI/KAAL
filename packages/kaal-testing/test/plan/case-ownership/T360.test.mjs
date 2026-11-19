// Case testing/T360 tests: testing/F134, testing/F135. It validates declared links, identities and consistency, never whether a Case is adequate.
import assert from 'node:assert/strict';
import { STATUSES, capabilitiesOf, survey, surveyOnDisk } from './lib.mjs';
export const id = 'testing/T360';
export const tests = ['testing/F134', 'testing/F135'];
export const title = 'the survey of a stated scope equals the one recomputed from the repository, and sorts every Case as owned or unresolved, never as rejected';
export function run() {
  const s = surveyOnDisk();
  assert.ok(Array.isArray(s.scope) && s.scope.length >= 2, 'the survey states a scope of at least two package folders');
  const want = survey(s.scope);
  assert.ok(want.length > 0, 'the scope holds Cases');
  assert.deepEqual(s.cases, want, 'the survey holds every Case of the scope, as recomputed from the repository');
  for (const c of s.cases) {
    assert.ok(STATUSES.includes(c.status), `${c.case}: status "${c.status}" is none of ${STATUSES.join(', ')}`);
    assert.equal(c.status === 'unresolved', typeof c.reason === 'string' && c.reason.trim() !== '', `${c.case}: a reason is given exactly when the Case is unresolved`);
  }
  assert.ok(capabilitiesOf(s.cases).size >= 2, 'the declared links name nodes of at least two owning capabilities');
  assert.ok(s.cases.some((c) => c.status === 'owned' && c.nodes.length >= 1), 'at least one Case is positively owned');
}
