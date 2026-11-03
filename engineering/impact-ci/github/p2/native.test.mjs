import test from 'node:test';
import assert from 'node:assert/strict';
import { authFixture, token } from '../fixtures.mjs';
import { receiptFacts } from '../auth.mjs';
import { nativeFixture } from './test-fixtures.mjs';
test('native original Branching job authenticates without fabricated reusable claims', async () => {
  const f = nativeFixture(), result = receiptFacts(await f.auth.nativeReceipt(await token(f.claims),f.expected,f.h.f.now));
  assert.equal(result.profile,'trusted-native-policy-producer/v1');
  assert.equal(result.issuerKeyId,'fixture');
  assert.ok(!('job_workflow_sha' in result.claims));
});
test('native profile stays disabled without trusted deployment pins', async () => {
  const f = nativeFixture(); await assert.rejects(authFixture().nativeReceipt(await token(f.claims),f.expected,f.h.f.now), /unauthenticated/);
});
for (const [field,value] of Object.entries({run_id:1,run_attempt:2,check_run_id:1,workflow_sha:'0'.repeat(40),
  workflow_ref:'candidate-workflow',event_name:'pull_request',ref:'refs/heads/evil',base_ref:'other',aud:'other-nonce',repository_id:'1'}))
  test(`native receipt refuses forged ${field}`, async () => {
    const f=nativeFixture(); await assert.rejects(f.auth.nativeReceipt(await token({...f.claims,[field]:value}),f.expected,f.h.f.now),/unauthenticated/);
  });
