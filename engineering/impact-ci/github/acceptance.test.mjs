// Repository-only acceptance through public factories and fake provider ports.
// This is neither installed-product acceptance nor live GitHub assurance.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createController } from './controller.mjs';
import { providerFixture } from './fixtures.mjs';
import { harness } from './controller-fixtures.mjs';
function consumer(event, target) {
  const provider = providerFixture(event, target), h = harness(event, target);
  Object.assign(h.f, provider.f); h.setCurrent(provider.f.context);
  h.ports.acquirer = provider.acquirer; h.controller = createController(h.ports);
  return { h, provider };
}
for (const [event,target,gate] of [['pull_request','main','KAAL Main'], ['push','main','KAAL Main'],
  ['pull_request','kaal/ci-gates','KAAL Lineage'], ['pull_request','kaal/guard','KAAL Lineage']]) {
  test(`consumer receives authenticated complete ${event}/${target} GREEN under ${gate}`, async () => {
    const { h } = consumer(event,target); assert.equal((await h.run()).state, 'green');
    assert.equal(h.writes.at(-1).body.name, gate); assert.equal(h.writes.at(-1).body.conclusion, 'success');
  });
  test(`no early GREEN for any unfinished obligation in ${event}/${target}`, async () => {
    const sample = providerFixture(event,target);
    for (const [runId, jobs] of sample.jobs) for (let i = 0; i < jobs.length; i++) {
      const { h, provider: p } = consumer(event,target), job = p.jobs.get(runId)[i];
      job.status = 'in_progress'; job.conclusion = null; job.completed_at = null;
      const checkId = Number(job.check_run_url.split('/').at(-1));
      Object.assign(p.checks.get(checkId), { status: 'in_progress', conclusion: null });
      Object.assign(p.runs.find(r => r.id === runId), { status: 'in_progress', conclusion: null });
      assert.equal((await h.run()).state, 'pending', `${target}: ${job.name}`);
      assert.ok(h.writes.every(w => w.body.conclusion !== 'success'), job.name);
    }
  });
}
test('consumer receives RED when an authenticated required underlying obligation fails', async () => {
  const { h, provider: p } = consumer('pull_request','main');
  p.jobs.get(100)[0].conclusion = 'failure'; p.checks.get(5000).conclusion = 'failure';
  assert.equal((await h.run()).state, 'red'); assert.equal(h.writes.at(-1).body.conclusion, 'failure');
});
test('consumer receives UNRESOLVED for same-App evidence without trusted source proof', async () => {
  const { h, provider: p } = consumer('pull_request','kaal/guard'); p.overrideProof({});
  assert.equal((await h.run()).state, 'unresolved'); assert.equal(h.writes.at(-1).body.conclusion, 'failure');
});
