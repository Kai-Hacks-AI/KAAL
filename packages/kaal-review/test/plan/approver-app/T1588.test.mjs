// Case review/T1588 tests: review/F40. The Approver approves only a pure merge with a passing check signed by the Inspector at the revision being decided.
import assert from 'node:assert/strict';
import { evidence, expected, HEAD, kinds, loadApproval } from './lib.mjs';
export const id = 'review/T1588';
export const tests = ['review/F40'];
export const title = 'evidence of a pure merge with a passing check signed by the Inspector at the revision being decided is approve, and a moved head or base, a change that is not a pure merge, a check that is missing, not passing, of another revision or signed by another, a pull request of the Approver itself and malformed evidence each abstain with their own finding, the kind of a pull request is read from its content, and nothing but approve or abstain is ever answered';
export async function run() {
  const { judgeApproval } = await loadApproval();
  assert.deepEqual(judgeApproval(evidence(), expected), { decision: 'approve', findings: [] });

  const abstains = (more, kind, why, exp = expected) => {
    const a = judgeApproval(evidence(more), exp);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  abstains({ pr: { head: 'c'.repeat(40) } }, 'head-moved', 'the head moved after the evidence');
  abstains({ pr: { base: 'd'.repeat(40) } }, 'base-moved', 'the base moved after the evidence');
  abstains({ content: { pureMerge: false } }, 'not-pure-merge', 'a change that is not a pure merge');
  abstains({ content: { pureMerge: 'true' } }, 'not-pure-merge', 'a pure-merge fact that is a word and not true');
  abstains({ content: { pureMerge: undefined } }, 'not-pure-merge', 'a pure-merge fact that is absent');
  abstains({ check: { conclusion: 'fail' } }, 'check-not-pass', 'a failed check');
  abstains({ check: { conclusion: 'unknown' } }, 'check-not-pass', 'an unknown check');
  abstains({ check: { conclusion: 'skipped' } }, 'check-not-pass', 'a check with any other conclusion');
  abstains({ check: { revision: 'c'.repeat(40) } }, 'check-other-revision', 'a check of another revision');
  abstains({ check: { signer: 'someone-else' } }, 'check-other-signer', 'a check signed by another');
  abstains({ check: { name: 'verify Delivery' } }, 'check-missing', 'another check than verify Sync');
  abstains({ pr: { author: 'approver' } }, 'own-pull-request', 'a pull request of the Approver itself');
  abstains({}, 'head-moved', 'a head that is not the one being decided', { head: 'e'.repeat(40), base: expected.base });

  const raw = (e, kind, why) => {
    const a = judgeApproval(e, expected);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  raw(undefined, 'malformed-evidence', 'missing evidence');
  raw(null, 'malformed-evidence', 'null evidence');
  raw('approve', 'malformed-evidence', 'evidence that is text');
  raw({}, 'malformed-evidence', 'empty evidence');
  raw({ pr: evidence().pr, content: evidence().content }, 'check-missing', 'evidence without a check');
  raw({ pr: evidence().pr, check: evidence().check }, 'not-pure-merge', 'evidence without content');
  assert.equal(judgeApproval(evidence(), undefined).decision, 'abstain', 'no expected revision abstains');
  assert.equal(judgeApproval(evidence(), {}).decision, 'abstain', 'an expected revision without a head abstains');
  assert.equal(judgeApproval(evidence(), { head: HEAD }).decision, 'abstain', 'an expected revision without a base abstains');

  const withTitle = { ...evidence(), pr: { ...evidence().pr, title: 'SYNC: kaal/review/x', ref: 'kaal/review/x' } };
  assert.equal(judgeApproval({ ...withTitle, content: { pureMerge: false } }, expected).decision, 'abstain', 'a pull request that is titled and branched like a SYNC is not a SYNC by content');
  const unlike = { ...evidence(), pr: { ...evidence().pr, title: 'a change of mine', ref: 'feature/x' } };
  assert.equal(judgeApproval(unlike, expected).decision, 'approve', 'a pure merge with an unlike title and branch is a SYNC by content');

  for (const e of [undefined, null, 1, [], {}, evidence(), { ...evidence(), check: null }, { pr: null, content: null, check: null }]) {
    const a = judgeApproval(e, expected);
    assert.ok(['approve', 'abstain'].includes(a.decision), 'only approve or abstain is ever answered');
    assert.ok(a.decision === 'abstain' ? a.findings.length > 0 : a.findings.length === 0, 'an abstention names a reason and an approval names none');
  }
  assert.equal(HEAD.length, 40);
}
