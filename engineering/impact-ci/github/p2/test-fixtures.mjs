import { webcrypto } from 'node:crypto'; // fixture signatures only
import { providerFixture, authFixture, claimsFor, token } from '../fixtures.mjs';
import { fullExpected, digest } from '../../full-policy.mjs';
import { snapshot } from '../../full-fixtures.mjs';
import { createFactSealer } from './seal.mjs';
import { createProducerService, initialProducerState } from './producer.mjs';
const pair = await webcrypto.subtle.generateKey('Ed25519',false,['sign','verify']);
export const fixtureSealer = (readOnly=false, publicId='test-seal') => createFactSealer({subtle:webcrypto.subtle,keyId:'test-seal',
  privateKey:readOnly?null:pair.privateKey,publicKeys:{[publicId]:pair.publicKey}});
export function nativeFixture() {
  const h=providerFixture(), w=fullExpected(h.f.authority).workflows.find(w=>w.id===384461082),p=h.f.context.producers[w.path];
  const claims=claimsFor(h.f,w,p); delete claims.job_workflow_ref; delete claims.job_workflow_sha;
  const expected={nonce:'1'.repeat(64),proofDigest:'2'.repeat(64),claims:{run_id:p.runId,run_attempt:p.attempt,
    check_run_id:p.attestorCheckRunId,workflow_ref:claims.workflow_ref,workflow_sha:p.workflowSha,event_name:w.event,ref:p.ref,base_ref:h.f.context.baseRef}};
  claims.aud=`kaal-ci-shadow/native/${expected.nonce}/${expected.proofDigest}`;
  const nativeTrust={workflowId:w.id,path:w.path,event:w.event,workflowSha:p.workflowSha,sourceDigest:w.sourceDigest};
  return {h,w,p,claims,expected,nativeTrust,auth:authFixture({nativeTrust})};
}
export function memoryStore() {
  const states=new Map();
  return { async transaction(key,fn) {
    const s=structuredClone(states.get(key)??initialProducerState()),r=fn(s);
    if(r?.then) throw new Error('async callback'); states.set(key,s);return structuredClone(r);
  }, states };
}
export function serviceFixture(store=memoryStore()) {
  const f=nativeFixture(); let nonce=0;
  const sealer=fixtureSealer();
  const provider={async subject(){return structuredClone(f.h.f.context);},async producer(context,path){
    const w=fullExpected(f.h.f.authority).workflows.find(w=>w.path===path),p=f.h.f.context.producers[path];
    return {...p,jobId:f.h.jobs.get(p.runId)[0].id,checkSuiteId:f.h.runs.find(r=>r.id===p.runId).check_suite_id,
      workflowId:w.id,path:w.path,event:w.event,appId:w.appId,check:w.jobs[0].check};
  }};
  const sourceVerifier={async verify(proof,registration){
    if(proof.schema!=='kaal.native-execution-proof/v1'||proof.workflowSha!==registration.producer.workflowSha||
       proof.governanceSha!==registration.producer.governanceSha||proof.testedSha!==registration.producer.testedSha||
       proof.testedTreeSha!==registration.producer.testedTreeSha||proof.driverDigest!=='3'.repeat(64))
      throw new Error('execution source proof mismatch');
    return {proofDigest:digest(proof),driverDigest:proof.driverDigest};
  }};
  const ports={store,authenticator:f.auth,sealer,provider,sourceVerifier,clock:{now:()=>f.h.f.now},
    nonces:{next:()=>digest({nonce:++nonce})},nativeTrust:f.nativeTrust,snapshots:{read:async()=>snapshot()},evaluatorRevision:'6'.repeat(40)};
  const service=createProducerService(ports);
  const proof={schema:'kaal.native-execution-proof/v1',workflowSha:f.p.workflowSha,governanceSha:f.p.governanceSha,
    testedSha:f.p.testedSha,testedTreeSha:f.p.testedTreeSha,driverDigest:'3'.repeat(64),commandDigest:'4'.repeat(64),dependencyDigest:'5'.repeat(64),exitStatus:0};
  return {f,ports,store,service,proof,
    async prepare(){ const opened=await this.service.open(f.h.f.context,snapshot());
      const registration=await this.service.register(opened.cohortId,f.w.path);
      const challenge=await this.service.challenge(registration.registrationId);
      const claims={...f.claims,aud:`kaal-ci-shadow/native/${challenge.nonce}/${digest(proof)}`};
      return {opened,registration,challenge,jwt:await token(claims),claims}; },
    async registerOthers(cohortId){for(const w of fullExpected(f.h.f.authority).workflows)if(w.path!==f.w.path)await this.service.register(cohortId,w.path);},
  };
}
