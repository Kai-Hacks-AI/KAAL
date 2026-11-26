// Case review/T1589 tests: review/F41. The Approver approves only from execution that is shown to be trusted, and what that is compared with is not chosen by the caller.
import assert from 'node:assert/strict';
import { evidence, facts, factOrigin, kinds, loadApproval } from './lib.mjs';
export const id = 'review/T1589';
export const tests = ['review/F41'];
export const title = 'evidence of execution of the code of main on a trusted trigger without a checkout of the head is approve, an untrusted trigger, code that is not main\'s, a head that was checked out and missing or malformed evidence of execution each abstain with their own finding, a list of triggers or a revision of main offered by the caller or the run is ignored, and an approval needs trusted execution as well as the facts of the pull request';
export async function run() {
  const { makeJudgeApproval } = await loadApproval();
  const judgeApproval = makeJudgeApproval({ factOrigin });
  assert.deepEqual(judgeApproval(evidence(), facts()), { decision: 'approve', findings: [] });

  const abstains = (more, kind, why, f = facts()) => {
    const a = judgeApproval(evidence(more), f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  abstains({ execution: { trigger: 'pull_request' } }, 'trigger-not-trusted', 'a trigger that is not trusted');
  abstains({ execution: { trigger: 'pull_request_target' } }, 'trigger-not-trusted', 'pull_request_target');
  abstains({ execution: { trigger: 'schedule' } }, 'trigger-not-trusted', 'a trigger that is not in the list');
  abstains({ execution: { trigger: undefined } }, 'execution-unproven', 'a trigger that is not stated');
  abstains({ execution: { codeRevision: 'c'.repeat(40) } }, 'code-not-main', 'code of another revision than main');
  abstains({ execution: { codeRevision: evidence().pr.head } }, 'code-not-main', 'code of the head being decided');
  abstains({ execution: { checkedOutHead: true } }, 'head-checked-out', 'a head that was checked out');
  abstains({ execution: { checkedOutHead: undefined } }, 'execution-unproven', 'a checkout fact that is absent');
  abstains({ execution: { checkedOutHead: 'false' } }, 'execution-unproven', 'a checkout fact that is a word and not false');
  abstains({}, 'code-not-main', 'a main that is not the code that ran', facts({ main: 'd'.repeat(40) }));
  abstains({}, 'execution-unproven', 'no revision of main in the facts', facts({ main: undefined }));

  // What decides is not chosen by the caller: a list of triggers or a revision of main that is offered is ignored.
  abstains({ execution: { trigger: 'pull_request' } }, 'trigger-not-trusted', 'a trigger list offered in the facts', facts({ triggers: ['pull_request'] }));
  abstains({ execution: { trigger: 'pull_request' } }, 'trigger-not-trusted', 'a trigger list offered in the facts as a trusted list', facts({ trustedTriggers: ['pull_request'] }));
  const offered = evidence({ execution: { trigger: 'pull_request' } });
  offered.triggers = ['pull_request'];
  offered.execution.trustedTriggers = ['pull_request'];
  assert.equal(judgeApproval(offered, facts()).decision, 'abstain', 'a trigger list offered by the run is ignored');
  const claimedMain = evidence({ execution: { codeRevision: 'c'.repeat(40) } });
  claimedMain.execution.main = 'c'.repeat(40);
  claimedMain.main = 'c'.repeat(40);
  const a = judgeApproval(claimedMain, facts());
  assert.equal(a.decision, 'abstain', 'a revision of main claimed by the run is ignored');
  assert.ok(kinds(a).includes('code-not-main'));

  const missing = { ...evidence() };
  delete missing.execution;
  for (const e of [missing, { ...evidence(), execution: null }, { ...evidence(), execution: 'trusted' }, { ...evidence(), execution: [] }]) {
    const r = judgeApproval(e, facts());
    assert.equal(r.decision, 'abstain', 'missing or malformed execution must abstain');
    assert.deepEqual(kinds(r), ['execution-unproven'], 'and say that it is unproven, only');
  }
  const both = judgeApproval(evidence({ execution: { checkedOutHead: true } }), facts({ check: { conclusion: 'fail' } }));
  assert.equal(both.decision, 'abstain');
  assert.deepEqual(kinds(both), ['check-not-pass', 'head-checked-out'], 'every reason is named, the facts of the pull request and the execution together');
}
