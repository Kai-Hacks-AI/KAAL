import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './full-fixtures.mjs';
import { fullExpected } from './full-policy.mjs';
import { resolveAssurancePolicy, selectAssurancePolicy } from './assurance-policy.mjs';
import { workflowDefinitions } from './workflow-definitions.mjs';
import mainPolicy from './policies/main.json' with { type: 'json' };
import lineagePolicy from './policies/lineage.json' with { type: 'json' };
import { judgeFullMatrix } from './full-gate.mjs';

for (const [event, target, id, profile] of [
  ['pull_request', 'main', 'kaal-main', 'main-pr'],
  ['push', 'main', 'kaal-main', 'main-push'],
  ['pull_request', 'kaal/ci-gates', 'kaal-lineage', 'lineage-pr'],
  ['pull_request', 'kaal/guard', 'kaal-lineage', 'lineage-guard-pr'],
]) test(`${event} ${target} carries its independently versioned policy identity`, () => {
  const e = fullExpected(fixture(event, target).authority);
  assert.deepEqual(e.policy, { id, version: '1.0.0', profile });
});

test('equal current PR counts do not give Main and Lineage the same policy identity/digest', () => {
  const main = fullExpected(fixture('pull_request', 'main').authority);
  const lineage = fullExpected(fixture().authority);
  assert.equal(main.inventory.length, lineage.inventory.length);
  assert.notEqual(main.policyDigest, lineage.policyDigest);
});

const policies = () => structuredClone([mainPolicy, lineagePolicy]);
const contexts = {
  main: [{ event: 'pull_request', baseRef: 'main' }, { event: 'push', baseRef: 'main' }],
  lineage: [{ event: 'pull_request', baseRef: 'kaal/ci-gates' }, { event: 'pull_request', baseRef: 'kaal/guard' }],
};
const project = (context, definitions = policies(), catalog = workflowDefinitions) => resolveAssurancePolicy(context, definitions, catalog);

for (const [changed, unaffected, index] of [['main', 'lineage', 0], ['lineage', 'main', 1]]) {
  test(`versioning and extending ${changed} inventory leaves every ${unaffected} profile unchanged`, () => {
    const original = policies(), next = policies();
    const before = contexts[unaffected].map(c => project(c, original));
    const current = project(contexts[changed][0], original);
    next[index].version = '1.1.0';
    const workflow = `future-${changed}.yml`, check = `Future ${changed} assurance`;
    next[index].profiles[0].required.push({ workflow, event: 'pull_request', checks: [{ check, os: 'Linux' }] });
    // A new producer definition may be shared by the catalog without implicitly
    // making it an obligation of the other assurance policy.
    const catalog = { ...workflowDefinitions, [workflow]: {
      file: workflow, path: `.github/workflows/${workflow}`, id: 900001, events: ['pull_request'],
      sourceDigest: 'a'.repeat(64), appId: 15368,
      jobs: [{ job: 'future', check, os: 'Linux', labels: ['ubuntu-latest'] }],
    } };
    const updated = project(contexts[changed][0], next, catalog);
    assert.equal(updated.policy.version, '1.1.0');
    assert.equal(updated.inventory.length, current.inventory.length + 1);
    assert.notEqual(updated.policyDigest, current.policyDigest);
    assert.notEqual(updated.matrixDigest, current.matrixDigest);
    contexts[unaffected].forEach((c, i) => assert.deepEqual(project(c, next, catalog), before[i]));
  });
  test(`editing ${changed} applicability cannot retarget ${unaffected}`, () => {
    const next = policies(), before = contexts[unaffected].map(c => project(c));
    // Fixture-only reviewed alternative; production applicability is unchanged.
    next[index].version = '2.0.0';
    next[index].profiles[0].target = { exact: 'reviewed-future-target' };
    assert.equal(selectAssurancePolicy(contexts[changed][0], next), null);
    contexts[unaffected].forEach((c, i) => assert.deepEqual(project(c, next), before[i]));
  });
  test(`a version-only ${changed} change alters its identity, leaving ${unaffected} intact`, () => {
    const next = policies(), original = project(contexts[changed][0]);
    next[index].version = '1.0.1';
    const updated = project(contexts[changed][0], next);
    assert.equal(updated.policy.version, '1.0.1');
    assert.notEqual(updated.policyDigest, original.policyDigest);
    assert.equal(updated.matrixDigest, original.matrixDigest);
    assert.deepEqual(updated.inventory, original.inventory);
    contexts[unaffected].forEach(c => assert.deepEqual(project(c, next), project(c)));
  });
}

