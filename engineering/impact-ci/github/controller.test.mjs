import test from 'node:test';
import assert from 'node:assert/strict';
import { createController } from './controller.mjs';
import { snapshot, refresh } from '../full-fixtures.mjs';
import { harness } from './controller-fixtures.mjs';
test('completed Main matrix publishes pending before a read-back-confirmed GREEN', async () => {
  const h = harness(), r = await h.run();
  assert.equal(r.state, 'green');
  assert.deepEqual(h.writes.map(w => [w.body.status, w.body.conclusion ?? null]), [['in_progress', null], ['completed', 'success']]);
  assert.equal(h.writes[0].body.name, 'KAAL Main');
  assert.match(h.writes[1].body.output.summary, /main-pr/);
});
test('one unfinished required job cannot authorize GREEN', async () => {
  const h = harness(); h.f.evidence.runPages[0].runs[0].jobsPages[0].jobs[0].status = 'in_progress';
  h.f.evidence.runPages[0].runs[0].jobsPages[0].jobs[0].completedAt = null;
  assert.equal((await h.run()).state, 'pending');
  assert.ok(h.writes.every(w => w.body.conclusion !== 'success'));
});
test('a caller cannot substitute its own passed result', async () => {
  const h = harness(); h.ports.acquirer.acquire = async () => ({ kind: 'acquired', authority: {}, evidence: {}, verdict: 'passed' });
  assert.equal((await h.run()).state, 'unresolved');
  assert.ok(h.writes.every(w => w.body.conclusion !== 'success'));
});
for (const conclusion of ['failure','cancelled','skipped','timed_out','neutral',null])
  test(`required ${conclusion} maps to RED/failure, never a passing GitHub substitute`, async () => {
    const h = harness(); h.f.evidence.runPages[0].runs[0].jobsPages[0].jobs[0].conclusion = conclusion;
    assert.equal((await h.run()).state, 'red');
    assert.equal(h.writes.at(-1).body.conclusion, 'failure');
  });
