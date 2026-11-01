import { test } from 'node:test';
import assert from 'node:assert/strict';
import { establishFullMatrix, fullExpected, fullManifest } from './full-policy.mjs';
import { judgeFullMatrix } from './full-gate.mjs';
import { fixture, snapshot, evaluate, time, refresh } from './full-fixtures.mjs';
const judge = f => evaluate(judgeFullMatrix, f);
const runs = f => f.evidence.runPages[0].runs;
const ci = f => runs(f).find(r => r.path.endsWith('/ci.yml'));
const jobs = f => ci(f).jobsPages[0].jobs;
const guardWindows = f => jobs(f).find(j => j.check === 'Guard (Windows)');

for (const [event, target, count, gate] of [
  ['pull_request', 'main', 17, 'KAAL Main'], ['pull_request', 'kaal/ci-gates', 17, 'KAAL Lineage'],
  ['pull_request', 'kaal/guard', 18, 'KAAL Lineage'], ['push', 'main', 14, 'KAAL Main'],
]) test(`complete ${event} ${target} uses independent full matrix (${count})`, () => {
  const f = fixture(event, target);
  assert.equal(fullExpected(f.authority).inventory.length, count);
  const result = judge(f);
  assert.equal(result.verdict, 'passed');
  assert.equal(result.gate, gate);
  assert.ok(result.successNotBefore <= f.now);
  assert.equal(result.observations.length, count);
});

test('head caller cannot establish or replace its expected matrix with a copied authority', () => {
  const f = fixture();
  f.authority = { ...f.authority, authoritative: true, inventory: [] };
  assert.equal(judge(f).verdict, 'unresolved');
});
for (const target of ['feature/foo', 'kaal/', 'kaal/a/b']) test(`unsupported target ${target} fails closed`, () => {
  const f = fixture(); assert.throws(() => establishFullMatrix({ ...f.context, baseRef: target }, snapshot()));
});
test('policy verifies complete target-held bytes independently of observed jobs', () => {
  const f = fixture(), s = snapshot();
  s.sources['.github/workflows/ci.yml'] = s.sources['.github/workflows/ci.yml'].replace('Guard (', 'No Guard (');
  assert.throws(() => establishFullMatrix(f.context, s), /drift/);
  delete s.sources['.github/workflows/ci.yml'];
  assert.throws(() => establishFullMatrix(f.context, s), /inventory/);
});
test('caller cannot alter authority after establishment', () => {
  const f = fixture();
  assert.throws(() => fullExpected(f.authority).inventory.pop(), TypeError);
  f.context.baseRef = 'main';
  assert.equal(judge(f).stage, 'freshness');
});
test('omit Guard Windows from both manifest and observations: selection rejects it', () => {
  const f = fixture();
  f.manifest.selected = f.manifest.selected.filter(j => j.check !== 'Guard (Windows)');
  ci(f).jobsPages[0].jobs = jobs(f).filter(j => j.check !== 'Guard (Windows)');
  ci(f).jobsPages[0].total_count--;
  assert.equal(judge(f).stage, 'selection');
  assert.equal(judge(f).verdict, 'failed');
});
test('independent manifest cannot exclude even one full-matrix obligation', () => {
  const f = fixture(); f.manifest.excluded = [f.manifest.selected.pop()];
  assert.equal(judge(f).stage, 'selection');
});
test('an impact digest is not a substitute for truthful full matrix provenance', () => {
  const f = fixture(); delete f.manifest.matrixDigest; f.manifest.impactDigest = 'pretend-full';
  assert.equal(judge(f).stage, 'selection');
});
for (const conclusion of ['failure', 'skipped', 'neutral', 'cancelled', 'timed_out', 'action_required', 'stale'])
  test(`required ${conclusion} cannot pass`, () => {
    const f = fixture(); guardWindows(f).conclusion = conclusion;
    assert.equal(judge(f).verdict, 'failed');
  });
