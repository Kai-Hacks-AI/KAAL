import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeFixture } from './test-fixtures.mjs';
import { createNativeProvider } from './provider.mjs';
function fixture(){const f=nativeFixture();
  return {f,provider:createNativeProvider({transport:f.h.ports.transport,contexts:{read:async()=>structuredClone(f.h.f.context)},
    assignments:{read:async()=>structuredClone(f.p)}})};
}
test('native provider joins original required job, exact attempt, suite, App and host through P1 reader',async()=>{
  const {f,provider}=fixture();await provider.subject(f.h.f.context);
  const p=await provider.producer(f.h.f.context,f.w.path);
  assert.equal(p.attestorCheckRunId,5200);assert.equal(p.jobId,1200);assert.deepEqual(p.labels,['ubuntu-latest']);
});
for(const defect of ['App','suite','attempt','foreign URL','labels','closed PR','truncation','check SHA'])
  test(`native provider refuses ${defect}`,async()=>{
    const {f,provider}=fixture();f.h.onRequest((q,r)=>{
      if(q.path.includes('/check-runs/')&&defect==='App')r.body.app.id++;
      if(q.path.includes('/check-runs/')&&defect==='suite')r.body.check_suite.id++;
      if(q.path.includes('/check-runs/')&&defect==='check SHA')r.body.head_sha='0'.repeat(40);
      if(q.path.includes('/jobs?')){
        if(defect==='attempt')r.body.jobs[0].run_attempt++;
        if(defect==='foreign URL')r.body.jobs[0].check_run_url='https://attacker.invalid/5200';
        if(defect==='labels')r.body.jobs[0].labels=['windows-latest'];
        if(defect==='truncation')r.body.total_count++;
      }
      if(q.path.includes('/pulls/')&&defect==='closed PR')r.body.state='closed';return r;
    });
    await assert.rejects(async()=>{await provider.subject(f.h.f.context);await provider.producer(f.h.f.context,f.w.path);});
    assert.ok(f.h.requests.every(r=>r.method==='GET'&&r.redirect==='error'));
  });
test('competing native run on a later provider page is never hidden behind the selected run',async()=>{
  const {f,provider}=fixture(),run=f.h.runs.find(r=>r.id===f.p.runId);
  for(let i=0;i<100;i++)f.h.runs.push({...run,id:9000+i,workflow_id:0});
  f.h.runs.push({...run,id:80000});
  await assert.rejects(provider.producer(f.h.f.context,f.w.path),/competing/);
  assert.ok(f.h.requests.some(r=>r.path.includes('page=2')));
});