test('unauthenticated acquisition maps to explicit UNRESOLVED/failure', async () => {
  const h = harness(); h.ports.acquirer.acquire = async () => ({ kind: 'unresolved', errors: ['missing provenance'] });
  assert.equal((await h.run()).state, 'unresolved');
  assert.equal(h.writes.at(-1).body.conclusion, 'failure');
  assert.match(h.writes.at(-1).body.output.summary, /UNRESOLVED/);
});
test('replacement attempt revokes prior GREEN before acquisition and cannot borrow earlier children', async () => {
  const h = harness(); assert.equal((await h.run()).state, 'green');
  h.f.context.generation++; const run = h.f.evidence.runPages[0].runs[0];
  h.f.context.producers[run.path].attempt = 2;
  run.attempt = 2; run.jobsPages[0].jobs = run.jobsPages[0].jobs.slice(0,1);
  run.jobsPages[0].total_count = 1; run.jobsPages[0].jobs[0].attempt = 2;
  refresh(h.f); h.setCurrent(h.f.context);
  h.onAcquire(() => { assert.equal(h.checks.get(900).status, 'in_progress'); assert.equal(h.checks.get(900).conclusion, null); });
  assert.equal((await h.run()).state, 'pending');
  assert.equal(h.writes.filter(r => r.method === 'POST').length, 1);
});
test('same-SHA different PR is unresolved and invalidates reusable prior GREEN', async () => {
  const h = harness(); await h.run(); h.f.context.pr++; h.f.context.generation++;
  for (const r of h.f.evidence.runPages[0].runs) r.pr = h.f.context.pr;
  refresh(h.f); h.setCurrent(h.f.context);
  assert.equal((await h.run()).state, 'unresolved');
  assert.equal(h.checks.get(900).conclusion, 'failure');
});
test('context change without advancing generation cannot silently replace assurance', async () => {
  const h = harness(); await h.run(); h.f.context.baseRef = 'main'; h.f.context.pr = 800;
  h.f.context.headSha = '8'.repeat(40); h.f.context.parents[1] = h.f.context.headSha;
  refresh(h.f); h.setCurrent(h.f.context);
  assert.equal((await h.run()).state, 'unresolved');
  assert.equal(h.checks.get(900).conclusion, 'failure');
});
test('head/tested revision change retires old check before creating replacement', async () => {
  const h = harness(); await h.run(); h.f.context.generation++;
  h.f.context.testedSha = h.f.context.publicationSha = '8'.repeat(40);
  refresh(h.f); h.setCurrent(h.f.context);
  await h.run();
  assert.equal(h.writes[2].method, 'PATCH'); assert.equal(h.writes[2].body.conclusion, 'failure');
  assert.equal(h.writes[3].method, 'POST'); assert.equal(h.writes[3].body.head_sha, '8'.repeat(40));
  assert.equal(h.checks.get(900).conclusion, 'failure');
});
test('pre-publication provider change prevents success', async () => {
  const h = harness(); h.onAcquire(() => h.setCurrent({ ...h.f.context, generation: 2 }));
  assert.equal((await h.run()).state, 'unresolved');
  assert.ok(h.writes.every(w => w.body.conclusion !== 'success'));
});
test('post-publication provider change is compensated and reports an enforcement gap', async () => {
  const h = harness(); h.onWrite(req => { if (req.body.conclusion === 'success') h.setCurrent({ ...h.f.context, generation: 2 }); });
  const r = await h.run(); assert.equal(r.state, 'unresolved'); assert.equal(r.enforcementGap, true);
  assert.match(r.errors.join(), /intervening merge cannot be excluded/);
  assert.equal(h.checks.get(900).conclusion, 'failure');
  assert.ok(h.writes.some(w => w.body.conclusion === 'success')); // the exposure was real in this fake schedule
});
test('competing callback fences old worker and compensates its completed write', async () => {
  const h = harness(); let competing;
  h.onWrite(async req => {
    if (req.body.conclusion === 'success') competing = await h.controller.reconcile(h.f.context, snapshot(), h.f.now);
  });
  assert.equal((await h.run()).state, 'unresolved');
  assert.equal(competing.state, 'unresolved'); assert.equal(h.checks.get(900).conclusion, 'failure');
});
test('applied-but-lost acknowledgement persists uncertainty across restart without blind retry', async () => {
  const h = harness(), original = h.ports.transport.request;
  h.ports.transport.request = async req => { const r = await original(req);
    if (req.body?.conclusion === 'success') throw new Error('timeout after remote application'); return r; };
  const r = await h.run(); assert.equal(r.state, 'unresolved'); assert.equal(r.enforcementGap, true);
  assert.equal(h.checks.get(900).conclusion, 'success'); // no false claim that timeout revoked GREEN
  const count = h.writes.length;
  h.controller = createController(h.ports);
  assert.equal((await h.run()).state, 'unresolved'); assert.equal(h.writes.length, count);
});
for (const field of ['app','head_sha','external_id','status','conclusion','name','id'])
  test(`publisher read-back mismatch ${field} blocks publication acknowledgement`, async () => {
    const h = harness(), original = h.ports.transport.request;
    h.ports.transport.request = async req => { const r = await original(req);
      if (req.method === 'GET') r.body[field] = field === 'app' ? { id: 15368 } : 'forged'; return r; };
    assert.equal((await h.run()).state, 'unresolved');
    assert.ok(h.writes.every(w => w.body.conclusion !== 'success'));
  });
test('acquisition crossing the generation deadline is RED, even with earlier complete evidence', async () => {
  const h = harness(); h.onAcquire(() => { h.f.now = h.f.context.deadline; });
  assert.equal((await h.run()).state, 'red');
  assert.ok(h.writes.every(w => w.body.conclusion !== 'success'));
});
test('a success acknowledged past its deadline is compensated and never reported GREEN', async () => {
  const h = harness(); h.onWrite(req => { if (req.body.conclusion === 'success') h.f.now = h.f.context.deadline; });
  assert.equal((await h.run()).state, 'unresolved');
  assert.equal(h.checks.get(900).conclusion, 'failure');
});
test('clock regression during acquisition is unresolved', async () => {
  const h = harness(); h.onAcquire(() => { h.f.now--; });
  assert.equal((await h.run()).state, 'unresolved');
  assert.ok(h.writes.every(w => w.body.conclusion !== 'success'));
});
test('unapproved source population revokes existing GREEN even when policy establishment refuses it', async () => {
  const h = harness(); assert.equal((await h.run()).state, 'green');
  const changed = snapshot(); changed.sources['.github/workflows/ci.yml'] += '# unapproved change\n';
  const r = await h.controller.reconcile(h.f.context, changed);
  assert.equal(r.state, 'unresolved'); assert.equal(h.checks.get(900).conclusion, 'failure');
});
test('retarget outside the policy revokes the previous applicable certificate', async () => {
  const h = harness(); await h.run(); h.f.context.baseRef = 'unsupported'; h.setCurrent(h.f.context);
  assert.equal((await h.run()).state, 'unresolved'); assert.equal(h.checks.get(900).conclusion, 'failure');
});
