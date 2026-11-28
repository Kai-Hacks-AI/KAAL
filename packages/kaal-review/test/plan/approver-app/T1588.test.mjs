// Case review/T1588 tests: review/F40. The Approver approves only from facts that Hosting produced for it, including a passing check signed by the Inspector at the same revision.
import assert from 'node:assert/strict';
import { BASE, commit, RUN, evidence, facts, factOrigin, grantIdentity, mintGrant, OWN, HEAD, kinds, loadApproval, MAIN } from './lib.mjs';
export const id = 'review/T1588';
export const tests = ['review/F40'];
export const title = 'facts that Hosting produced for the Approver, whose ancestry (the parents) shows the shape of a SYNC, read from those parents and not from a field, and a passing check signed by the Inspector at the same revision, are approve, and a moved head or base, a head whose ancestry is not the base and main (one parent, three parents, a parent that is neither, a repeated parent, a base that lags the parents of the head), a field that the facts offer about it, ancestry alone without a passing signed check, a passing signed check on the wrong ancestry, a check that is missing, not passing, of another revision or signed by another, a pull request of the Approver itself, a fact that Hosting did not produce, a copy of one, a fact another App read and malformed facts or evidence each abstain with their own finding, the kind of a pull request is read from the facts and not from its title, nothing that decides is taken from what the run claims, and nothing but approve or abstain is ever answered';
export async function run() {
  const { makeJudgeApproval, judgeApproval: delivered } = await loadApproval();
  const judge0 = makeJudgeApproval({ factOrigin, grantIdentity });
  const grant = mintGrant();
  const judge = (e, f, g = grant) => judge0(e, f, g);
  assert.deepEqual(judge(evidence(), facts()), { decision: 'approve', findings: [] });

  const abstains = (more, kind, why, f = facts(), g = grant) => {
    const a = judge(evidence(more), f, g);
    assert.equal(a.decision, 'abstain', `${why}: must abstain`);
    assert.ok(kinds(a).includes(kind), `${why}: expected ${kind}, got ${kinds(a)}`);
  };
  abstains({ pr: { head: 'c'.repeat(40) } }, 'head-moved', 'the head moved after the evidence');
  abstains({ pr: { base: 'd'.repeat(40) } }, 'base-moved', 'the base moved after the evidence');
  abstains({}, 'head-moved', 'a head that is not the one the facts name', facts({ head: commit('e'.repeat(40)) }));
  const E = 'e'.repeat(40);
  assert.equal(judge(evidence(), facts({ head: commit(HEAD, [MAIN, BASE]) })).decision, 'approve', 'the order of the two parents does not matter');
  abstains({}, 'not-sync-ancestry', 'a head with one parent', facts({ head: commit(HEAD, [BASE]) }));
  abstains({}, 'not-sync-ancestry', 'a head with three parents', facts({ head: commit(HEAD, [BASE, MAIN, E]) }));
  abstains({}, 'not-sync-ancestry', 'a head with no parents', facts({ head: commit(HEAD, []) }));
  abstains({}, 'not-sync-ancestry', 'a merge of something else than main', facts({ head: commit(HEAD, [BASE, E]) }));
  abstains({}, 'not-sync-ancestry', 'a merge that does not have the base', facts({ head: commit(HEAD, [E, MAIN]) }));
  abstains({}, 'not-sync-ancestry', 'a merge of the base twice', facts({ head: commit(HEAD, [BASE, BASE]) }));
  abstains({}, 'not-sync-ancestry', 'a merge of main twice', facts({ head: commit(HEAD, [MAIN, MAIN]) }));
  abstains({}, 'not-sync-ancestry', 'a base that lags behind the parents of the head', facts({ base: { sha: E, ref: 'kaal/review/x' } }));
  abstains({}, 'not-sync-ancestry', 'a field that says pure merge while the parents say otherwise', facts({ pureMerge: true, head: commit(HEAD, [BASE]) }));
  assert.equal(judge(evidence(), facts({ pureMerge: false })).decision, 'approve', 'a field of the facts that says it is not a pure merge is never read, the parents and the signed check decide');
  // Ancestry proves the shape of a SYNC, not that nothing else was changed in the merge: only the check signed by the Inspector at the exact head says that, and neither is enough alone.
  abstains({}, 'check-missing', 'the right ancestry without any check of its content', facts({ check: null }));
  abstains({}, 'check-not-pass', 'the right ancestry with a failed check of its content', facts({ check: { conclusion: 'failure' } }));
  abstains({}, 'not-sync-ancestry', 'a passing check signed by the Inspector on the wrong ancestry', facts({ head: commit(HEAD, [BASE, 'e'.repeat(40)]) }));
  abstains({}, 'check-other-revision', 'a passing check of the content of another head', facts({ check: { revision: BASE } }));
  abstains({}, 'check-other-signer', 'a passing check on the right ancestry signed by another than the Inspector', facts({ check: { signer: 'someone-else' } }));
  abstains({ pr: { head: 'c'.repeat(40) } }, 'head-moved', 'a content check of a head that is no longer the head', facts({ check: { revision: 'c'.repeat(40) } }));
  abstains({}, 'check-not-pass', 'a failed check', facts({ check: { conclusion: 'failure' } }));
  abstains({}, 'check-not-pass', 'a check that is not complete', facts({ check: { status: 'in_progress', conclusion: null } }));
  abstains({}, 'check-not-pass', 'a check that says success before it completed', facts({ check: { status: 'queued' } }));
  abstains({}, 'check-not-pass', 'a check with any other conclusion', facts({ check: { conclusion: 'skipped' } }));
  abstains({}, 'check-not-pass', 'a conclusion in a word that GitHub does not use', facts({ check: { conclusion: 'pass' } }));
  // Every run of the check at the head counts: a rerun never hides an earlier one, and the order of the list decides nothing.
  const run = (more) => ({ ...RUN, ...more });
  assert.equal(judge(evidence(), facts({ checks: [run({}), run({})] })).decision, 'approve', 'two runs that both passed are approve');
  abstains({}, 'check-not-pass', 'a newer failure above an older success', facts({ checks: [run({ conclusion: 'failure' }), run({})] }));
  abstains({}, 'check-not-pass', 'an older failure under a newer success', facts({ checks: [run({}), run({ conclusion: 'failure' })] }));
  abstains({}, 'check-not-pass', 'a run still pending above a success', facts({ checks: [run({ status: 'in_progress', conclusion: null }), run({})] }));
  abstains({}, 'check-other-signer', 'a second run signed by another', facts({ checks: [run({}), run({ signer: 'someone-else' })] }));
  abstains({}, 'check-other-revision', 'a second run of another revision', facts({ checks: [run({}), run({ revision: 'c'.repeat(40) })] }));
  abstains({}, 'check-missing', 'an empty list of runs', facts({ checks: [] }));
  abstains({}, 'check-missing', 'runs of other checks only', facts({ checks: [run({ name: 'verify Delivery' })] }));
  assert.equal(judge(evidence(), facts({ checks: [run({}), run({ name: 'verify Delivery', conclusion: 'failure' })] })).decision, 'approve', 'a run of another check is not a run of verify Sync');
  abstains({}, 'check-missing', 'the former single check field is no longer read', facts({ checks: undefined, check: run({}) }));
  abstains({}, 'check-missing', 'a pure list of runs that is not a list', facts({ checks: run({}) }));
  abstains({}, 'check-other-revision', 'a check of another revision', facts({ check: { revision: 'c'.repeat(40) } }));
  abstains({}, 'check-other-signer', 'a check signed by another', facts({ check: { signer: 'someone-else' } }));
  abstains({}, 'check-missing', 'another check than verify Sync', facts({ check: { name: 'verify Delivery' } }));
  abstains({}, 'check-missing', 'no check', facts({ check: null }));

  // The refusal follows Hosting's author fact, `{ login, type }` in GitHub's words, against the identity of the grant that read it (`grantIdentity(grant).login`, the bot login of the Approver), as exact text.
  abstains({}, 'own-pull-request', 'a pull request of the Approver itself', facts({ author: { login: OWN, type: 'Bot' } }));
  abstains({}, 'own-pull-request', 'a pull request of the Approver itself whatever type is given', facts({ author: { login: OWN, type: 'User' } }));
  assert.equal(judge(evidence(), facts({ author: { login: 'kaal-inspector[bot]', type: 'Bot' } })).decision, 'approve', 'a pull request of another App is not refused');
  assert.equal(judge(evidence(), facts({ author: { login: 'kaal-approver', type: 'User' } })).decision, 'approve', 'a person whose login lacks the bot suffix is another author: the comparison is exact text');
  abstains({}, 'own-pull-request', 'the identity of the grant is the Approver of that grant', facts({ author: { login: 'other[bot]', type: 'Bot' } }), mintGrant({ appId: '2', login: 'other[bot]' }));
  abstains({}, 'malformed-evidence', 'an author that is a name and not Hosting\'s { login, type }', facts({ author: 'someone' }));
  abstains({}, 'malformed-evidence', 'no author', facts({ author: undefined }));
  abstains({}, 'malformed-evidence', 'an author without a login', facts({ author: { type: 'Bot' } }));
  abstains({}, 'malformed-evidence', 'an author whose login is not text', facts({ author: { login: 7, type: 'Bot' } }));
  abstains({}, 'check-other-signer', 'the signer is the slug of the Inspector App, `kaal-inspector`; a bare `inspector` is not it', facts({ check: { signer: 'inspector' } }));
  abstains({}, 'check-other-signer', 'the signer is not the bot login of the Inspector', facts({ check: { signer: 'kaal-inspector[bot]' } }));

  // The identity is never a field of the facts or the evidence: it comes from the grant, which only Hosting mints. Without one, or with one Hosting did not mint, the judgement abstains.
  const noGrant = (g, why) => { const a = judge0(evidence(), facts(), g); assert.equal(a.decision, 'abstain', `${why}: must abstain`); assert.ok(kinds(a).includes('grant-untrusted'), `${why}: expected grant-untrusted, got ${kinds(a)}`); };
  noGrant(undefined, 'no grant');
  noGrant(null, 'a null grant');
  noGrant({ app: 'approver', login: 'someone[bot]' }, 'a copy of a grant that claims an identity');
  noGrant({ ...grant }, 'a copy of a grant');
  const claimsOwn = judge(evidence(), facts({ author: { login: OWN, type: 'Bot' }, identity: { login: 'someone' } }));
  assert.ok(kinds(claimsOwn).includes('own-pull-request'), 'an identity written into the facts changes nothing');

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
  const handBuilt = delivered(evidence(), { head: commit(), base: { sha: BASE, ref: 'r' }, main: MAIN, author: { login: 'someone', type: 'User' }, check: { name: 'verify Sync', revision: HEAD, conclusion: 'success', signer: 'kaal-inspector' }, source: 'hosting' }, mintGrant());
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
  raw(evidence(), facts({ head: HEAD }), 'malformed-evidence', 'a head that is a revision and not a commit with its parents');
  raw(evidence(), facts({ head: { sha: HEAD } }), 'malformed-evidence', 'a head without parents');
  raw(evidence(), facts({ head: { sha: HEAD, parents: BASE + MAIN } }), 'malformed-evidence', 'parents that are not a list');

  const claimed = evidence();
  claimed.content = { pureMerge: true };
  claimed.checks = [{ name: 'verify Sync', revision: HEAD, conclusion: 'success', signer: 'kaal-inspector' }];
  assert.equal(judge(claimed, facts({ head: commit(HEAD, [BASE]) })).decision, 'abstain', 'a pure merge that the run claims and the parents deny abstains');
  assert.equal(judge(claimed, facts({ check: { conclusion: 'failure' } })).decision, 'abstain', 'a check that the run claims and the facts deny abstains');
  assert.equal(judge(claimed, facts({ check: null })).decision, 'abstain', 'a check that only the run claims is not a check');
  const withTitle = { ...evidence(), pr: { ...evidence().pr, title: 'SYNC: kaal/review/x', ref: 'kaal/review/x' } };
  assert.equal(judge(withTitle, facts({ head: commit(HEAD, [BASE]) })).decision, 'abstain', 'a pull request that is titled and branched like a SYNC is not a SYNC by content');
  const unlike = { ...evidence(), pr: { ...evidence().pr, title: 'a change of mine', ref: 'feature/x' } };
  assert.equal(judge(unlike, facts()).decision, 'approve', 'a pure merge with an unlike title and branch is a SYNC by content');

  for (const [e, f] of [[undefined, facts()], [null, null], [1, 1], [[], []], [{}, {}], [evidence(), facts()], [{ pr: null, execution: null }, facts()], [evidence(), { ...facts(), check: 1 }]]) {
    const a = judge(e, f);
    assert.ok(['approve', 'abstain'].includes(a.decision), 'only approve or abstain is ever answered');
    assert.ok(a.decision === 'abstain' ? a.findings.length > 0 : a.findings.length === 0, 'an abstention names a reason and an approval names none');
  }
  const throwing = makeJudgeApproval({ factOrigin: () => { throw new Error('the registry failed'); }, grantIdentity })(evidence(), facts(), grant);
  assert.equal(throwing.decision, 'abstain', 'a lookup that fails is an abstention and never an exception or an approval');
  assert.throws(() => makeJudgeApproval(), undefined, 'a judgement without a lookup of origin is refused when built, never believed');
  assert.throws(() => makeJudgeApproval({ factOrigin }), undefined, 'a judgement without a lookup of the identity of a grant is refused when built, never believed');
  const brokenIdentity = makeJudgeApproval({ factOrigin, grantIdentity: () => { throw new Error('the registry failed'); } })(evidence(), facts(), grant);
  assert.equal(brokenIdentity.decision, 'abstain', 'an identity lookup that fails is an abstention and never an approval');
}
