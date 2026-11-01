import test from 'node:test';
import assert from 'node:assert/strict';
import { digest } from '../../policy-identity.mjs';
import { gitSourceFixture as fixture } from './source-fixtures.mjs';
import { createGitSourceVerifier } from './source.mjs';
import { fileURLToPath } from 'node:url';
test('Git verifier proves actual committed driver/checker/dependency bytes and tested tree, retaining failed exit',async()=>{
  const f=await fixture(),r=await f.reader.verify(f.proof,f.registration,f.context);
  assert.equal(r.proofDigest,digest(f.proof));assert.equal(f.proof.exitStatus,1);
});
for(const defect of ['tree','working bytes','driver','suite','context','governance','dependency'])test(`Git source proof refuses ${defect}`,async()=>{
  const f=await fixture();
  if(defect==='tree')f.proof.testedTreeSha='0'.repeat(40);
  if(defect==='working bytes')f.proof.after={};
  if(defect==='driver')f.proof.driverDigest='0'.repeat(64);
  if(defect==='suite')f.proof.checkSuiteId++;
  if(defect==='context')f.proof.pr++;
  if(defect==='governance')f.proof.governanceSha='0'.repeat(40);
  if(defect==='dependency')f.proof.dependencyDigest='0'.repeat(64);
  await assert.rejects(f.reader.verify(f.proof,f.registration,f.context));
});
test('source proof binds source repository identity independently of matching commit bytes',async()=>{
  const f=await fixture();f.context.headRepositoryId=123;f.proof.headRepositoryId=999;
  await assert.rejects(f.reader.verify(f.proof,f.registration,f.context));
});
test('missing command/dependency source pins cannot create a usable source verifier',async()=>{
  const f=await fixture();delete f.trust.commandDigest;
  assert.throws(()=>createGitSourceVerifier({root:fileURLToPath(new URL('../../../../',import.meta.url)),trust:f.trust}));
});
