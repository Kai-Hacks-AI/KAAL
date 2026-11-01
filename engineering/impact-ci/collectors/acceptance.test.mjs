// Acceptance of repository-owned source through its public report interface.
// Fixtures are synthetic provider evidence, not live or packed-product assurance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { reportFullAssurance } from './report.mjs';
import { fixture, refresh } from '../full-fixtures.mjs';
const report = f => reportFullAssurance(f.authority, f.manifest, f.evidence, f.context, f.now);
const group = (r, id) => r.groups.find(g => g.id === id);
for (const [event, target, gate, count] of [
  ['pull_request', 'main', 'KAAL', 17], ['push', 'main', 'KAAL', 14],
  ['pull_request', 'kaal/ci-gates', 'KAAL Capability', 17],
  ['pull_request', 'kaal/guard', 'KAAL Capability', 18],
]) test(`N1 acceptance: ${event} into ${target} retains its full ${count}-leaf policy`, () => {
  const f = fixture(event, target), r = report(f);
  assert.equal(r.verdict, 'passed');
  assert.equal(r.profile.gate, gate);
  assert.equal(r.profile.mode, 'full-assurance');
  assert.equal(r.leaves.length, count);
  assert.ok(r.groups.filter(g => g.applicable).every(g => g.assurance === 'certified-by-full-matrix'));
  assert.deepEqual(r.policy, f.authority.policy);
  assert.equal(r.contextDigest, f.authority.contextDigest);
  assert.equal(r.publication, 'not-published');
  assert.equal(r.liveAssurance, 'unestablished');
  assert.deepEqual(group(r, 'capabilities').children,
    ['hosting', 'acceptance', 'workspaces', 'engineering', 'guard']);
  assert.equal(group(r, 'capabilities').leafIds.length, 11);
  assert.equal(group(r, 'hosting').leafIds.length, 3);
  assert.equal(group(r, 'guard-boundary').applicable, target === 'kaal/guard');
});
test('N1 acceptance: SYNC from main keeps the target collector policy and tests its result', () => {
  const f = fixture('pull_request', 'kaal/ci-gates');
  f.context.headRef = 'main'; refresh(f);
  const r = report(f);
  assert.equal(r.profile.gate, 'KAAL Capability');
  assert.equal(r.profile.target, 'kaal/ci-gates');
  assert.equal(r.subject.testedSha, f.context.testedSha);
  assert.equal(r.subject.testedTreeSha, f.context.testedTreeSha);
  assert.notEqual(r.subject.testedSha, f.context.headSha);
});
test('N1 acceptance: delayed last Windows leaf and its collectors cannot certify early', () => {
  const f = fixture(), run = f.evidence.runPages[0].runs[0];
  const job = run.jobsPages[0].jobs.find(j => j.check === 'Guard (Windows)');
  job.status = 'in_progress'; job.conclusion = null; delete job.completedAt;
  run.status = 'in_progress'; run.conclusion = null; delete run.completedAt;
  const waiting = report(f);
  assert.equal(waiting.verdict, 'pending');
  assert.equal(group(waiting, 'guard').assurance, 'not-certified');
  assert.equal(group(waiting, 'capabilities').assurance, 'not-certified');
  assert.ok(waiting.groups.every(g => g.assurance !== 'certified-by-full-matrix'));
  job.status = 'completed'; job.conclusion = 'success'; job.completedAt = f.now + 1000;
  run.status = 'completed'; run.conclusion = 'success'; run.completedAt = f.now + 1000;
  assert.equal(report(f).verdict, 'pending');
  f.now += 1000;
  const completed = report(f);
  assert.equal(completed.verdict, 'passed');
  assert.equal(completed.successNotBefore, job.completedAt);
});
test('N1 acceptance: Product and Engine coverage is distinct without inventing split tests', () => {
  const r = report(fixture());
  assert.equal(r.coverage.separatelyEstablished, false);
  assert.equal(r.coverage.byDimension.mixed.length, 11);
  assert.equal(r.coverage.byDimension.product.length, 0);
  assert.equal(r.coverage.byDimension.engine.length, 3);
  assert.equal(r.leaves.find(l => l.check === 'Branching').dimension, 'engine');
  assert.equal(r.leaves.find(l => l.check === 'Hosting (Linux)').dimension, 'mixed');
  assert.equal(group(r, 'branching').assurance, 'certified-by-full-matrix');
  assert.equal(r.independentControls.ownerReview, 'independent');
  assert.equal(r.independentControls.codeScanning.tool, 'CodeQL');
});
test('N1 acceptance: a Hotfix source name creates neither a release profile nor reduced assurance', () => {
  const f = fixture('pull_request', 'main');
  f.context.headRef = 'hotfix/urgent'; refresh(f);
  const r = report(f);
  assert.equal(r.profile.gate, 'KAAL');
  assert.equal(r.profile.mode, 'full-assurance');
  assert.equal(r.leaves.length, 17);
  // Synthetic Branching success is not evidence that this source is admissible.
});
