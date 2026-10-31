import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { judgeExecution } from './execution-gate.mjs';
const sha = '0123456789abcdef';
const base = { headSha: sha, baseSha: 'base', policyDigest: 'policy', impactDigest: 'impact',
  resolved: true, mode: 'capability-pr',
  selected: [{ check: 'Hosting', os: 'Windows' }, { check: 'Hosting', os: 'Linux' }],
  excluded: [{ check: 'Guard', os: 'Windows' }] };
const jobs = base.selected.map(x => ({ ...x, headSha: sha, conclusion: 'success' }));
const judge = (m = base, j = jobs) => judgeExecution(m, j);
test('all selected checks pass; excluded checks do not masquerade as passed', () => {
  deepStrictEqual(judge(), { verdict: 'passed', errors: [] });
});
for (const [name, m, j] of [
  ['missing Windows job', base, jobs.slice(1)],
  ['skipped job', base, [{ ...jobs[0], conclusion: 'skipped' }, jobs[1]]],
  ['neutral job', base, [{ ...jobs[0], conclusion: 'neutral' }, jobs[1]]],
  ['cancelled job', base, [{ ...jobs[0], conclusion: 'cancelled' }, jobs[1]]],
  ['failed job', base, [{ ...jobs[0], conclusion: 'failure' }, jobs[1]]],
  ['stale SHA', base, [{ ...jobs[0], headSha: 'stale' }, jobs[1]]],
  ['duplicate job', base, [...jobs, jobs[0]]],
  ['unexpected Guard result', base, [...jobs, { check: 'Guard', os: 'Windows', headSha: sha, conclusion: 'success' }]],
  ['unresolved impact', { ...base, resolved: false }, jobs],
  ['missing ownership evidence', { ...base, impactDigest: '' }, jobs],
  ['overlapping selection', { ...base, excluded: [base.selected[0]] }, jobs],
  ['empty selection', { ...base, selected: [] }, []],
  ['unverified promotion matrix', { ...base, mode: 'full-assurance' }, jobs],
]) test(name + ' cannot pass', () => strictEqual(judge(m, j).verdict === 'passed', false));
test('verified full assurance passes only with its selected jobs', () => {
  strictEqual(judge({ ...base, mode: 'full-assurance', fullMatrixVerified: true }).verdict, 'passed');
});
