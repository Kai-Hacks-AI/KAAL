// C759: pure, fail-closed CI execution gate. This module does NOT select impact.
// The selection manifest must be produced by a separately governed C11 adapter.
// No workflow uses this module yet.
import { FULL_SCHEMA, fullExpected } from './full-policy.mjs';
import { judgeSelection } from './selection-contract.mjs';
const valid = (x) => typeof x === 'string' && x.length > 0;
const unique = (xs) => new Set(xs).size === xs.length;
export function judgeExecution(manifest, observations, authority) {
  const errors = [];
  const full = manifest?.mode === 'full-assurance';
  if (full) {
    let expected;
    try { expected = fullExpected(authority); } catch {
      return { verdict: 'failed', errors: ['full assurance requires independent matrix validation'] };
    }
    const selection = judgeSelection(expected, manifest);
    if (selection.verdict !== 'passed') return selection;
  }
  if (!manifest || !valid(manifest.headSha) || !valid(manifest.baseSha) ||
      !valid(manifest.policyDigest) || !(full ? manifest.schema === FULL_SCHEMA && valid(manifest.matrixDigest) : valid(manifest.impactDigest)) ||
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
  // A caller-controlled fullMatrixVerified flag grants no authority. Full mode
  // above requires the independently established opaque handle and complete set.
  const seen = new Set();
  for (const observation of observations) {
    const k = key(observation);
    if (!k || seen.has(k)) { errors.push('invalid or duplicate observation'); continue; }
    seen.add(k);
    if (!selected.includes(k)) { errors.push('unselected job reported: ' + k); continue; }
    if (observation.headSha !== manifest.headSha) errors.push('stale job: ' + k);
    if (observation.conclusion !== 'success') errors.push('job not passed: ' + k);
    if (full && observation.status !== 'completed') errors.push('job not completed: ' + k);
  }
  for (const k of selected) if (!seen.has(k)) errors.push('missing job: ' + k);
  return { verdict: errors.length ? 'failed' : 'passed', errors };
}
