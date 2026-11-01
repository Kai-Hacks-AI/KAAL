// Offline contract; no status publication, GitHub credentials or candidate execution.
import { fullExpected, digest } from './full-policy.mjs';
import { judgeSelection } from './selection-gate.mjs';
import { judgeExecution } from './execution-gate.mjs';

const positive = n => Number.isSafeInteger(n) && n > 0;
const instant = n => Number.isSafeInteger(n) && n >= 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Reject truncated, overlapping, inconsistent or missing API pages. */
export function completePages(pages, key) {
  if (!Array.isArray(pages) || !pages.length) throw new TypeError(`missing ${key} pages`);
  const total = pages[0]?.total_count, size = pages[0]?.per_page;
  if (!Number.isSafeInteger(total) || total < 0 || !positive(size) || size > 100 ||
      pages.length !== Math.max(1, Math.ceil(total / size))) throw new TypeError(`incomplete ${key} pagination`);
  const values = [];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i], count = Math.min(size, Math.max(0, total - i * size));
    if (p?.page !== i + 1 || p.total_count !== total || p.per_page !== size ||
        !Array.isArray(p[key]) || p[key].length !== count || Array.from(p[key]).some(x => !x || typeof x !== 'object'))
      throw new TypeError(`inconsistent ${key} page ${i + 1}`);
    values.push(...p[key]);
  }
  return values;
}

/** Assess a single immutable generation. The future publisher must serialize
 * finalization and invalidate old generations; this pure function does not publish.
 */
