import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceFixture, fixtureSealer } from './test-fixtures.mjs';
import { createProducerService, executionFact } from './producer.mjs';
import { snapshot } from '../../full-fixtures.mjs';
import { judgeFullMatrix } from '../../full-gate.mjs';
import { fullManifest, fullExpected } from '../../full-policy.mjs';
import { token } from '../fixtures.mjs';
test('accepted native receipt becomes an independently sealed execution fact',async()=>{
  const h=serviceFixture(),p=await h.prepare();
  assert.equal(p.opened.state,'collecting');
  const r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  assert.equal(r.state,'accepted');
  const read=await h.service.read(r.factId);
  assert.equal(read.state,'verified'); assert.equal(executionFact(read.handle).producer.workflowId,384461082);
  assert.throws(()=>executionFact(structuredClone(read.handle)),/opaque/);
});
test('fact persists across service restart and JWT expiry without authenticating an expired token again',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  h.f.h.f.now+=180000; h.service=createProducerService(h.ports);
  assert.equal((await h.service.read(r.factId)).state,'verified');
  const duplicate=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  assert.equal(duplicate.state,'acknowledged'); assert.equal(duplicate.factId,r.factId);
});
test('observed subject change permanently retires earlier facts even if the branch later returns',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  h.f.h.f.context.baseRef='kaal/other';
  assert.equal((await h.service.read(r.factId)).state,'unresolved');
  h.f.h.f.context.baseRef='main';
  assert.equal((await h.service.read(r.factId)).state,'unresolved');
  assert.ok(h.store.states.get('kaal-producers/v1').invalidations.length>0);
});
test('late registration can seal a population but cannot confer full assurance',async()=>{
  const h=serviceFixture(),p=await h.prepare();
  assert.equal((await h.service.seal(p.opened.cohortId)).state,'unresolved');
  await h.registerOthers(p.opened.cohortId);
  const sealed=await h.service.seal(p.opened.cohortId);assert.equal(sealed.state,'sealed');
  const e=fullExpected(sealed.authority);
  const result=judgeFullMatrix(sealed.authority,fullManifest(sealed.authority),{
    schema:'kaal.full-evidence/v2',contextDigest:e.contextDigest,runPages:[{page:1,per_page:100,total_count:0,runs:[]}]},sealed.context,h.f.h.f.now);
  assert.equal(result.verdict,'pending');
});
test('replacing any registered attempt invalidates the entire previous cohort without a union',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  h.f.h.f.context.producers[h.f.w.path].attempt++;
  assert.equal((await h.service.register(p.opened.cohortId,h.f.w.path)).state,'unresolved');
  assert.equal((await h.service.read(r.factId)).state,'unresolved');
  const next=await h.service.open(h.f.h.f.context,snapshot());assert.notEqual(next.cohortId,p.opened.cohortId);
  assert.equal((await h.service.seal(next.cohortId)).state,'unresolved');
});
for(const defect of ['proof','nonce','expired','source','seal','key','provider','clock'])test(`ingress/read refuses ${defect}`,async()=>{
  const h=serviceFixture(),p=await h.prepare();
  if(defect==='nonce'){assert.equal((await h.service.ingest('9'.repeat(64),p.jwt,h.proof)).state,'unresolved');return;}
  if(defect==='proof'){h.proof.exitStatus=1;assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'unresolved');return;}
  if(defect==='expired'){h.f.h.f.now+=121000;assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'unresolved');return;}
  if(defect==='source'){h.ports.sourceVerifier.verify=async()=>null;assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'unresolved');return;}
  const r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);assert.equal(r.state,'accepted');
  if(defect==='seal')h.store.states.get('kaal-producers/v1').facts[r.factId].seal.signature[0]^=1;
  if(defect==='key')h.ports.sealer={...h.ports.sealer,verify:async()=>false};
  if(defect==='provider')h.f.p.attestorCheckRunId++;
  if(defect==='clock')h.f.h.f.now--;
  h.service=createProducerService(h.ports);assert.equal((await h.service.read(r.factId)).state,'unresolved');
});
test('simultaneous duplicate ingress commits one nonce/JTI/fact and returns idempotent acknowledgement',async()=>{
  const h=serviceFixture(),p=await h.prepare();
  const r=await Promise.all([h.service.ingest(p.challenge.nonce,p.jwt,h.proof),h.service.ingest(p.challenge.nonce,p.jwt,h.proof)]);
  assert.deepEqual(r.map(x=>x.state).sort(),['accepted','acknowledged']);
  const s=h.store.states.get('kaal-producers/v1');assert.equal(Object.keys(s.facts).length,1);assert.equal(Object.keys(s.jtis).length,1);
});
test('subject changing during final source revalidation cannot mint a fresh fact capability',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  const original=h.ports.sourceVerifier.verify;
  h.ports.sourceVerifier.verify=async(...args)=>{const out=await original(...args);h.f.h.f.context.baseRef='kaal/new';return out;};
  assert.equal((await h.service.read(r.factId)).state,'unresolved');
});
test('explicit issuer revocation blocks a previously sealed fact after restart',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  h.ports.revokedIssuerKeyIds=['fixture'];h.service=createProducerService(h.ports);
  assert.equal((await h.service.read(r.factId)).state,'unresolved');
});
test('one issuer JTI cannot authenticate another nonce or replacement cohort',async()=>{
  const h=serviceFixture(),p=await h.prepare();assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'accepted');
  h.f.p.attempt++;h.f.claims.run_attempt=String(h.f.p.attempt);
  await h.service.register(p.opened.cohortId,h.f.w.path);
  const next=await h.prepare();assert.equal((await h.service.ingest(next.challenge.nonce,next.jwt,h.proof)).state,'unresolved');
});
test('altering an already consumed nonce cannot create a fresh authority acknowledgement',async()=>{
  const h=serviceFixture(),p=await h.prepare();await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  const changed=await token({...p.claims,jti:'other-signed-token'});
  assert.equal((await h.service.ingest(p.challenge.nonce,changed,h.proof)).state,'unresolved');
});
test('signer failure cannot acknowledge or consume a fact with an invalid seal',async()=>{
  const h=serviceFixture(),p=await h.prepare();
  h.ports.sealer={...h.ports.sealer,sign:async()=>({keyId:'test-seal',signature:Array(64).fill(0)})};
  h.service=createProducerService(h.ports);
  assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'unresolved');
  assert.equal(Object.keys(h.store.states.get('kaal-producers/v1').facts).length,0);
});
test('population sealing rechecks subject after asynchronous source reads',async()=>{
  const h=serviceFixture(),p=await h.prepare();await h.registerOthers(p.opened.cohortId);
  let calls=0;const total=fullExpected(h.f.h.f.authority).workflows.length;
  h.ports.snapshots.read=async()=>{if(++calls===total+1)h.f.h.f.context.baseRef='kaal/changed';return snapshot();};
  assert.equal((await h.service.seal(p.opened.cohortId)).state,'unresolved');
});
test('restarted reader verifies a fact with public keys alone',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  h.ports.sealer=fixtureSealer(true);h.service=createProducerService(h.ports);
  assert.equal((await h.service.read(r.factId)).state,'verified');
  await assert.rejects(h.ports.sealer.sign({}),/signing key unavailable/);
});
test('removing the service verification key blocks the original cryptographic seal',async()=>{
  const h=serviceFixture(),p=await h.prepare(),r=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  h.ports.sealer=fixtureSealer(true,'different-key-id');h.service=createProducerService(h.ports);
  assert.equal((await h.service.read(r.factId)).state,'unresolved');
});
