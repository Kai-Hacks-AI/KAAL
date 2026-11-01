// Retrospective analysis of provider captures, not a second run recorder.
// Raw Actions metadata cannot authenticate tested bytes/workflow source/PR binding;
// preserve those unknowns rather than filling them with matching fixture strings.
import { fullExpected, fullWorkflows, gateFor } from './full-policy.mjs';
import { completePages } from './full-gate.mjs';

export function replayActions(authority, capture, at) {
  return replay(fullExpected(authority), capture, at);
}

/** Timeline-only view. It cannot certify assurance or manufacture absent current
 * provider context. No synthetic merge/tree/parent identities are needed. */
export function replayHistory(subject, capture, at) {
  if (subject?.repositoryId !== 1415996637 || !/^[a-f0-9]{40}$/.test(subject?.headSha ?? '') || !gateFor(subject))
    return { verdict: 'unresolved', findings: ['unsupported historical subject'], ledger: [] };
  return replay({ headSha: subject.headSha, context: { repositoryId: subject.repositoryId },
    workflows: fullWorkflows(subject), gate: gateFor(subject) }, capture, at);
}

function replay(expected, capture, at) {
  const findings = ['raw Actions capture lacks independently verified workflow/execution revision and current PR/target binding'];
  const ledger = [], incomplete = [], missing = [];
  if (capture?.schema !== 'kaal.captured-actions/v1' || capture.headSha !== expected.headSha ||
      !Array.isArray(capture.captures) || !Number.isSafeInteger(at))
    return { verdict: 'unresolved', findings: ['malformed or incorrectly attributed provider capture'], ledger };
  for (const w of expected.workflows) {
    const rows = capture.captures.filter(c => c?.run?.workflow_id === w.id && c.run.path === w.path &&
      c.run.event === w.event && c.run.head_sha === expected.headSha && c.repository_id === expected.context.repositoryId);
    if (!rows.length) { missing.push(w.path); continue; }
    if (new Set(rows.map(c => c.run.id)).size !== 1) findings.push(`duplicate workflow runs: ${w.path}`);
    for (const row of rows) {
      let jobs;
      try { jobs = completePages([row.jobs], 'jobs'); } catch (e) { findings.push(e.message); continue; }
      for (const required of w.jobs) {
        const seen = jobs.filter(j => j.name === required.check);
        if (seen.length !== 1) { findings.push(`missing/duplicate required job: ${row.run.id} ${required.check}`); continue; }
        const j = seen[0];
        const finished = Date.parse(j.completed_at), started = Date.parse(j.started_at);
        const completed = j.status === 'completed' && Number.isFinite(finished) && finished <= at;
        const state = completed ? j.conclusion : Number.isFinite(started) && started <= at ? 'in_progress' : 'not_reported';
        if (state !== 'success') incomplete.push({ runId: row.run.id, check: required.check, state });
        if (j.run_id !== row.run.id || j.run_attempt !== row.run.run_attempt ||
            JSON.stringify(j.labels) !== JSON.stringify(required.labels)) findings.push(`job identity/platform mismatch: ${j.id}`);
        ledger.push({ runId: row.run.id, attempt: row.run.run_attempt, jobId: j.id,
          workflow: w.path, check: required.check, os: required.os, state,
          completedAt: completed ? j.completed_at : null });
      }
    }
  }
  return { verdict: 'unresolved', gate: expected.gate, at: new Date(at).toISOString(),
    completionReady: !missing.length && !incomplete.length,
    findings: [...new Set(findings)].sort(), missing, incomplete, ledger };
}