export function judgeFullMatrix(authority, manifest, evidence, current, now) {
  let expected;
  try { expected = fullExpected(authority); } catch (e) {
    return { verdict: 'unresolved', stage: 'authority', errors: [e.message] };
  }
  const out = (verdict, stage, errors, more = {}) => ({ verdict, stage, gate: expected.gate,
    policy: expected.policy, policyDigest: expected.policyDigest,
    contextDigest: expected.contextDigest, errors: [...new Set(errors)].sort(), ...more });
  let currentDigest;
  try { currentDigest = digest(current); } catch { currentDigest = null; }
  if (!instant(now) || now < expected.context.startedAt || currentDigest !== expected.contextDigest)
    return out('failed', 'freshness', ['evaluation context or generation is stale']);
  if (now >= expected.context.deadline)
    return out('failed', 'freshness', ['evaluation generation has expired']);
  const selection = judgeSelection(expected, manifest);
  if (selection.verdict !== 'passed') return out(selection.verdict, 'selection', selection.errors);
  if (evidence?.schema !== 'kaal.full-evidence/v1' || evidence.contextDigest !== expected.contextDigest)
    return out('unresolved', 'provenance', ['independently captured evidence unavailable']);
  let records;
  try { records = completePages(evidence.runPages, 'runs'); } catch (e) {
    return out('unresolved', 'pagination', [e.message]);
  }
  const errors = [], waits = [], ambiguous = [], observations = [], ledger = [];
  const ctx = expected.context, workflows = expected.workflows;
  if (records.some(r => !workflows.some(w => w.path === r.path && w.id === r.workflowId)))
    errors.push('unknown or incorrectly attributed workflow');
  const globallySeenJobs = new Set();
  let successNotBefore = ctx.startedAt;
  for (const w of workflows) {
    const found = records.filter(r => r.path === w.path && r.workflowId === w.id);
    if (!found.length) { waits.push(`missing workflow: ${w.path}`); continue; }
    const runIds = new Set(found.map(r => r.runId));
    if (runIds.size !== 1) { ambiguous.push(`duplicate workflow runs: ${w.path}`); continue; }
    if (found.some(r => !positive(r.runId) || !positive(r.attempt)) || new Set(found.map(r => r.attempt)).size !== found.length) {
      errors.push(`invalid/duplicate attempt: ${w.path}`); continue;
    }
    // Complete newest attempts replace prior attempts; never merge their children.
    const r = found.reduce((a, b) => a.attempt > b.attempt ? a : b);
    const pinned = ctx.producers[w.path];
    if (!pinned || pinned.runId !== r.runId || pinned.attempt !== r.attempt)
      errors.push(`producer generation changed: ${w.path}`);
    const policy = w.event === 'pull_request_target';
    const bindings = { repositoryId: ctx.repositoryId, pr: ctx.pr, headSha: ctx.headSha,
      baseSha: ctx.baseSha, testedSha: policy ? ctx.headSha : ctx.testedSha,
      workflowSha: policy ? ctx.governanceSha : ctx.testedSha, sourceDigest: w.sourceDigest,
      contextDigest: expected.contextDigest, event: w.event, appId: w.appId };
    for (const [key, value] of Object.entries(bindings))
      if (r[key] !== value) errors.push(`wrong producer ${key}: ${w.path}`);
    if (!positive(r.checkSuiteId) || !instant(r.startedAt) || r.startedAt < ctx.startedAt || r.startedAt > now)
      errors.push(`invalid producer identity/time: ${w.path}`);
    if (r.status !== 'completed') waits.push(`unfinished workflow: ${w.path}`);
    else if (r.conclusion !== 'success') errors.push(`workflow not passed: ${w.path}`);
    if (r.status === 'completed' && (!instant(r.completedAt) || r.completedAt < r.startedAt))
      errors.push(`missing producer completion: ${w.path}`);
    if (r.completedAt > now) waits.push(`future workflow completion: ${w.path}`);
    if (instant(r.completedAt)) successNotBefore = Math.max(successNotBefore, r.completedAt);
    let children;
    try { children = completePages(r.jobsPages, 'jobs'); } catch (e) {
      ambiguous.push(`${w.path}: ${e.message}`); continue;
    }
    const seen = new Set();
    for (const j of children) {
      const required = w.jobs.find(x => x.check === j.check);
      if (!required || seen.has(j.check)) { errors.push(`unexpected/duplicate job: ${w.path} ${j.check}`); continue; }
      seen.add(j.check);
      if (!positive(j.id) || globallySeenJobs.has(j.id) || j.runId !== r.runId || j.attempt !== r.attempt ||
          j.checkSuiteId !== r.checkSuiteId || j.jobKey !== required.job || !same(j.labels, required.labels))
        errors.push(`misattributed job: ${j.check}`);
      globallySeenJobs.add(j.id);
      if (!instant(j.startedAt) || j.startedAt < r.startedAt || j.startedAt > now)
        errors.push(`invalid job start: ${j.check}`);
      if (j.status !== 'completed') waits.push(`unfinished job: ${j.check}`);
      else if (j.conclusion !== 'success') errors.push(`job not passed: ${j.check}`);
      if (j.status === 'completed' && (!instant(j.completedAt) || j.completedAt < j.startedAt))
        errors.push(`missing job completion: ${j.check}`);
      if (j.status === 'completed' && r.status === 'completed' && j.completedAt > r.completedAt)
        errors.push(`job completes after its producer: ${j.check}`);
      if (j.completedAt > now) waits.push(`future job completion: ${j.check}`);
      if (instant(j.completedAt)) successNotBefore = Math.max(successNotBefore, j.completedAt);
      observations.push({ check: required.check, os: required.os, headSha: ctx.headSha,
        status: j.status, conclusion: j.conclusion });
      ledger.push({ workflow: w.path, runId: r.runId, attempt: r.attempt, jobId: j.id,
        check: j.check, os: required.os, status: j.status, conclusion: j.conclusion, completedAt: j.completedAt });
    }
    for (const j of w.jobs) if (!seen.has(j.check)) waits.push(`missing job: ${j.check}`);
  }
  if (errors.length) return out('failed', 'provenance/execution', errors, { ledger });
  if (ambiguous.length) return out('unresolved', 'inventory', ambiguous, { ledger });
  if (waits.length) return out(now >= ctx.deadline ? 'failed' : 'pending', 'completion', waits, { ledger });
  if (successNotBefore > ctx.deadline) return out('failed', 'completion', ['generation deadline exceeded'], { ledger });
  const execution = judgeExecution(manifest, observations, authority);
  return out(execution.verdict, 'execution', execution.errors, { ledger, observations, successNotBefore });
}