test('ten completed CI jobs and running Guard Windows never yield early success', () => {
  const f = fixture(); Object.assign(guardWindows(f), { status: 'in_progress', conclusion: null, completedAt: null });
  assert.equal(judge(f).verdict, 'pending');
  f.now = f.context.deadline; assert.equal(judge(f).verdict, 'failed');
});
for (const path of ['codeql.yml', 'lineage-synchronization.yml', 'dependency-review.yml'])
  test(`eleven completed CI jobs still wait for ${path}`, () => {
    const f = fixture(); const r = runs(f).find(r => r.path.endsWith('/' + path));
    Object.assign(r, { status: 'in_progress', conclusion: null, completedAt: null });
    assert.equal(judge(f).verdict, 'pending');
  });
test('last job completion time is a lower bound for success publication', () => {
  const f = fixture(); guardWindows(f).completedAt = f.now + 1000; ci(f).completedAt = f.now + 1000;
  assert.notEqual(judge(f).verdict, 'passed');
  f.now += 1000; assert.equal(judge(f).verdict, 'passed');
  assert.equal(judge(f).successNotBefore, f.now);
});
test('missing producer waits and eventually times out', () => {
  const f = fixture(); runs(f).pop(); f.evidence.runPages[0].total_count--;
  assert.equal(judge(f).verdict, 'pending');
  f.now = f.context.deadline; assert.equal(judge(f).verdict, 'failed');
});
test('missing expanded child cannot be hidden by successful workflow conclusion', () => {
  const f = fixture(); jobs(f).pop(); ci(f).jobsPages[0].total_count--;
  assert.notEqual(judge(f).verdict, 'passed');
});
for (const field of ['repositoryId', 'pr', 'headSha', 'baseSha', 'testedSha', 'workflowId', 'workflowSha', 'sourceDigest', 'contextDigest', 'event', 'appId'])
  test(`wrong required producer ${field} is rejected`, () => {
    const f = fixture(); const r = ci(f); r[field] = typeof r[field] === 'number' ? r[field] + 1 : 'wrong';
    assert.equal(judge(f).verdict, 'failed');
  });
for (const field of ['runId', 'attempt', 'checkSuiteId', 'jobKey', 'labels'])
  test(`wrong required job ${field} is rejected`, () => {
    const f = fixture(); const j = guardWindows(f); j[field] = field === 'labels' ? ['ubuntu-latest'] : 'wrong';
    assert.equal(judge(f).verdict, 'failed');
  });
test('duplicate job/check identity cannot pass', () => {
  const f = fixture(); jobs(f).push(structuredClone(jobs(f)[0])); ci(f).jobsPages[0].total_count++;
  assert.equal(judge(f).verdict, 'failed');
});
test('duplicate workflows cannot be cherry-picked into a passing union', () => {
  const f = fixture(); const copy = structuredClone(ci(f)); copy.runId++;
  runs(f).push(copy); f.evidence.runPages[0].total_count++;
  assert.equal(judge(f).verdict, 'unresolved');
});
test('a complete newest rerun supersedes an older failure without mixing attempts', () => {
  const f = fixture(), previous = structuredClone(ci(f));
  previous.jobsPages[0].jobs[0].conclusion = 'failure';
  ci(f).attempt = 2; jobs(f).forEach(j => { j.attempt = 2; j.id += 10000; });
  runs(f).push(previous); f.evidence.runPages[0].total_count++;
  f.context.generation++; f.context.producers[ci(f).path].attempt = 2; refresh(f);
  assert.equal(judge(f).verdict, 'passed');
});
test('failed-jobs-only partial rerun cannot borrow jobs from its previous attempt', () => {
  const f = fixture(), previous = structuredClone(ci(f));
  ci(f).attempt = 2; ci(f).jobsPages[0].jobs = [guardWindows(f)];
  Object.assign(jobs(f)[0], { attempt: 2, id: 99999 }); ci(f).jobsPages[0].total_count = 1;
  runs(f).push(previous); f.evidence.runPages[0].total_count++;
  f.context.generation++; f.context.producers[ci(f).path].attempt = 2; refresh(f);
  assert.notEqual(judge(f).verdict, 'passed');
});
for (const mutate of [f => { f.context.headSha = 'f'.repeat(40); }, f => { f.context.baseSha = 'f'.repeat(40); },
  f => { f.context.generation++; }, f => { f.context.pr++; }, f => { f.context.baseRef = 'main'; }])
  test('current generation/head/base/PR/target invalidates old success', () => {
    const f = fixture(); mutate(f); assert.equal(judge(f).stage, 'freshness');
  });