const ciChecks = [
  ['Hosting (Linux)', 'Linux'], ['Hosting (Windows)', 'Windows'], ['Hosting (macOS)', 'macOS'],
  ['Acceptance', 'Linux'], ['Acceptance (Windows)', 'Windows'], ['Acceptance (macOS)', 'macOS'],
  ['Workspaces', 'Linux'], ['Engineering', 'Linux'],
  ['Guard', 'Linux'], ['Guard (Windows)', 'Windows'], ['Guard (macOS)', 'macOS'],
];
const invariantPR = [['Change Isolation', 'Linux'], ['Branching', 'Linux'], ['Promotion Source', 'Linux']];
const security = [['CodeQL (actions)', 'Linux'], ['CodeQL (javascript-typescript)', 'Linux']];
const canonical = entries => entries.map(([check, os]) => `${check}@${os}`).sort();
for (const [context, required] of [
  [contexts.main[0], [...ciChecks, ...invariantPR, ...security, ['Dependency Review', 'Linux']]],
  [contexts.main[1], [...ciChecks, ...security, ['Branching audit', 'Linux']]],
  [contexts.lineage[0], [...ciChecks, ...invariantPR, ...security, ['Dependency Review', 'Linux']]],
  [contexts.lineage[1], [...ciChecks, ...invariantPR, ...security, ['Dependency Review', 'Linux'], ['Guard Acceptance Boundary', 'Linux']]],
]) test(`${context.event} ${context.baseRef} preserves every reviewed check/OS and independent control`, () => {
  const result = project(context);
  assert.deepEqual(result.inventory.map(j => `${j.check}@${j.os}`).sort(), canonical(required));
  assert.deepEqual(result.independentControls, { codeScanning: {
    tool: 'CodeQL', securityAlertsThreshold: 'high_or_higher', alertsThreshold: 'errors',
  }, ownerReview: 'independent' });
});

for (const [name, change] of [
  ['missing explicit inventory', p => { p[0].profiles[0].required = []; }],
  ['unknown check', p => { p[0].profiles[0].required[0].checks[0].check = 'not declared'; }],
  ['wrong OS', p => { p[0].profiles[0].required[0].checks[0].os = 'Unknown'; }],
  ['wrong producer event', p => { p[0].profiles[0].required[0].event = 'workflow_dispatch'; }],
  ['duplicate check', p => { p[0].profiles[0].required[0].checks.push(p[0].profiles[0].required[0].checks[0]); }],
  ['duplicate workflow', p => { p[0].profiles[0].required.push(p[0].profiles[0].required[0]); }],
  ['ambiguous profile', p => { p[0].profiles.push({ ...p[0].profiles[0], id: 'overlap' }); }],
  ['duplicate policy identity', p => { p[1].id = p[0].id; }],
  ['missing independent scanning', p => { delete p[0].independentControls.codeScanning; }],
]) test(`${name} cannot be reconciled as a full policy`, () => {
  const next = policies(); change(next);
  assert.throws(() => project(contexts.main[0], next));
});

for (const field of ['policyId', 'policyVersion', 'profileId']) test(`candidate cannot relabel manifest ${field}`, () => {
  const f = fixture(); f.manifest[field] = 'candidate';
  const r = judgeFullMatrix(f.authority, f.manifest, f.evidence, f.context, f.now);
  assert.equal(r.verdict, 'failed');
  assert.equal(r.stage, 'selection');
});
