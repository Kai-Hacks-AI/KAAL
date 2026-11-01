import test from 'node:test';
import assert from 'node:assert/strict';
import { judgeFullMatrix } from '../full-gate.mjs';
import { fullManifest, establishFullMatrix } from '../full-policy.mjs';
import { snapshot } from '../full-fixtures.mjs';
import { providerFixture } from './fixtures.mjs';
for (const [event, target] of [['pull_request','main'], ['push','main'], ['pull_request','kaal/ci-gates'], ['pull_request','kaal/guard']])
  test(`provider-normalized v2 retains complete ${event} ${target} obligations`, async () => {
    const h = providerFixture(event, target), r = await h.acquire();
    assert.equal(r.kind, 'acquired', JSON.stringify(r));
    const result = judgeFullMatrix(r.authority, fullManifest(r.authority), r.evidence, h.f.context, h.f.now);
    assert.equal(result.verdict, 'passed', JSON.stringify(result));
    assert.equal(result.ledger.length, event === 'push' ? 14 : target === 'kaal/guard' ? 18 : 17);
    assert.equal(result.successNotBefore, h.f.now);
    assert.ok(h.requests.every(r => r.redirect === 'error' && r.method === 'GET'));
  });
const defects = {
  'wrong repository': (q,r) => { if (q.path.endsWith('/')) r.body.id = 1; },
  'wrong PR': (q,r) => { if (q.path.includes('/pulls/')) r.body.number++; },
  'wrong source repository': (q,r) => { if (q.path.includes('/pulls/')) r.body.head.repo.id++; },
  'wrong base': (q,r) => { if (q.path.includes('/pulls/')) r.body.base.sha = '0'.repeat(40); },
  'wrong tested revision': (q,r) => { if (q.path.includes('/pulls/')) r.body.merge_commit_sha = '0'.repeat(40); },
  'truncated run page': (q,r) => { if (q.path.includes('?head_sha=') && r.body.workflow_runs.length) r.body.total_count++; },
  'truncated job page': (q,r) => { if (q.path.includes('/jobs?')) r.body.total_count++; },
  'wrong attempt': (q,r) => { if (/\/runs\/\d+$/.test(q.path)) r.body.run_attempt++; },
  'wrong workflow': (q,r) => { if (/\/runs\/\d+$/.test(q.path)) r.body.workflow_id++; },
  'source drift': (q,r) => { if (q.path.includes('/contents/')) r.body.content = 'dGFtcGVyZWQ='; },
  'same-App forged child': (q,r) => { if (q.path.includes('/check-runs/')) r.body.check_suite.id++; },
  'wrong child App': (q,r) => { if (q.path.includes('/check-runs/')) r.body.app.id++; },
  'wrong child SHA': (q,r) => { if (q.path.includes('/check-runs/')) r.body.head_sha = '0'.repeat(40); },
  'unsafe child URL': (q,r) => { if (q.path.includes('/jobs?')) r.body.jobs[0].check_run_url = 'https://attacker.invalid/check-runs/1'; },
  'provider outage': (_q,r) => { r.status = 503; },
  'redirect origin': (_q,r) => { r.origin = 'https://attacker.invalid'; },
};
for (const [name, mutate] of Object.entries(defects)) test(`acquisition unresolved: ${name}`, async () => {
  const h = providerFixture(); h.onRequest((q,r) => { mutate(q,r); return r; });
  assert.equal((await h.acquire()).kind, 'unresolved');
  assert.ok(!h.requests.some(r => r.path.startsWith('https://')));
});
test('all paginated runs are retained; competing required producer on page two is unresolved', async () => {
  const h = providerFixture();
  const original = structuredClone(h.runs[0]);
  for (let i = 0; i < 100; i++) h.runs.push({ ...original, id: 10000+i, workflow_id: 0 });
  h.runs.push({ ...original, id: 88888 });
  const r = await h.acquire(); assert.equal(r.kind, 'unresolved');
  assert.match(r.errors.join(), /competing/);
  assert.ok(h.requests.some(r => r.path.includes('page=2')));
});
test('an execution generation appearing during scan is unresolved', async () => {
  const h = providerFixture(); let scans = 0;
  h.onRequest((q,r) => {
    if (q.path.includes(`head_sha=${h.f.context.headSha}`) && ++scans === 2) {
      r.body.workflow_runs.push({ ...r.body.workflow_runs[0], id: 90000 }); r.body.total_count++;
    }
    return r;
  });
  assert.match((await h.acquire()).errors.join(), /population changed/);
});
for (const claim of ['run_id','run_attempt','workflow_ref','check_run_id']) test(`authentic receipt from another ${claim} cannot join evidence`, async () => {
  const h = providerFixture(); h.overrideReceipt({ [claim]: 'wrong' });
  assert.equal((await h.acquire()).kind, 'unresolved');
});
test('missing checkout/governance proof cannot be replaced by signed OIDC identity', async () => {
  const h = providerFixture(); h.overrideProof({});
  assert.match((await h.acquire()).errors.join(), /execution proof/);
});
test('receipt attestor must be an actual job/check in the exact producer', async () => {
  const h = providerFixture(), p = Object.values(h.f.context.producers)[0]; p.attestorCheckRunId = 999999;
  h.f.authority = establishFullMatrix(h.f.context, snapshot());
  h.setCurrent(h.f.context);
  assert.match((await h.acquire()).errors.join(), /attestor receipt not joined/);
});
test('v2 cannot downgrade completion observation or per-producer revision bindings', async () => {
  const h = providerFixture(), r = await h.acquire();
  r.evidence.runPages[0].runs[0].governanceSha = '0'.repeat(40);
  assert.equal(judgeFullMatrix(r.authority, fullManifest(r.authority), r.evidence, h.f.context, h.f.now).verdict, 'failed');
  const clean = await h.acquire(); clean.evidence.runPages[0].runs[0].terminalObservedAt = null;
  assert.equal(judgeFullMatrix(clean.authority, fullManifest(clean.authority), clean.evidence, h.f.context, h.f.now).verdict, 'failed');
  clean.evidence.schema = 'kaal.full-evidence/v1';
  assert.equal(judgeFullMatrix(clean.authority, fullManifest(clean.authority), clean.evidence, h.f.context, h.f.now).verdict, 'unresolved');
});
test('terminal observations use acquisition clock at the read, not the caller start time', async () => {
  const h = providerFixture(); h.ports.clock.now = () => h.f.now + 500;
  const r = await h.acquire(); assert.equal(r.kind, 'acquired');
  assert.ok(r.evidence.runPages[0].runs.every(r => r.terminalObservedAt === h.f.now + 500));
});
test('PR-target producers prove their head tree independently of the aggregate merge tree', async () => {
  const h = providerFixture(), r = await h.acquire();
  assert.equal(r.kind, 'acquired', JSON.stringify(r));
  const targetRun = r.evidence.runPages[0].runs.find(r => r.event === 'pull_request_target');
  assert.equal(targetRun.testedTreeSha, '7'.repeat(40));
  assert.notEqual(targetRun.testedTreeSha, h.f.context.testedTreeSha);
});
