// Case review/T1589 tests: review/F41. The Approver approves only from execution that is shown to be trusted.
import assert from 'node:assert/strict';
import { evidence, expected, kinds, loadApproval, MAIN } from './lib.mjs';
export const id = 'review/T1589';
export const tests = ['review/F41'];
export const title = 'evidence of execution of the code of main on a trusted trigger without a checkout of the head is approve, and an untrusted trigger, code that is not main\'s, a head that was checked out and missing or malformed evidence of execution each abstain with their own finding, and an approval needs trusted execution as well as the facts of the pull request';
export async function run() {
  const { judgeApproval } = await loadApproval();
  assert.deepEqual(judgeApproval(evidence(), expected), { decision: 'approve', findings: [] });

  const abstains = (more, kind, why, exp = expected) => {
    const a = judgeApproval(evidence(more), exp);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  abstains({ execution: { trigger: 'pull_request' } }, 'trigger-not-trusted', 'a trigger that is not trusted');
  abstains({ execution: { trigger: 'pull_request_target' } }, 'trigger-not-trusted', 'pull_request_target');
  abstains({ execution: { trigger: undefined } }, 'execution-unproven', 'a trigger that is not stated');
  abstains({ execution: { codeRevision: 'c'.repeat(40) } }, 'code-not-main', 'code of another revision than main');
  abstains({ execution: { codeRevision: evidence().pr.head } }, 'code-not-main', 'code of the head being decided');
  abstains({ execution: { checkedOutHead: true } }, 'head-checked-out', 'a head that was checked out');
  abstains({ execution: { checkedOutHead: undefined } }, 'execution-unproven', 'a checkout fact that is absent');
  abstains({ execution: { checkedOutHead: 'false' } }, 'execution-unproven', 'a checkout fact that is a word and not false');
  abstains({}, 'trigger-not-trusted', 'a trigger outside the trusted set that is named', { ...expected, triggers: ['merge_group'] });
  abstains({}, 'trigger-not-trusted', 'no trusted triggers named', { ...expected, triggers: [] });
  abstains({}, 'code-not-main', 'main of another revision than the code that ran', { ...expected, main: 'd'.repeat(40) });
  abstains({}, 'execution-unproven', 'no revision of main named', { head: expected.head, base: expected.base, triggers: expected.triggers });

  const missing = { ...evidence() };
  delete missing.execution;
  for (const e of [missing, { ...evidence(), execution: null }, { ...evidence(), execution: 'trusted' }, { ...evidence(), execution: [] }]) {
    const a = judgeApproval(e, expected);
    assert.equal(a.decision, 'abstain', 'missing or malformed execution must abstain');
    assert.deepEqual(kinds(a), ['execution-unproven'], 'and say that it is unproven, only');
  }
  const both = judgeApproval(evidence({ execution: { checkedOutHead: true }, check: { conclusion: 'fail' } }), expected);
  assert.equal(both.decision, 'abstain');
  assert.deepEqual(kinds(both), ['check-not-pass', 'head-checked-out'], 'every reason is named, the facts of the pull request and the execution together');
  assert.equal(MAIN.length, 40);
}
