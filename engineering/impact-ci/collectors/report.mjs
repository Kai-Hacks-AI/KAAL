import { fullExpected } from '../full-policy.mjs';
import { judgeFullMatrix } from '../full-gate.mjs';
import { digest } from '../policy-identity.mjs';
import { collectorCatalog, releaseReports } from './catalog.mjs';
import { projectCollectors } from './projection.mjs';

// Source-only report. No publisher, alternate completeness judge or credentials.
export function reportFullAssurance(authority, manifest, evidence, current, now) {
  const evaluation = judgeFullMatrix(authority, manifest, evidence, current, now);
  const base = {schema: 'kaal.full-collector-report/v1', sourceOnly: true,
    publication: 'not-published', liveAssurance: 'unestablished', evaluation};
  let expected, profile, projection;
  try {
    expected = fullExpected(authority);
    const matches = releaseReports.filter(p => p.policyId === expected.policy.id &&
      p.policyVersion === expected.policy.version && p.profiles.includes(expected.policy.profile));
    if (matches.length !== 1) throw new TypeError('unresolved release report profile');
    profile = matches[0];
    projection = projectCollectors(expected.workflows, collectorCatalog, profile.roots);
  } catch (error) {
    return {...base, verdict: 'unresolved', stage: 'projection',
      errors: [...(evaluation.errors ?? []), error.message], profile: null, groups: [], leaves: [],
      coverage: {separatelyEstablished: false}};
  }
  const certified = evaluation.verdict === 'passed';
  const leaves = projection.leaves.map(leaf => ({...leaf,
    evaluationObservation: (evaluation.ledger ?? []).filter(j =>
      j.workflow === leaf.workflow && j.check === leaf.check && j.os === leaf.os).map(j => ({...j}))}));
  return {...base, verdict: evaluation.verdict, stage: evaluation.stage, errors: [...evaluation.errors],
    profile: {...structuredClone(profile), event: expected.event, target: expected.baseRef},
    policy: {...expected.policy}, policyDigest: expected.policyDigest, matrixDigest: expected.matrixDigest,
    contextDigest: expected.contextDigest, reportPolicyDigest: digest({profile, catalog: collectorCatalog}),
    subject: structuredClone(expected.context), independentControls: structuredClone(expected.independentControls),
    ...(evaluation.successNotBefore === undefined ? {} : {successNotBefore: evaluation.successNotBefore}),
    roots: projection.roots, leaves,
    groups: projection.groups.map(group => ({...group, assurance: !group.applicable ? 'not-applicable' :
      certified ? 'certified-by-full-matrix' : 'not-certified'})),
    coverage: {separatelyEstablished: false,
      byDimension: Object.fromEntries(['product', 'engine', 'mixed', 'cross-cutting'].map(dimension =>
        [dimension, leaves.filter(leaf => leaf.dimension === dimension).map(leaf => leaf.id)])),
      qualification: 'Mixed suites retain their obligations; Product and Engine are not independently certified.'}};
}