test('truncated and missing pages are not a complete inventory', () => {
  const f = fixture(); ci(f).jobsPages[0].total_count = 101;
  assert.equal(judge(f).verdict, 'unresolved');
  const g = fixture(); g.evidence.runPages[0].page = 2;
  assert.equal(judge(g).verdict, 'unresolved');
});
test('fake stable name from the same Actions app but another workflow cannot satisfy a producer', () => {
  const f = fixture(); ci(f).path = '.github/workflows/fake.yml';
  assert.equal(judge(f).verdict, 'failed');
});
test('fully supplied self-attested matrix cannot directly bypass execution validation', async () => {
  const { judgeExecution } = await import('./execution-gate.mjs');
  const f = fixture(); assert.notEqual(judgeExecution({ ...fullManifest(f.authority), fullMatrixVerified: true }, []).verdict, 'passed');
});
test('direct full execution cannot omit a job even with a genuine authority handle', async () => {
  const { judgeExecution } = await import('./execution-gate.mjs');
  const f = fixture(); f.manifest.selected.pop();
  assert.notEqual(judgeExecution(f.manifest, [], f.authority).verdict, 'passed');
});
test('all run/job API pages are accepted when complete and consistent', () => {
  const f = fixture();
  const paginate = (values, key, size) => Array.from({ length: Math.ceil(values.length / size) }, (_, i) =>
    ({ page: i + 1, per_page: size, total_count: values.length, [key]: values.slice(i * size, (i + 1) * size) }));
  for (const r of runs(f)) r.jobsPages = paginate(r.jobsPages[0].jobs, 'jobs', 4);
  f.evidence.runPages = paginate(runs(f), 'runs', 2);
  assert.equal(judge(f).verdict, 'passed');
});
test('completion after the generation deadline cannot recover the old generation', () => {
  const f = fixture();
  guardWindows(f).completedAt = f.context.deadline + 1; ci(f).completedAt = guardWindows(f).completedAt;
  f.now = f.context.deadline + 2;
  assert.equal(judge(f).verdict, 'failed');
});
test('successful children cannot finish after the producer that supposedly holds them', () => {
  const f = fixture(); guardWindows(f).completedAt++;
  assert.equal(judge(f).verdict, 'failed');
});
test('added workflow and changed Guard command declaration require a policy transition', () => {
  const f = fixture(), s = snapshot();
  s.sources['.github/workflows/new-required.yml'] = 'name: extra';
  assert.throws(() => establishFullMatrix(f.context, s), /inventory/);
  delete s.sources['.github/workflows/new-required.yml'];
  s.sources['.kaal/config/guard/Engineering.md'] += 'changed';
  assert.throws(() => establishFullMatrix(f.context, s), /drift/);
});
test('wrong synthetic merge parents, publication commit or snapshot revision cannot establish authority', () => {
  const f = fixture();
  assert.throws(() => establishFullMatrix({ ...f.context, parents: [f.context.headSha, f.context.baseSha] }, snapshot()));
  assert.throws(() => establishFullMatrix({ ...f.context, publicationSha: f.context.headSha }, snapshot()));
  assert.throws(() => establishFullMatrix(f.context, { ...snapshot(), revision: f.context.headSha }));
});
test('independent current context may reorder fields without becoming stale', () => {
  const f = fixture(); f.context = Object.fromEntries(Object.entries(f.context).reverse());
  assert.equal(judge(f).verdict, 'passed');
});
test('absent current context is fail-closed without throwing', () => {
  const f = fixture(); f.context = undefined;
  assert.equal(judge(f).stage, 'freshness');
});
test('new attempt cannot re-use the authority for the old producer generation', () => {
  const f = fixture(); ci(f).attempt = 2;
  jobs(f).forEach(j => { j.attempt = 2; });
  assert.equal(judge(f).verdict, 'failed');
});
test('new producer generation invalidates a delayed old callback before finalization', () => {
  const f = fixture(); f.context.producers[ci(f).path].attempt = 2;
  assert.equal(judge(f).stage, 'freshness');
});
test('a completed old success cannot be replayed after the generation deadline', () => {
  const f = fixture(); f.now = f.context.deadline;
  assert.equal(judge(f).verdict, 'failed');
  assert.equal(judge(f).stage, 'freshness');
});
