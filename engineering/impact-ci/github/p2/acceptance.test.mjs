// Real local SQL + Git; provider/OIDC/runtime-capture inputs remain synthetic.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execute, initialize } from 'kaal-hosting';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gitSourceFixture } from './source-fixtures.mjs';
import { serviceFixture } from './test-fixtures.mjs';
import { authFixture } from '../fixtures.mjs';
import { createNativeProvider } from './provider.mjs';
import { createProducerService, initialProducerState, executionFact } from './producer.mjs';
import { createSqliteStore } from './sqlite.mjs';
test('consumer retains failed original-job provenance across real Git/SQLite restart without publishing a check',async()=>{
  const git=await gitSourceFixture(),h=serviceFixture(),f=h.f,rev=git.producer.governanceSha;
  f.h.f.context.headSha=rev;f.h.f.context.parents[1]=rev;
  Object.assign(f.p,git.producer,{runId:102,jobId:1200,attestorCheckRunId:5200,checkSuiteId:202,providerRunSha:rev});
  f.h.runs.find(r=>r.id===f.p.runId).head_sha=rev;
  f.h.jobs.get(f.p.runId)[0].conclusion='failure';f.h.checks.get(f.p.attestorCheckRunId).conclusion='failure';
  f.nativeTrust.workflowSha=rev;f.claims.workflow_sha=rev;
  Object.assign(h.proof,git.proof,{runId:102,attempt:1,jobId:1200,checkRunId:5200,checkSuiteId:202,
    pr:f.h.f.context.pr,baseSha:f.h.f.context.baseSha,headSha:rev,baseRef:'main'});
  h.ports.authenticator=authFixture({nativeTrust:f.nativeTrust});h.ports.sourceVerifier=git.reader;
  h.ports.provider=createNativeProvider({transport:f.h.ports.transport,contexts:{read:async()=>structuredClone(f.h.f.context)},
    assignments:{read:async()=>structuredClone(f.p)}});
  const cwd=join(tmpdir(),`kaal-p2-acceptance-${Date.now()}-${process.pid}`);await initialize(cwd,{});
  const config={execute,node:process.execPath,cwd,path:join(cwd,'receipt.db'),initial:initialProducerState};
  h.ports.store=createSqliteStore(config);h.service=createProducerService(h.ports);
  const p=await h.prepare(),accepted=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);
  assert.equal(accepted.state,'accepted',JSON.stringify(accepted));
  f.h.f.now+=180000;h.ports.store=createSqliteStore(config);h.service=createProducerService(h.ports);
  const result=await h.service.read(accepted.factId);assert.equal(result.state,'verified',JSON.stringify(result));
  assert.equal(executionFact(result.handle).proof.exitStatus,1);
  assert.equal(f.h.checks.get(5200).conclusion,'failure');
  assert.ok(f.h.requests.every(r=>r.method==='GET'));
  assert.equal(result.verdict,undefined);assert.equal(result.gate,undefined);
});
