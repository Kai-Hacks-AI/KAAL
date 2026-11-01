// Pure policy projection. This accepts definitions for review/testing, not for
// establishing authority. full-policy uses only its target-owned policy imports.
import { digest } from './policy-identity.mjs';
const text = s => typeof s === 'string' && s.length > 0 && s === s.trim();
const key = j => `${j.check}@${j.os}`;
const unique = xs => new Set(xs).size === xs.length;

function matches(target, ref) {
  if (target && text(target.exact) && Object.keys(target).length === 1) return ref === target.exact;
  if (target && text(target.singleSegmentPrefix) && Array.isArray(target.exclude) &&
      target.exclude.every(text) && unique(target.exclude) && Object.keys(target).length === 2) {
    if (typeof ref !== 'string' || !ref.startsWith(target.singleSegmentPrefix)) return false;
    const suffix = ref.slice(target.singleSegmentPrefix.length);
    return suffix.length > 0 && !suffix.includes('/') && !target.exclude.includes(ref);
  }
  throw new TypeError('explicit exact or single-segment policy target required');
}

export function selectAssurancePolicy(context, policies) {
  if (!Array.isArray(policies) || !policies.length ||
      !unique(policies.map(p => p?.id)) || !unique(policies.map(p => p?.gate)))
    throw new TypeError('distinct assurance policy identities required');
  const selected = [];
  for (const policy of policies) {
    if (policy?.schema !== 'kaal.assurance-policy/v1' || !text(policy.id) ||
        !/^\d+\.\d+\.\d+$/.test(policy.version ?? '') || !text(policy.gate) ||
        policy.owner !== 'Engineering' || policy.repository !== 'Kai-Hacks-AI/KAAL' ||
        policy.independentControls?.codeScanning?.tool !== 'CodeQL' ||
        !text(policy.independentControls.codeScanning.securityAlertsThreshold) ||
        !text(policy.independentControls.codeScanning.alertsThreshold) ||
        policy.independentControls.ownerReview !== 'independent' ||
        !Array.isArray(policy.profiles) || !policy.profiles.length ||
        !unique(policy.profiles.map(p => p?.id))) throw new TypeError('invalid versioned assurance policy');
    for (const profile of policy.profiles) {
      if (!text(profile?.id) || !['push', 'pull_request'].includes(profile.event))
        throw new TypeError('explicit policy profile identity/event required');
      const applicable = matches(profile.target, context?.baseRef);
      if (profile.event === context?.event && applicable) selected.push({ policy, profile });
    }
  }
  if (selected.length > 1) throw new TypeError('ambiguous assurance policy applicability');
  return selected[0] ?? null;
}

/** Required inventories live in each policy, not in the shared catalog. A catalog
 * entry only resolves a named producer/check/OS. Unreferenced entries add no checks.
 */
export function resolveAssurancePolicy(context, policies, catalog) {
  const selection = selectAssurancePolicy(context, policies);
  if (!selection) throw new TypeError('unsupported full-matrix event/target');
  const { policy, profile } = selection;
  if (!Array.isArray(profile.required) || !profile.required.length ||
      !unique(profile.required.map(g => g?.workflow))) throw new TypeError('explicit required workflow inventory unavailable');
  const workflows = profile.required.map(group => {
    const definition = catalog[group?.workflow];
    if (!definition || !Array.isArray(definition.events) || !definition.events.includes(group.event) ||
        !Array.isArray(definition.jobs) ||
        !Array.isArray(group.checks) || !group.checks.length || !unique(group.checks.map(key)))
      throw new TypeError(`unreconciled policy producer: ${group?.workflow}`);
    const jobs = group.checks.map(required => {
      const job = definition.jobs.find(j => j.check === required?.check && j.os === required?.os);
      if (!job) throw new TypeError(`unreconciled policy check/OS: ${group.workflow} ${required?.check}`);
      return structuredClone(job);
    });
    return { ...structuredClone(definition), event: group.event, jobs };
  });
  const inventory = workflows.flatMap(w => w.jobs.map(({ check, os }) => ({ check, os })));
  if (!unique(inventory.map(key))) throw new TypeError('ambiguous check/OS inventory');
  return { gate: policy.gate, policy: { id: policy.id, version: policy.version, profile: profile.id },
    policyDigest: digest(policy), matrixDigest: digest(workflows), workflows, inventory,
    independentControls: structuredClone(policy.independentControls) };
}
