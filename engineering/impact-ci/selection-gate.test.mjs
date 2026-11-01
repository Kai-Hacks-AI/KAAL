import { test } from 'node:test';
import { strictEqual, match, deepStrictEqual } from 'node:assert';
import { judgeSelection, judgeAggregate } from './selection-gate.mjs';
const context = { event: 'pull_request', baseRef: 'kaal/engineering' };
const hosting = { check: 'Hosting', os: 'Linux' };
const guard = { check: 'Guard', os: 'Windows' };
const expected = { ...context, inventory: [hosting, guard], nonImpact: [], authoritative: true, resolved: true, headSha: 'head', baseSha: 'base',
  policyDigest: 'policy', impactDigest: 'impact', required: [hosting, guard] };
const manifest = { ...context, headSha: 'head', baseSha: 'base', policyDigest: 'policy',
  impactDigest: 'impact', resolved: true, mode: 'capability-pr',
  selected: [hosting, guard], excluded: [] };
const observations = [hosting, guard].map(x => ({ ...x, headSha: 'head', conclusion: 'success' }));
test('complete independently governed selection and execution pass', () =>
  strictEqual(judgeAggregate(expected, manifest, observations, context).verdict, 'passed'));
test('omitted impacted Guard Windows from selected AND excluded fails at selection', () => {
  const m = { ...manifest, selected: [hosting] };
  const r = judgeAggregate(expected, m, observations.slice(0, 1), context);
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
  const r = judgeAggregate(expected, manifest, observations.slice(0, 1), context);
  strictEqual(r.stage, 'execution');
  strictEqual(r.verdict, 'failed');
});

// Boundary regressions use a complete, independently supplied policy fixture.
const unaffected = { check: 'Acceptance', os: 'macOS', reason: 'target closure: no affected Case' };
const policy = { ...expected, inventory: [hosting, guard, unaffected], nonImpact: [unaffected] };
const selection = { ...manifest, excluded: [unaffected] };
test('complete policy fixture with auditable non-impact passes', () =>
  strictEqual(judgeAggregate(policy, selection, observations, context).verdict, 'passed'));
for (const [name, e, m] of [
  ['non-string provenance', { ...policy, policyDigest: 1 }, { ...selection, policyDigest: 1 }],
  ['missing policy inventory', { ...policy, inventory: undefined }, selection],
  ['duplicate inventory', { ...policy, inventory: [...policy.inventory, hosting] }, selection],
  ['required check outside policy', { ...policy, inventory: [hosting, unaffected] }, selection],
  ['empty required matrix', { ...policy, required: [] }, { ...selection, selected: [] }],
  ['unknown excluded job', policy, { ...selection, excluded: [...selection.excluded, { check: 'Bogus', os: 'Linux', reason: 'ignored' }] }],
  ['silently omitted unaffected job', policy, { ...selection, excluded: [] }],
  ['missing non-impact evidence', { ...policy, nonImpact: [] }, selection],
  ['blank non-impact evidence', { ...policy, nonImpact: [{ ...unaffected, reason: ' ' }] }, selection],
  ['forged exclusion reason', policy, { ...selection, excluded: [{ ...unaffected, reason: 'candidate says so' }] }],
  ['new dependent not in selection', { ...policy, required: policy.inventory, nonImpact: [] }, selection],
  ['unresolved manifest', policy, { ...selection, resolved: false }],
  ['sparse selected array', policy, { ...selection, selected: Array(2) }],
  ['delimiter collision', { ...policy, inventory: [{ check: 'A@B', os: 'C' }], required: [{ check: 'A@B', os: 'C' }], nonImpact: [] },
    { ...selection, selected: [{ check: 'A', os: 'B@C' }], excluded: [] }],
]) test(name + ' fails closed', () => strictEqual(judgeSelection(e, m).verdict === 'passed', false));
for (const [name, c] of [
  ['main PR', { event: 'pull_request', baseRef: 'main' }],
  ['main push', { event: 'push', baseRef: 'main' }],
  ['unknown event', { event: 'workflow_dispatch', baseRef: 'kaal/engineering' }],
  ['unknown target', { event: 'pull_request', baseRef: 'other' }],
  ['missing context', undefined],
]) test(name + ' cannot use selective green', () => {
  const r = judgeAggregate(policy, selection, observations, c);
  strictEqual(r.stage, 'target');
  strictEqual(r.verdict, 'unresolved');
});
test('main cannot use a self-attested full matrix', () => {
  const r = judgeAggregate(policy, { ...selection, mode: 'full-assurance', fullMatrixVerified: true }, observations,
    { event: 'pull_request', baseRef: 'main' });
  strictEqual(r.verdict, 'unresolved');
  strictEqual(r.stage, 'target');
});
test('expected context must match trusted caller context', () =>
  strictEqual(judgeAggregate(policy, selection, observations, { ...context, baseRef: 'kaal/hosting' }).verdict, 'failed'));
test('manifest target cannot be changed independently', () =>
  strictEqual(judgeAggregate(policy, { ...selection, baseRef: 'kaal/hosting' }, observations, context).verdict, 'failed'));
test('execution checker cannot be replaced by a caller supplied passing function', () =>
  strictEqual(judgeAggregate(policy, selection, [], () => ({ verdict: 'passed', errors: [] })).verdict === 'passed', false));
test('reordering valid policy and selection leaves the result unchanged', () =>
  deepStrictEqual(judgeSelection(policy, selection), judgeSelection({ ...policy,
    inventory: [...policy.inventory].reverse(), required: [...policy.required].reverse() },
    { ...selection, selected: [...selection.selected].reverse() })));
test('matching target evidence cannot bypass the main assurance boundary', () => {
  const main = { event: 'pull_request', baseRef: 'main' };
  strictEqual(judgeAggregate({ ...policy, ...main }, { ...selection, ...main }, observations, main).verdict, 'unresolved');
});

