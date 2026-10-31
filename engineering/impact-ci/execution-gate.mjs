// C759: pure, fail-closed CI execution gate. This module does NOT select impact.
// The selection manifest must be produced by a separately governed C11 adapter.
// No workflow uses this module yet.
const valid = (x) => typeof x === 'string' && x.length > 0;
const unique = (xs) => new Set(xs).size === xs.length;
export function judgeExecution(manifest, observations) {
  const errors = [];
  if (!manifest || !valid(manifest.headSha) || !valid(manifest.baseSha) ||
      !valid(manifest.policyDigest) || !valid(manifest.impactDigest) ||
      manifest.resolved !== true || !Array.isArray(manifest.selected) ||
      !Array.isArray(manifest.excluded) || !Array.isArray(observations)) {
    return { verdict: 'unresolved', errors: ['missing or unresolved governed inputs'] };
  }
  const key = (x) => x && valid(x.check) && valid(x.os) ? x.check + '@' + x.os : null;
  const selected = manifest.selected.map(key);
  const excluded = manifest.excluded.map(key);
  if (selected.includes(null) || excluded.includes(null) || !unique(selected) ||
      !unique(excluded) || selected.some((x) => excluded.includes(x)) ||
      selected.length === 0) errors.push('invalid or contradictory selection');
  if (manifest.mode !== 'capability-pr' && manifest.mode !== 'full-assurance')
    errors.push('unknown execution mode');
  if (manifest.mode === 'full-assurance' && manifest.fullMatrixVerified !== true)
    errors.push('full matrix not verified');
  const seen = new Set();
  for (const observation of observations) {
    const k = key(observation);
    if (!k || seen.has(k)) { errors.push('invalid or duplicate observation'); continue; }
    seen.add(k);
    if (!selected.includes(k)) { errors.push('unselected job reported: ' + k); continue; }
    if (observation.headSha !== manifest.headSha) errors.push('stale job: ' + k);
    if (observation.conclusion !== 'success') errors.push('job not passed: ' + k);
  }
  for (const k of selected) if (!seen.has(k)) errors.push('missing job: ' + k);
  return { verdict: errors.length ? 'failed' : 'passed', errors };
}
