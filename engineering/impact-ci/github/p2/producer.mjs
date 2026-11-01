// Execution facts and population seals confer no full-matrix passing verdict.
import { digest, establishFullMatrix, fullExpected } from '../../full-policy.mjs';
import { receiptFacts } from '../auth.mjs';
export const initialProducerState = () => ({ next:1,subjects:{},cohorts:{},registrations:{},facts:{},jtis:{},invalidations:[] });
const handles=new WeakMap(), key='kaal-producers/v1';
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const scope=context=>{const copy=structuredClone(context);delete copy.producers;delete copy.generation;return copy;};
const subject=c=>digest({repositoryId:c.repositoryId,event:c.event,pr:c.pr});
const unresolved=why=>({state:'unresolved',errors:[why]});
export function executionFact(handle) {
  const fact=handle&&handles.get(handle);if(!fact)throw new Error('opaque execution fact required');return fact;
}
export function createProducerService({store,authenticator,sealer,provider,sourceVerifier,clock,nonces,nativeTrust,snapshots,evaluatorRevision,revokedIssuerKeyIds=[]}) {
  if(!store?.transaction||!authenticator?.nativeReceipt||!sealer?.sign||!sealer?.verify||!provider?.subject||!provider?.producer||
    !sourceVerifier?.verify||!clock?.now||!nonces?.next||!snapshots?.read||!/^[a-f0-9]{40}$/.test(evaluatorRevision))
    throw new TypeError('trusted producer ports required');
  const trust=freeze(structuredClone(nativeTrust)),trustDigest=digest({trust,evaluatorRevision});
  const revoked=new Set(revokedIssuerKeyIds);
  const tx=fn=>store.transaction(key,fn);
  const state=()=>tx(s=>s);
  const now=()=>{const n=clock.now();if(!Number.isSafeInteger(n)||n<0)throw new Error('trusted clock unavailable');return n;};
  function retire(s,c,reason){if(c?.active){c.active=false;c.seal=null;s.invalidations.push({cohortId:c.id,subject:subject(c.context),reason,at:now()});}}
  async function invalidate(c,reason){if(c)await tx(s=>retire(s,s.cohorts[c.id],reason));throw new Error(reason);}
  async function fresh(c){
    if(!c?.active||c.trustDigest!==trustDigest||now()<c.context.startedAt||now()>=c.context.deadline)
      return invalidate(c,'retired/expired/source-changed cohort');
    let current;
    try{current=await provider.subject(c.context);}catch(error){if(error.code==='PROVIDER_CONTEXT_CHANGED')return invalidate(c,error.message);throw error;}
    if(digest(scope(current))!==c.scopeDigest)return invalidate(c,'current subject changed');
  }
  async function authority(c,s){
    const producers=Object.fromEntries(Object.keys(c.members).map(path=>[path,c.members[path]?s.registrations[c.members[path]].producer:null]));
    const snapshot=await snapshots.read(c.context.baseSha);let handle;
    try{handle=establishFullMatrix({...c.context,producers},snapshot);}catch{return invalidate(c,'policy/source population changed');}
    const e=fullExpected(handle);
    if(e.policyDigest!==c.policyDigest||e.matrixDigest!==c.matrixDigest)return invalidate(c,'policy/source population changed');
    return handle;
  }
  async function registration(s,id){const r=s.registrations[id],c=r&&s.cohorts[r.cohortId];
    await fresh(c);if(!r||c.members[r.path]!==id)throw new Error('registration unavailable');
    await authority(c,s);
    let current;
    try{current=await provider.producer(c.context,r.path);}catch(error){if(error.code==='PRODUCER_CHANGED')return invalidate(c,error.message);throw error;}
    if(digest(current)!==digest(r.producer))return invalidate(c,'producer attempt/source identity changed');
    return {r,c};
  }
  const guarded=fn=>async(...args)=>{try{return await fn(...args);}catch(e){return unresolved(e.message);}};
  return Object.freeze({
    open:guarded(async(input,snapshot)=>{
      const base=scope(input),scopeDigest=digest(base);
      try{
        if(digest(scope(await provider.subject(base)))!==scopeDigest){
          await tx(s=>retire(s,s.cohorts[s.subjects[subject(base)]],'current subject mismatch'));
          throw new Error('current subject mismatch');
        }
      }catch(error){if(error.code==='PROVIDER_CONTEXT_CHANGED')await tx(s=>retire(s,s.cohorts[s.subjects[subject(base)]],error.message));throw error;}
      let e;
      try {
        // Policy membership comes only from the independent #790 authority.
        const prototype={...input,generation:1};
        for(const path of Object.keys(prototype.producers??{}))prototype.producers={...prototype.producers,[path]:null};
        e=fullExpected(establishFullMatrix(prototype,snapshot));
        const w=e.workflows.find(w=>w.id===384461082);
        if(!w||trust.workflowId!==w.id||trust.path!==w.path||trust.event!==w.event||trust.sourceDigest!==w.sourceDigest)
          throw new Error('native source not independently approved by selected policy');
      } catch(error){await tx(s=>retire(s,s.cohorts[s.subjects[subject(base)]],error.message));throw error;}
      return tx(s=>{
        const old=s.cohorts[s.subjects[subject(base)]];
        if(old?.active&&old.scopeDigest===scopeDigest&&old.trustDigest===trustDigest&&old.policyDigest===e.policyDigest&&old.matrixDigest===e.matrixDigest)
          return {state:old.seal?'sealed':'collecting',cohortId:old.id};
        retire(s,old,'subject or policy/source replacement');
        const generation=s.next++,id=digest({scopeDigest,generation,trustDigest});
        s.cohorts[id]={id,active:true,context:{...base,generation},scopeDigest,trustDigest,
          policyDigest:e.policyDigest,matrixDigest:e.matrixDigest,seal:null,
          members:Object.fromEntries(e.workflows.map(w=>[w.path,null]))};
        s.subjects[subject(base)]=id;return {state:'collecting',cohortId:id};
      });
    }),
    register:guarded(async(cohortId,path)=>{
      const s=await state(),c=s.cohorts[cohortId];await fresh(c);
      if(!Object.hasOwn(c.members,path))throw new Error('producer outside independent full policy');
      const a=await authority(c,s),w=fullExpected(a).workflows.find(w=>w.path===path);
      const p=await provider.producer(c.context,path);
      if(!p||p.workflowId!==w.id||p.path!==w.path||p.event!==w.event||p.appId!==w.appId||
        ![p.jobId,p.checkSuiteId].every(n=>Number.isSafeInteger(n)&&n>0))throw new Error('provider producer/job attribution unavailable');
      establishFullMatrix({...c.context,producers:{...fullExpected(a).context.producers,[path]:p}},await snapshots.read(c.context.baseSha));
      return tx(live=>{
        const current=live.cohorts[cohortId];if(!current?.active) return unresolved('registration raced retirement');
        const old=current.members[path];
        if(old&&digest(live.registrations[old].producer)!==digest(p)){
          retire(live,current,'producer population replaced');return unresolved('producer replaced; fresh cohort/full execution required');
        }
        if(current.seal&&!old)return unresolved('sealed population is immutable');
        const id=old??digest({cohortId,path,producer:p});
        live.registrations[id]??={id,cohortId,path,producer:p,nonce:null,expiresAt:null,tokenDigest:null,factId:null};
        current.members[path]=id;return {state:'registered',registrationId:id};
      });
    }),
    challenge:guarded(async(id)=>{
      const s=await state(),{r,c}=await registration(s,id);
      if(r.producer.workflowId!==trust.workflowId||r.producer.workflowSha!==trust.workflowSha||
        r.producer.check!=='Branching')throw new Error('native pilot is Branching-only');
      const nonce=nonces.next();if(!/^[a-f0-9]{64}$/.test(nonce))throw new Error('trusted random nonce unavailable');
      return tx(live=>{
        const reg=live.registrations[id];if(!live.cohorts[c.id]?.active)return unresolved('cohort retired');
        if(reg.nonce&&reg.expiresAt<=now())return unresolved('challenge expired; no implicit refresh');
        if(!reg.nonce){
          if(Object.values(live.registrations).some(r=>r.nonce===nonce))return unresolved('nonce collision');
          reg.nonce=nonce;reg.expiresAt=Math.min(now()+300000,c.context.deadline);
        }
        return {state:'challenge',nonce:reg.nonce,expiresAt:reg.expiresAt};
      });
    }),
    ingest:guarded(async(nonce,token,proof)=>{
      const s=await state(),r=Object.values(s.registrations).find(r=>r.nonce===nonce);
      if(!r)throw new Error('unknown server nonce');
      const tokenDigest=digest(token),proofDigest=digest(proof);
      if(r.factId){const old=s.facts[r.factId];
        if(r.tokenDigest!==tokenDigest||old.fact.proofDigest!==proofDigest||!await sealer.verify(old.fact,old.seal))throw new Error('replay differs from sealed fact');
        return {state:'acknowledged',factId:r.factId}; // metadata ACK, no authority capability
      }
      const {c}=await registration(s,r.id),verifiedAt=now();
      if(verifiedAt>=r.expiresAt)throw new Error('challenge expired on arrival');
      const p=r.producer;
      const authentication=receiptFacts(await authenticator.nativeReceipt(token,{nonce,proofDigest,claims:{
        run_id:p.runId,run_attempt:p.attempt,check_run_id:p.attestorCheckRunId,
        workflow_ref:`${c.context.repository}/${r.path}@${p.ref}`,workflow_sha:p.workflowSha,event_name:p.event,
        ref:p.ref,base_ref:c.context.baseRef}},verifiedAt));
      if(authentication.profile!=='trusted-native-policy-producer/v1'||digest(authentication.source)!==digest(trust)||revoked.has(authentication.issuerKeyId))throw new Error('native profile/source/key mismatch');
      const source=await sourceVerifier.verify(proof,r,c.context);
      if(source?.proofDigest!==proofDigest)throw new Error('independent execution source proof unavailable');
      const fact={schema:'kaal.executed-fact/v1',registrationId:r.id,cohortId:c.id,scopeDigest:c.scopeDigest,
        trustDigest,policyDigest:c.policyDigest,producer:p,proof,proofDigest,source,
        claims:authentication.claims,issuerKeyId:authentication.issuerKeyId,verifiedAt};
      const seal=await sealer.sign(fact),factId=digest(fact);
      if(!await sealer.verify(fact,seal))throw new Error('fact signing acknowledgement invalid');
      await registration(await state(),r.id); // requery after async verification/signing
      return tx(live=>{
        const reg=live.registrations[r.id];
        if(!live.cohorts[c.id]?.active||now()>=reg.expiresAt)return unresolved('ingress raced retirement/expiry');
        if(reg.factId)return reg.tokenDigest===tokenDigest?{state:'acknowledged',factId:reg.factId}:unresolved('nonce already consumed');
        if(live.jtis[authentication.claims.jti])return unresolved('JTI already consumed');
        live.jtis[authentication.claims.jti]=factId;live.facts[factId]={fact,seal};
        reg.factId=factId;reg.tokenDigest=tokenDigest;return {state:'accepted',factId};
      });
    }),
    seal:guarded(async(cohortId)=>{
      const s=await state(),c=s.cohorts[cohortId];await fresh(c);
      if(Object.values(c.members).some(x=>x===null))return unresolved('producer population is still provisional');
      for(const id of Object.values(c.members))await registration(s,id);
      const a=await authority(c,s),e=fullExpected(a),populationDigest=digest(c.members);
      const committed=await tx(live=>{
        const current=live.cohorts[cohortId];if(!current?.active||digest(current.members)!==populationDigest)return false;
        current.seal={contextDigest:e.contextDigest,policyDigest:e.policyDigest,matrixDigest:e.matrixDigest,populationDigest};return true;
      });
      await fresh(c);
      const latest=(await state()).cohorts[cohortId];
      if(!latest?.active||digest(latest.members)!==populationDigest)return invalidate(c,'population changed after seal');
      return committed?{state:'sealed',authority:a,context:e.context,assurance:'not-evaluated'}:unresolved('population changed before seal');
    }),
    read:guarded(async(factId)=>{
      const s=await state(),record=s.facts[factId];
      if(!record||digest(record.fact)!==factId||revoked.has(record.fact.issuerKeyId)||!await sealer.verify(record.fact,record.seal))throw new Error('fact seal/issuer unavailable/revoked/corrupt');
      const fact=record.fact,{r,c}=await registration(s,fact.registrationId);
      if(r.factId!==factId||fact.trustDigest!==trustDigest||fact.scopeDigest!==c.scopeDigest||fact.policyDigest!==c.policyDigest)
        throw new Error('fact generation/policy/source mismatch');
      const source=await sourceVerifier.verify(fact.proof,r,c.context);
      if(digest(source)!==digest(fact.source)||now()<fact.verifiedAt)throw new Error('proof source/clock changed');
      await registration(await state(),fact.registrationId);
      const handle=Object.freeze({kind:'verified-execution-fact'});handles.set(handle,freeze(structuredClone(fact)));
      return {state:'verified',handle};
    }),
  });
}
