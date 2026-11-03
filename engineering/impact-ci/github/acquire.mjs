// Provider transport, current context and execution-proof reader are trusted
// ports. No live implementation or candidate-code execution is installed here.
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { fullExpected, establishFullMatrix } from '../full-policy.mjs';
import { completePages } from '../full-gate.mjs';
import { receiptFacts } from './auth.mjs';
import { digest } from '../policy-identity.mjs';
const root = '/repos/Kai-Hacks-AI/KAAL';
const validId = n => Number.isSafeInteger(n) && n > 0;
const when = value => value === null ? null : Date.parse(value);
export function createGithubReader({transport}) {
  if(!transport?.request)throw new TypeError('trusted provider transport required');
  async function get(path) {
    if (!path.startsWith(root + '/') || path.includes('..') || path.includes('://')) throw new Error('unsafe API path');
    const response = await transport.request({ method: 'GET', path, redirect: 'error' });
    if (response.status !== 200 || response.origin !== 'https://api.github.com') throw new Error(`provider read unresolved: ${response.status}`);
    return response.body;
  }
  async function pages(path, field, normalized) {
    const result = [];
    for (let page = 1; page <= 100; page++) {
      const body = await get(path + `${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
      result.push({ page, per_page: 100, total_count: body.total_count, [normalized]: body[field] });
      if (!Number.isSafeInteger(body.total_count) || body.total_count < 0 || body.total_count > 10000) throw new Error('provider population capped/invalid');
      if (page >= Math.max(1, Math.ceil(body.total_count / 100))) { completePages(result, normalized); return result; }
    }
    throw new Error('provider pagination unresolved');
  }
  return Object.freeze({get,pages});
}
export function createAcquirer({ transport, authenticator, receiptStore, proofReader, readCurrent, clock }) {
  if (!transport?.request || !authenticator?.receipt || !receiptStore?.get || !proofReader?.read || !readCurrent || !clock?.now)
    throw new TypeError('trusted acquisition ports required');
  const {get,pages}=createGithubReader({transport});
  return Object.freeze({ async acquire(input, snapshot, now) {
    try {
      const context = structuredClone(input);
      if (context.evidenceSchema !== 'kaal.full-evidence/v2') throw new Error('authenticated v2 context required');
      const authority = establishFullMatrix(context, snapshot), expected = fullExpected(authority);
      const capture = { repository: null, subject: null, scans: [], producers: [] };
      const current = await readCurrent(context);
      if (digest(current) !== expected.contextDigest) throw new Error('provider context advanced');
      const repository = await get(root + '/');
      capture.repository = repository;
      if (repository.id !== context.repositoryId || repository.full_name !== context.repository) throw new Error('provider repository mismatch');
      // Fetch the current PR/ref independently, even when a transport supplies a
      // convenient context callback. Neither receipt nor candidate supplies it.
      const subject = context.event === 'pull_request' ? await get(`${root}/pulls/${context.pr}`)
        : await get(`${root}/git/ref/heads/main`);
      capture.subject = subject;
      if (context.event === 'pull_request' ? subject.number !== context.pr || subject.state !== 'open' ||
          subject.base?.repo?.id !== context.repositoryId || subject.base.ref !== context.baseRef ||
          subject.base.sha !== context.baseSha || subject.head?.sha !== context.headSha || subject.head?.repo?.id !== context.headRepositoryId ||
          subject.merge_commit_sha !== context.testedSha : subject.object?.sha !== context.headSha)
        throw new Error('current provider subject mismatch');
      async function discover() {
        const discovered = new Map();
        for (const sha of new Set([context.headSha, context.testedSha, context.governanceSha,
          ...Object.values(context.producers).filter(Boolean).map(p => p.providerRunSha)])) {
        const runPages = await pages(`${root}/actions/runs?head_sha=${sha}`, 'workflow_runs', 'runs');
        capture.scans.push({ sha, runPages });
        const listed = completePages(runPages, 'runs');
        for (const run of listed) {
          if (!validId(run.id) || run.head_sha !== sha || run.repository?.id !== context.repositoryId) throw new Error('invalid provider run identity');
          const old = discovered.get(run.id);
          if (old && digest(old) !== digest(run)) throw new Error('provider population changed during scan');
          discovered.set(run.id, run);
        }
        }
        return discovered;
      }
      const discovered = await discover();
      const records = [], audit = [];
      for (const run of discovered.values()) {
        const w = expected.workflows.find(w => w.id === run.workflow_id && w.path === run.path && w.event === run.event);
        if (!w) { audit.push({ runId: run.id, disposition: 'outside selected policy event/workflow' }); continue; }
        const p = context.producers[w.path];
        if (!p || p.runId !== run.id || p.attempt !== run.run_attempt) throw new Error('competing/unregistered producer generation');
        const raw = await get(`${root}/actions/runs/${run.id}`);
        const observedAt = clock.now();
        if (!Number.isSafeInteger(observedAt) || observedAt < now) throw new Error('acquisition clock regressed');
        if (raw.id !== run.id || raw.workflow_id !== w.id || raw.path !== w.path || raw.event !== w.event ||
            raw.run_attempt !== p.attempt || raw.repository?.id !== context.repositoryId || raw.head_sha !== run.head_sha || raw.head_sha !== p.providerRunSha ||
            !validId(raw.check_suite_id)) throw new Error('run changed or misattributed');
        const receipt = await authenticator.receipt(await receiptStore.get(p.runId, p.attempt), {
          contextDigest: expected.contextDigest, claims: { run_id: p.runId, run_attempt: p.attempt,
            workflow_sha: p.workflowSha, event_name: w.event, check_run_id: p.attestorCheckRunId,
            workflow_ref: `${context.repository}/${w.path}@${p.ref}`,
            ref: p.ref, base_ref: context.event === 'pull_request' ? context.baseRef : '' },
        }, observedAt);
        const claims = receiptFacts(receipt).claims;
        const source = await get(`${root}/contents/${w.path}?ref=${p.workflowSha}`);
        if (source.encoding !== 'base64' || typeof source.content !== 'string') throw new Error('workflow source unavailable');
        const bytes = Uint8Array.from(atob(source.content.replace(/\s/g, '')), c => c.charCodeAt(0));
        if (sha256(bytes) !== w.sourceDigest) throw new Error('candidate workflow source drift');
        // This port must prove checkout AND checker bytes using an approved
        // isolated driver/Git path. Signed workflow identity alone is insufficient.
        const proof = await proofReader.read({ context, producer: p, workflow: w, claims });
        for (const key of ['workflowSha', 'governanceSha', 'testedSha'])
          if (!proof || proof[key] !== p[key]) throw new Error(`execution proof missing/mismatched ${key}`);
        if (proof.testedTreeSha !== p.testedTreeSha || proof.repositoryId !== context.repositoryId ||
            proof.headRepositoryId !== context.headRepositoryId || proof.contextDigest !== expected.contextDigest ||
            proof.runId !== p.runId || proof.attempt !== p.attempt) throw new Error('execution tree/context proof mismatch');
        const rawPages = await pages(`${root}/actions/runs/${p.runId}/attempts/${p.attempt}/jobs`, 'jobs', 'jobs');
        const jobPages = [], rawChecks = []; let attestorJoined = false;
        for (const page of rawPages) {
          const jobs = [];
          for (const j of page.jobs) {
            const parsed = /^https:\/\/api\.github\.com\/repos\/Kai-Hacks-AI\/KAAL\/check-runs\/(\d+)$/.exec(j.check_run_url ?? '');
            if (!parsed || !validId(j.id) || j.run_id !== p.runId || j.run_attempt !== p.attempt) throw new Error('unsafe job/check-run attribution');
            const check = await get(`${root}/check-runs/${parsed[1]}`);
            rawChecks.push(check);
            if (check.id !== Number(parsed[1]) || check.app?.id !== w.appId || check.name !== j.name ||
                check.check_suite?.id !== raw.check_suite_id || check.head_sha !== p.providerCheckSha ||
                check.status !== j.status || check.conclusion !== j.conclusion) throw new Error('job producer identity/outcome mismatch');
            if (check.id === p.attestorCheckRunId) attestorJoined = true;
            const declared = w.jobs.find(k => k.check === j.name);
            jobs.push({ id: j.id, runId: p.runId, attempt: p.attempt, checkSuiteId: raw.check_suite_id,
              jobKey: declared?.job ?? 'unknown', check: j.name, labels: j.labels,
              status: j.status, conclusion: j.conclusion, startedAt: when(j.started_at), completedAt: when(j.completed_at) });
          }
          jobPages.push({ ...page, jobs });
        }
        if (!attestorJoined) throw new Error('attestor receipt not joined to exact producer jobs');
        capture.producers.push({ run: raw, rawJobPages: rawPages, checks: rawChecks,
          source: { path: w.path, revision: p.workflowSha, digest: w.sourceDigest }, proof,
          receipt: { issuer: claims.iss, attestorSha: claims.job_workflow_sha, checkRunId: claims.check_run_id,
            runId: claims.run_id, attempt: claims.run_attempt, expiresAt: claims.exp }, terminalObservedAt: observedAt });
        records.push({ workflowId: w.id, path: w.path, workflowSha: p.workflowSha,
          governanceSha: p.governanceSha, testedSha: p.testedSha, testedTreeSha: p.testedTreeSha, sourceDigest: w.sourceDigest,
          event: w.event, appId: w.appId, repositoryId: context.repositoryId, pr: context.pr,
          headSha: context.headSha, baseSha: context.baseSha, contextDigest: expected.contextDigest,
          runId: p.runId, attempt: p.attempt, checkSuiteId: raw.check_suite_id, status: raw.status,
          conclusion: raw.conclusion, startedAt: when(raw.run_started_at),
          terminalObservedAt: raw.status === 'completed' ? observedAt : null, jobsPages: jobPages });
      }
      const after = await discover();
      if (digest([...discovered.values()].sort((a,b) => a.id-b.id)) !== digest([...after.values()].sort((a,b) => a.id-b.id)))
        throw new Error('provider execution population changed during acquisition');
      if (digest(await get(context.event === 'pull_request' ? `${root}/pulls/${context.pr}` : `${root}/git/ref/heads/main`)) !== digest(subject))
        throw new Error('provider subject advanced during acquisition');
      if (digest(await readCurrent(context)) !== expected.contextDigest) throw new Error('context advanced during acquisition');
      return { kind: 'acquired', authority, audit, capture, evidence: { schema: 'kaal.full-evidence/v2',
        contextDigest: expected.contextDigest, runPages: [{ page: 1, per_page: 100, total_count: records.length, runs: records }] } };
    } catch (error) { return { kind: 'unresolved', errors: [error.message] }; }
  } });
}
