// Interim PLAN-time stand-in for the baseline behaviour: no judgment exists, so every plan is accepted.
// Temporary migration work under C1. The runner swaps in the real judgment when it exists.
export async function judge() {
  return { verdict: 'PASS', findings: [] };
}
