// Shared selection-completeness predicate from #764. No execution or provider I/O.
import { FULL_SCHEMA } from './full-policy.mjs';
const valid = (x) => typeof x === 'string' && x.trim().length > 0 && x === x.trim();
// Execution evidence uses check@OS identities. Reject ambiguous delimiters.
const key = (x) => x && valid(x.check) && valid(x.os) &&
  !x.check.includes('@') && !x.os.includes('@') ? x.check + '@' + x.os : null;
const result = (errors) => ({ verdict: errors.length ? 'failed' : 'passed',
  errors: [...new Set(errors)].sort() });

export function judgeSelection(expected, manifest) {
  const full = expected?.schema === FULL_SCHEMA;
  const fields = ['headSha', 'baseSha', 'policyDigest', 'event', 'baseRef',
    ...(full ? ['matrixDigest', 'contextDigest'] : ['impactDigest'])];
  if (!expected || expected.authoritative !== true || expected.resolved !== true ||
      !fields.every((f) => valid(expected[f])) ||
      !['inventory', 'required', 'nonImpact'].every((f) => Array.isArray(expected[f])) ||
      !manifest || manifest.resolved !== true ||
      !fields.every((f) => valid(manifest[f])) ||
      !Array.isArray(manifest.selected) || !Array.isArray(manifest.excluded)) {
    return { verdict: 'unresolved', errors: ['authoritative selection evidence unavailable'] };
  }
  const errors = [];
  if (full && (manifest.schema !== FULL_SCHEMA || manifest.mode !== 'full-assurance' ||
      expected.nonImpact.length || manifest.excluded.length)) errors.push('invalid full-assurance schema or exclusion');
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
