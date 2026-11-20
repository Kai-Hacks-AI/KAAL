// Are Cases really green? Pure over the Cases that apply and the observations of Testing: observed: { 'release/T123': 'GREEN' | 'RED' | 'UNKNOWN' }. An exit code is never a verdict.
// The answer is { verdict, progress, findings, message }; whether it matters for an ACT is the judge's.

export function casesAreGreen({ applicable, observed }) {
  if (!applicable?.length) return { verdict: 'UNKNOWN', progress: { red: 0, green: 0, unknown: 0 }, findings: [{ id: '-', reason: 'no Case applies, so nothing can be really green' }], message: 'cannot judge: no Case applies' };
  const findings = [];
  for (const c of applicable) {
    if (c.parked) findings.push({ id: c.id, reason: 'still planned red (a .red.mjs file)', fail: true });
    else if (observed?.[c.id] === 'RED') findings.push({ id: c.id, reason: 'observed RED', fail: true });
    else if (observed?.[c.id] !== 'GREEN') findings.push({ id: c.id, reason: 'not observed green', fail: false });
  }
  const failed = findings.filter((f) => f.fail);
  const progress = { red: failed.length, green: applicable.length - findings.length, unknown: findings.length - failed.length };
  if (failed.length) return { verdict: 'FAIL', progress, findings, message: `finish your work first: ${failed.map((f) => f.id).join(', ')} of ${applicable.length} applicable Cases are not really green` };
  if (findings.length) return { verdict: 'UNKNOWN', progress, findings, message: `cannot judge: ${findings.map((f) => f.id).join(', ')} not observed green` };
  return { verdict: 'PASS', progress, findings: [] };
}

// Is the work of all the carried Changes finished: every Case that applies to any of them really green? The Cases of the Changes are judged together.
export function applicableCasesAreGreen({ changes, observed }) {
  const all = new Map();
  for (const c of changes) for (const k of c.applicable) all.set(k.id, { ...k, parked: Boolean(k.parked || all.get(k.id)?.parked) });
  const applicable = [...all.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  return casesAreGreen({ applicable, observed });
}
