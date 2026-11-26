// Case review/T1588 tests: review/F40. The Approver approves only from facts that Hosting produced for it, including a passing check signed by the Inspector at the same revision.
import assert from 'node:assert/strict';
import { evidence, facts, factOrigin, HEAD, kinds, loadApproval } from './lib.mjs';
export const id = 'review/T1588';
export const tests = ['review/F40'];
export const title = 'facts that Hosting produced for the Approver, showing a pure merge and a passing check signed by the Inspector at the same revision, are approve, and a moved head or base, a change that is not a pure merge, a check that is missing, not passing, of another revision or signed by another, a pull request of the Approver itself, a fact that Hosting did not produce, a copy of one, a fact another App read and malformed facts or evidence each abstain with their own finding, the kind of a pull request is read from the facts and not from its title, nothing that decides is taken from what the run claims, and nothing but approve or abstain is ever answered';
export async function run() {
  const { makeJudgeApproval, judgeApproval: delivered } = await loadApproval();
  const judge = makeJudgeApproval({ factOrigin });
  assert.deepEqual(judge(evidence(), facts()), { decision: 'approve', findings: [] });

  const abstains = (more, kind, why, f = facts()) => {
    const a = judge(evidence(more), f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  abstains({ pr: { head: 'c'.repeat(40) } }, 'head-moved', 'the head moved after the evidence');
  abstains({ pr: { base: 'd'.repeat(40) } }, 'base-moved', 'the base moved after the evidence');
  abstains({}, 'head-moved', 'a head that is not the one the facts name', facts({ head: 'e'.repeat(40) }));
  abstains({}, 'not-pure-merge', 'a change that is not a pure merge', facts({ pureMerge: false }));
  abstains({}, 'not-pure-merge', 'a pure-merge fact that is a word and not true', facts({ pureMerge: 'true' }));
  abstains({}, 'not-pure-merge', 'a pure-merge fact that is absent', facts({ pureMerge: undefined }));
  abstains({}, 'check-not-pass', 'a failed check', facts({ check: { conclusion: 'fail' } }));
  abstains({}, 'check-not-pass', 'an unknown check', facts({ check: { conclusion: 'unknown' } }));
  abstains({}, 'check-not-pass', 'a check with any other conclusion', facts({ check: { conclusion: 'skipped' } }));
  abstains({}, 'check-other-revision', 'a check of another revision', facts({ check: { revision: 'c'.repeat(40) } }));
  abstains({}, 'check-other-signer', 'a check signed by another', facts({ check: { signer: 'someone-else' } }));
  abstains({}, 'check-missing', 'another check than verify Sync', facts({ check: { name: 'verify Delivery' } }));
  abstains({}, 'check-missing', 'no check', facts({ check: null }));
  abstains({}, 'own-pull-request', 'a pull request of the Approver itself', facts({ author: 'approver' }));

  // Attribution is never a field of the data: only what the registry knows is a fact.
  const unattributed = (f, why) => {
    const a = judge(evidence(), f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes('facts-unattributed'), `${why}: expected facts-unattributed, got ${kinds(a)}`);
  };
  unattributed(facts({}, null), 'a fact that Hosting did not produce');
  unattributed({ ...facts() }, 'a copy of a fact');
  unattributed(JSON.parse(JSON.stringify(facts())), 'a fact after a round trip through JSON');
  unattributed({ ...facts(), source: 'hosting' }, 'a copy that names Hosting as its source');
  unattributed({ ...facts({}, null), origin: { repository: 'r', app: 'approver' } }, 'a fact that carries an origin of its own');
  const other = judge(evidence(), facts({}, { repository: 'r', read: 'readPullRequestFacts', app: 'inspector' }));
  assert.equal(other.decision, 'abstain', 'a fact that another App read must abstain');
  assert.ok(kinds(other).includes('facts-other-reader'), `expected facts-other-reader, got ${kinds(other)}`);

  // The delivered judgement asks Hosting's own registry, which no hand-built fact is in.
  const handBuilt = delivered(evidence(), { head: HEAD, base: 'b'.repeat(40), main: 'f'.repeat(40), pureMerge: true, author: 'someone', check: { name: 'verify Sync', revision: HEAD, conclusion: 'pass', signer: 'inspector' }, source: 'hosting' });
  assert.equal(handBuilt.decision, 'abstain', 'the delivered judgement believes no hand-built fact');
  assert.ok(kinds(handBuilt).includes('facts-unattributed'));

  const raw = (e, f, kind, why) => {
    const a = judge(e, f);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  raw(undefined, facts(), 'malformed-evidence', 'missing evidence');
  raw(null, facts(), 'malformed-evidence', 'null evidence');
  raw('approve', facts(), 'malformed-evidence', 'evidence that is text');
  raw({}, facts(), 'malformed-evidence', 'empty evidence');
  raw(evidence(), undefined, 'malformed-evidence', 'no facts');
  raw(evidence(), null, 'malformed-evidence', 'null facts');
  raw(evidence(), 'hosting', 'malformed-evidence', 'facts that are text');
  raw(evidence(), facts({ base: undefined }), 'malformed-evidence', 'facts without a base');

  const claimed = evidence();
  claimed.content = { pureMerge: true };
  claimed.check = { name: 'verify Sync', revision: HEAD, conclusion: 'pass', signer: 'inspector' };
  assert.equal(judge(claimed, facts({ pureMerge: false })).decision, 'abstain', 'a pure merge that the run claims and the facts deny abstains');
  assert.equal(judge(claimed, facts({ check: { conclusion: 'fail' } })).decision, 'abstain', 'a check that the run claims and the facts deny abstains');
  assert.equal(judge(claimed, facts({ check: null })).decision, 'abstain', 'a check that only the run claims is not a check');
  const withTitle = { ...evidence(), pr: { ...evidence().pr, title: 'SYNC: kaal/review/x', ref: 'kaal/review/x' } };
  assert.equal(judge(withTitle, facts({ pureMerge: false })).decision, 'abstain', 'a pull request that is titled and branched like a SYNC is not a SYNC by content');
  const unlike = { ...evidence(), pr: { ...evidence().pr, title: 'a change of mine', ref: 'feature/x' } };
  assert.equal(judge(unlike, facts()).decision, 'approve', 'a pure merge with an unlike title and branch is a SYNC by content');

  for (const [e, f] of [[undefined, facts()], [null, null], [1, 1], [[], []], [{}, {}], [evidence(), facts()], [{ pr: null, execution: null }, facts()], [evidence(), { ...facts(), check: 1 }]]) {
    const a = judge(e, f);
    assert.ok(['approve', 'abstain'].includes(a.decision), 'only approve or abstain is ever answered');
    assert.ok(a.decision === 'abstain' ? a.findings.length > 0 : a.findings.length === 0, 'an abstention names a reason and an approval names none');
  }
  const throwing = makeJudgeApproval({ factOrigin: () => { throw new Error('the registry failed'); } })(evidence(), facts());
  assert.equal(throwing.decision, 'abstain', 'a lookup that fails is an abstention and never an exception or an approval');
  assert.throws(() => makeJudgeApproval(), undefined, 'a judgement without a lookup of origin is refused when built, never believed');
}
