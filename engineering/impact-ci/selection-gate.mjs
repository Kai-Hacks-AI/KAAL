// C762: independent selection completeness boundary.
// Expected checks must come from target-owned C11 closure and governed check/OS policy.
// This function deliberately does not infer impact from paths or candidate claims.
const key = (x) => x && typeof x.check === 'string' && x.check.length &&
  typeof x.os === 'string' && x.os.length ? x.check + '@' + x.os : null;
export function judgeSelection(expected, manifest) {
  const errors = [];
  if (!expected || expected.authoritative !== true || expected.resolved !== true ||
      !expected.headSha || !expected.baseSha || !expected.policyDigest ||
      !expected.impactDigest || !Array.isArray(expected.required) ||
      !manifest || !Array.isArray(manifest.selected) || !Array.isArray(manifest.excluded)) {
    return { verdict: 'unresolved', errors: ['authoritative selection evidence unavailable'] };
  }
  for (const field of ['headSha', 'baseSha', 'policyDigest', 'impactDigest'])
    if (expected[field] !== manifest[field]) errors.push('provenance mismatch: ' + field);
  const required = expected.required.map(key);
  const selected = manifest.selected.map(key);
  const excluded = manifest.excluded.map(key);
  if ([...required, ...selected, ...excluded].includes(null)) errors.push('invalid check/OS');
  for (const [label, xs] of [['required', required], ['selected', selected], ['excluded', excluded]])
    if (new Set(xs).size !== xs.length) errors.push('duplicate ' + label);
  for (const k of required) if (!selected.includes(k)) errors.push('missing impacted check: ' + k);
  for (const k of selected) if (!required.includes(k)) errors.push('unauthorized selected check: ' + k);
  for (const k of excluded) if (required.includes(k) || selected.includes(k))
    errors.push('invalid exclusion: ' + k);
  return { verdict: errors.length ? 'failed' : 'passed', errors };
}
export function judgeAggregate(expected, manifest, observations, judgeExecution) {
  const selection = judgeSelection(expected, manifest);
  if (selection.verdict !== 'passed') return { verdict: selection.verdict, stage: 'selection', errors: selection.errors };
  const execution = judgeExecution(manifest, observations);
  return { ...execution, stage: 'execution' };
}
