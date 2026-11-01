// C762: pure selection-completeness contract, not a provenance authority.
// A trusted target-owned C11/Graph adapter must supply expected; see README.md.
import { judgeExecution } from './execution-gate.mjs';
import { assuranceForTarget } from './target-policy.mjs';
const valid = (x) => typeof x === 'string' && x.trim().length > 0 && x === x.trim();
// Execution evidence uses check@OS identities. Reject ambiguous delimiters.
const key = (x) => x && valid(x.check) && valid(x.os) &&
  !x.check.includes('@') && !x.os.includes('@') ? x.check + '@' + x.os : null;
const result = (errors) => ({ verdict: errors.length ? 'failed' : 'passed',
  errors: [...new Set(errors)].sort() });

export function judgeSelection(expected, manifest) {
  const fields = ['headSha', 'baseSha', 'policyDigest', 'impactDigest', 'event', 'baseRef'];
  if (!expected || expected.authoritative !== true || expected.resolved !== true ||
      !fields.every((f) => valid(expected[f])) ||
      !['inventory', 'required', 'nonImpact'].every((f) => Array.isArray(expected[f])) ||
      !manifest || manifest.resolved !== true ||
      !fields.every((f) => valid(manifest[f])) ||
      !Array.isArray(manifest.selected) || !Array.isArray(manifest.excluded)) {
    return { verdict: 'unresolved', errors: ['authoritative selection evidence unavailable'] };
  }
  const errors = [];
  for (const field of fields)
    if (expected[field] !== manifest[field]) errors.push('provenance mismatch: ' + field);
  const sets = {};
  for (const [label, entries] of [
    ['inventory', expected.inventory], ['required', expected.required],
    ['nonImpact', expected.nonImpact], ['selected', manifest.selected],
    ['excluded', manifest.excluded],
  ]) {
    // Array.from visits sparse slots too: a hole is missing evidence.
    const keys = Array.from(entries, key);
    if (keys.includes(null)) errors.push('invalid check/OS: ' + label);
    if (new Set(keys).size !== keys.length) errors.push('duplicate ' + label);
    sets[label] = new Set(keys);
  }
  const { inventory, required, nonImpact, selected, excluded } = sets;
  if (!inventory.size || !required.size) errors.push('empty policy or required matrix');
  for (const k of required) {
    if (!inventory.has(k)) errors.push('required check outside policy: ' + k);
    if (!selected.has(k)) errors.push('missing impacted check: ' + k);
    if (nonImpact.has(k)) errors.push('impacted check declared unaffected: ' + k);
  }
  const reasons = new Map();
  for (const entry of expected.nonImpact) {
    const k = key(entry);
    if (!inventory.has(k) || !valid(entry?.reason))
      errors.push('invalid non-impact evidence: ' + k);
    reasons.set(k, entry?.reason);
  }
  for (const k of inventory)
    if (!required.has(k) && !nonImpact.has(k)) errors.push('unresolved policy check: ' + k);
  for (const k of selected)
    if (!required.has(k)) errors.push('unauthorized selected check: ' + k);
  for (const entry of manifest.excluded) {
    const k = key(entry);
    if (!nonImpact.has(k) || selected.has(k) || required.has(k) ||
        !valid(entry?.reason) || entry.reason !== reasons.get(k))
      errors.push('invalid exclusion: ' + k);
  }
  for (const k of nonImpact)
    if (!excluded.has(k)) errors.push('missing explicit exclusion: ' + k);
  return result(errors);
}

export function judgeAggregate(expected, manifest, observations, context) {
  // Context comes independently from the runner event, never from the candidate manifest.
  const assurance = assuranceForTarget(context);
  if (assurance !== 'impact-aware') return {
    verdict: 'unresolved', stage: 'target', errors: [
      assurance === 'full-assurance'
        ? 'full assurance requires independent complete-matrix validation'
        : 'unknown target or event',
    ],
  };
  if (expected?.event !== context.event || expected?.baseRef !== context.baseRef)
    return { verdict: 'failed', stage: 'target', errors: ['target context mismatch'] };
  const selection = judgeSelection(expected, manifest);
  if (selection.verdict !== 'passed')
    return { ...selection, stage: 'selection' };
  return { ...judgeExecution(manifest, observations), stage: 'execution' };
}

