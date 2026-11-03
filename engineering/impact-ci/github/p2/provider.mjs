// Native pilot only. Reuse P1's fixed-origin reader and #790 pagination contract.
// The independent context/assignment loaders are trusted ports, not PR inputs.
import { createGithubReader } from '../acquire.mjs';
import { completePages } from '../../full-gate.mjs';
import { fullWorkflows } from '../../full-policy.mjs';
const root='/repos/Kai-Hacks-AI/KAAL';
const changed=(message,code)=>{throw Object.assign(new Error(message),{code});};
export function createNativeProvider({transport,contexts,assignments}) {
  if(!contexts?.read||!assignments?.read)throw new TypeError('independent provider context/source registrations required');
  const {get,pages}=createGithubReader({transport});
  return Object.freeze({
    async subject(request){
      const c=await contexts.read(request);
      if(c.repositoryId!==1415996637||c.repository!=='Kai-Hacks-AI/KAAL'||c.event!=='pull_request')throw new Error('native pilot supports applicable repository PRs only');
      const repo=await get(root+'/'),pr=await get(`${root}/pulls/${c.pr}`);
      if(repo.id!==c.repositoryId||repo.full_name!==c.repository||pr.number!==c.pr||pr.state!=='open'||
        pr.base?.repo?.id!==c.repositoryId||pr.base.ref!==c.baseRef||pr.base.sha!==c.baseSha||
        pr.head?.repo?.id!==c.headRepositoryId||pr.head.sha!==c.headSha||pr.merge_commit_sha!==c.testedSha)
        changed('current provider PR/repository/revision mismatch','PROVIDER_CONTEXT_CHANGED');
      return c;
    },
    async producer(c,path){
      const w=fullWorkflows(c).find(w=>w.path===path);
      if(w?.id!==384461082||w.event!=='pull_request_target')throw new Error('native provider is Branching-only');
      const p=await assignments.read(c,path);
      const population=completePages(await pages(`${root}/actions/runs?head_sha=${c.headSha}`,'workflow_runs','runs'),'runs')
        .filter(r=>r.workflow_id===w.id&&r.path===path&&r.event===w.event);
      if(population.length!==1||population[0].id!==p.runId||population[0].run_attempt!==p.attempt)
        changed('competing/missing native execution generation','PRODUCER_CHANGED');
      const r=await get(`${root}/actions/runs/${p.runId}`);
      if(r.id!==p.runId||r.run_attempt!==p.attempt||r.workflow_id!==w.id||r.path!==path||r.event!==w.event||
        r.repository?.id!==c.repositoryId||r.head_sha!==p.providerRunSha||r.head_sha!==c.headSha||!Number.isSafeInteger(r.check_suite_id))
        changed('native run/attempt/source attribution mismatch','PRODUCER_CHANGED');
      const jobs=completePages(await pages(`${root}/actions/runs/${p.runId}/attempts/${p.attempt}/jobs`,'jobs','jobs'),'jobs');
      const match=jobs.filter(j=>j.name==='Branching');
      if(jobs.length!==1||match.length!==1)throw new Error('native required job population ambiguous');
      const j=match[0],url=`https://api.github.com${root}/check-runs/${p.attestorCheckRunId}`;
      if(j.run_id!==p.runId||j.run_attempt!==p.attempt||j.check_run_url!==url||!Number.isSafeInteger(j.id)||j.id<=0||
        JSON.stringify(j.labels)!==JSON.stringify(w.jobs[0].labels))
        throw new Error('original native job/check relationship missing');
      const check=await get(`${root}/check-runs/${p.attestorCheckRunId}`);
      if(check.id!==p.attestorCheckRunId||check.app?.id!==w.appId||check.check_suite?.id!==r.check_suite_id||
        check.head_sha!==p.providerCheckSha||check.name!=='Branching'||check.status!==j.status||check.conclusion!==j.conclusion)
        throw new Error('same-App forged or changed native check');
      return {...p,jobId:j.id,checkSuiteId:r.check_suite_id,workflowId:w.id,path,event:w.event,appId:w.appId,check:'Branching',labels:j.labels};
    },
  });
}
