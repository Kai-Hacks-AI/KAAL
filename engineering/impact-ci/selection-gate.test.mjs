import { test } from 'node:test';
import { strictEqual, match } from 'node:assert';
import { judgeSelection, judgeAggregate } from './selection-gate.mjs';
import { judgeExecution } from './execution-gate.mjs';
const hosting = { check: 'Hosting', os: 'Linux' };
const guard = { check: 'Guard', os: 'Windows' };
const expected = { authoritative: true, resolved: true, headSha: 'head', baseSha: 'base',
  policyDigest: 'policy', impactDigest: 'impact', required: [hosting, guard] };
const manifest = { headSha: 'head', baseSha: 'base', policyDigest: 'policy',
  impactDigest: 'impact', resolved: true, mode: 'capability-pr',
  selected: [hosting, guard], excluded: [] };
const observations = [hosting, guard].map(x => ({ ...x, headSha: 'head', conclusion: 'success' }));
test('complete independently governed selection and execution pass', () =>
  strictEqual(judgeAggregate(expected, manifest, observations, judgeExecution).verdict, 'passed'));
test('omitted impacted Guard Windows from selected AND excluded fails at selection', () => {
  const m = { ...manifest, selected: [hosting] };
  const r = judgeAggregate(expected, m, observations.slice(0, 1), judgeExecution);
  strictEqual(r.stage, 'selection');
  strictEqual(r.verdict, 'failed');
  match(r.errors.join(' '), /Guard@Windows/);
});
for (const [name, e, m] of [
  ['unavailable authoritative C11 evidence', { ...expected, authoritative: false }, manifest],
  ['unresolved ownership or trace', { ...expected, resolved: false }, manifest],
  ['unknown policy digest', { ...expected, policyDigest: '' }, manifest],
  ['candidate-altered policy', expected, { ...manifest, policyDigest: 'candidate' }],
  ['stale head SHA', expected, { ...manifest, headSha: 'stale' }],
  ['missing dependency in selection', expected, { ...manifest, selected: [hosting] }],
  ['excluded impacted Guard', expected, { ...manifest, selected: [hosting], excluded: [guard] }],
  ['duplicated selection', expected, { ...manifest, selected: [hosting, hosting, guard] }],
]) test(name + ' fails closed', () => strictEqual(judgeSelection(e, m).verdict === 'passed', false));
test('execution failure blocks after complete selection', () => {
  const r = judgeAggregate(expected, manifest, observations.slice(0, 1), judgeExecution);
  strictEqual(r.stage, 'execution');
  strictEqual(r.verdict, 'failed');
});
