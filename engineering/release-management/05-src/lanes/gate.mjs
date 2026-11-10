// The fail-closed gate of the testing controls (F12, F16, F18; PLAN testing-controls-plan.md, "Shape of the controls").
// It reads each expected lane and host from the control's own list and judges one of: passed, failed, or no outcome.
// A lane or host that is missing, skipped, cancelled, conditional or on an unavailable host is "no outcome" and fails.
//
// The only door is an Accept that is authorized. `accepts` is what the candidate carries and is never authority. `authorized`
// is the output of the verifier (an accepted PLAN, its landing commit and the designated authority, PLAN far-authorization-plan.md)
// for ONE boundary; the gate consumes it and does not verify it. Anything unknown, unverifiable (not an array) or for another
// boundary, lane or host fails closed. A lane that ran and failed is never excused by a lane-level Accept.
//
// INTERIM (interim-states.md): FAR's authorization is Change's (PLAN #1342). This gate reads the verified input only.

const NO_OUTCOME = new Set(["skipped", "cancelled", "conditional", "unavailable"]);

/**
 * @param {{ expected: {lane: string, host: string}[], results: {lane: string, host: string, outcome: string}[],
 *   accepts?: {lane: string, host: string}[], authorized?: {boundary: string, lane: string, host: string}[], boundary: string }} input
 * @returns {{ passed: boolean, reasons: string[] }}
 */
export function judgeLanes({ expected, results, accepts = [], authorized, boundary }) {
  const reasons = [];
  const verifiable = Array.isArray(authorized);
  for (const { lane, host } of expected) {
    const result = results.find((r) => r.lane === lane && r.host === host);
    if (result?.outcome === "passed") continue;
    if (result?.outcome === "failed") {
      reasons.push(`${lane} on ${host}: failed`);
      continue;
    }
    const state = result && NO_OUTCOME.has(result.outcome) ? result.outcome : result ? `unknown outcome ${result.outcome}` : "missing";
    const accepted = accepts.some((a) => a.lane === lane && a.host === host);
    const authority = verifiable && authorized.some((a) => a.boundary === boundary && a.lane === lane && a.host === host);
    if (accepted && authority) continue;
    reasons.push(`${lane} on ${host}: ${state}${accepted ? ", the Accept has no verified authorization for this boundary" : ""}${!verifiable ? " (authorization unverifiable)" : ""}`);
  }
  return { passed: reasons.length === 0, reasons };
}
