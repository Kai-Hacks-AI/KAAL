// Synthetic positive evidence, deliberately separate from captured provider history.
import { readFileSync } from 'node:fs';
import anchors from './full-matrix-anchors.json' with { type: 'json' };
import { establishFullMatrix, fullExpected, fullManifest, fullWorkflows } from './full-policy.mjs';
export const time = Date.parse('2026-11-01T10:00:00Z');
export const snapshot = () => ({ revision: 'b'.repeat(40), sources: Object.fromEntries(
  Object.keys(anchors.sources).map(p => [p, readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')])) });
export function fixture(event = 'pull_request', baseRef = 'kaal/ci-gates') {
  const headSha = 'a'.repeat(40), baseSha = 'b'.repeat(40), testedSha = event === 'push' ? headSha : 'c'.repeat(40);
  const context = { repository: 'Kai-Hacks-AI/KAAL', repositoryId: 1415996637,
    event, baseRef, headSha, baseSha, testedSha, testedTreeSha: 'd'.repeat(40),
    governanceSha: 'e'.repeat(40), publicationSha: testedSha,
    parents: event === 'push' ? [baseSha] : [baseSha, headSha], pr: event === 'push' ? null : 800,
    generation: 1, startedAt: time, deadline: time + 600000 };
  context.producers = Object.fromEntries(fullWorkflows(context).map((w, i) => [w.path, { runId: 100 + i, attempt: 1 }]));
  const authority = establishFullMatrix(context, snapshot());
  const expected = fullExpected(authority), manifest = fullManifest(authority);
  const records = expected.workflows.map((w, i) => {
    const runId = 100 + i, checkSuiteId = 200 + i;
    const completedAt = time + 30000;
    return { workflowId: w.id, path: w.path, workflowSha: w.event === 'pull_request_target' ? context.governanceSha : context.testedSha,
      sourceDigest: w.sourceDigest, event: w.event, appId: w.appId,
      repositoryId: context.repositoryId, pr: context.pr, headSha, baseSha,
      testedSha: w.event === 'pull_request_target' ? headSha : testedSha,
      contextDigest: expected.contextDigest, runId, attempt: 1, checkSuiteId,
      status: 'completed', conclusion: 'success', startedAt: time, completedAt,
      jobsPages: [{ page: 1, per_page: 100, total_count: w.jobs.length,
        jobs: w.jobs.map((j, k) => ({ id: 1000 + i * 100 + k, runId, attempt: 1, checkSuiteId,
          jobKey: j.job, check: j.check, labels: j.labels, status: 'completed', conclusion: 'success',
          startedAt: time + 1000, completedAt })) }] };
  });
  const evidence = { schema: 'kaal.full-evidence/v1', contextDigest: expected.contextDigest,
    runPages: [{ page: 1, per_page: 100, total_count: records.length, runs: records }] };
  return { authority, context, manifest, evidence, now: time + 40000 };
}
export const evaluate = (judge, f) => judge(f.authority, f.manifest, f.evidence, f.context, f.now);
export function refresh(f) {
  f.authority = establishFullMatrix(f.context, snapshot());
  f.manifest = fullManifest(f.authority);
  f.evidence.contextDigest = f.authority.contextDigest;
  for (const p of f.evidence.runPages) for (const r of p.runs) r.contextDigest = f.authority.contextDigest;
}
