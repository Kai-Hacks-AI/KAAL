// release/A25 result interpreter: reads what the Dependency Review mechanism returned and classifies it as one
// of the three outcomes of the common control contract (release/F7). It is deterministic: it establishes no truth
// of its own and applies no contextual judgment. FAIL and UNKNOWN need a subsequent judgment elsewhere. The mechanism does the comparison and the
// advisory lookup; this function only reads its result. `passes` is true only for PASS, the only clean go. passes:false means no automatic clearance, not a final rejection.
//
// Input: { conclusion, outputs: { vulnerableChanges } }
//   conclusion        'success' or 'failure', the conclusion of the mechanism's step
//   vulnerableChanges the mechanism's `vulnerable-changes` output, a JSON list, set only when the
//                     comparison itself succeeded
// Output: { control, outcome, passes, findings, reason }
const CONTROL = 'analyze Dependencies';

const record = (outcome, findings, reason) => ({ control: CONTROL, outcome, passes: outcome === 'PASS', findings, reason });
const unknown = (reason) => record('UNKNOWN', [], reason);

export function interpret(result) {
  if (!result || typeof result !== 'object') return unknown('the mechanism returned no result');
  const raw = result.outputs?.vulnerableChanges;
  if (raw === undefined || raw === null || raw === '') {
    return unknown(result.conclusion === 'success'
      ? 'the mechanism succeeded but gave no list of vulnerable changes'
      : 'the mechanism failed without a result, so nothing was compared');
  }
  let changes;
  try { changes = JSON.parse(raw); } catch { return unknown('the list of vulnerable changes cannot be read'); }
  if (!Array.isArray(changes)) return unknown('the list of vulnerable changes is not a list');
  if (changes.length === 0) {
    return result.conclusion === 'success'
      ? record('PASS', [], 'no added or changed dependency has a known advisory')
      : unknown('the list is empty but the mechanism failed, so the comparison is not trusted');
  }
  const findings = changes.flatMap((change) => (change.vulnerabilities ?? []).map((v) => ({
    package: change.name,
    version: change.version,
    advisory: v.advisory_ghsa_id,
    severity: v.severity,
  })));
  if (findings.length === 0) return unknown('a change is listed as vulnerable but names no advisory');
  return record('FAIL', findings, 'an added or changed dependency has a known advisory');
}
