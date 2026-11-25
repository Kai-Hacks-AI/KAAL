// Are Cases really green? Pure over the Cases that apply and the observations of Testing: observed: { 'release/T123': 'GREEN' | 'RED' | 'UNKNOWN' }. An exit code is never a verdict.
// The answer is { verdict, progress, findings, message }; whether it matters for an ACT is the judge's.

export function casesAreGreen({ applicable, observed }) {
  if (!applicable?.length) return { verdict: 'UNKNOWN', applies: true, progress: { red: 0, green: 0, unknown: 0 }, findings: [{ id: '-', reason: 'no Case applies, so nothing can be really green' }], message: 'cannot judge: no Case applies' };
  const findings = [];
  for (const c of applicable) {
    if (c.parked) findings.push({ id: c.id, reason: 'still planned red (a .red.mjs file)', fail: true });
    else if (observed?.[c.id] === 'RED') findings.push({ id: c.id, reason: 'observed RED', fail: true });
    else if (observed?.[c.id] !== 'GREEN') findings.push({ id: c.id, reason: 'not observed green', fail: false });
  }
  const failed = findings.filter((f) => f.fail);
  const progress = { red: failed.length, green: applicable.length - findings.length, unknown: findings.length - failed.length };
  if (failed.length) return { verdict: 'FAIL', applies: true, progress, findings, message: `finish your work first: ${failed.map((f) => f.id).join(', ')} of ${applicable.length} applicable Cases are not really green` };
  if (findings.length) return { verdict: 'UNKNOWN', applies: true, progress, findings, message: `cannot judge: ${findings.map((f) => f.id).join(', ')} not observed green` };
  return { verdict: 'PASS', applies: true, progress, findings: [] };
}

// Is the work of all the carried Changes finished: every Case that applies to any of them really green? The Cases of the Changes are judged together.
export function applicableCasesAreGreen({ changes, observed }) {
  const all = new Map();
  for (const c of changes) for (const k of c.applicable) all.set(k.id, { ...k, parked: Boolean(k.parked || all.get(k.id)?.parked) });
  const applicable = [...all.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  return casesAreGreen({ applicable, observed });
}

// The observation of Testing as the judge may trust it (release/C125). `file` is what `observe` of Testing wrote: { observed, evidence }, read as data, never by importing Testing.
// It reads `observed`, `evidence.revision`, `evidence.expectedRevision` and `evidence.catalog` ({ complete, findings, unobservable }) and nothing else.
// The answer is { reason } when the evidence cannot be used at all (missing, not the contracted shape, of another revision): nothing may be read from it, a RED included.
// Otherwise { observed, incomplete } where `incomplete` is a sentence when the catalog is not exactly complete: a RED Case still stands, but no PASS may rest on it.
export function observationOf(file) {
  if (file === undefined) return { reason: "Testing's observation of the Cases at this revision is not available" };
  const e = file?.evidence;
  if (!file || typeof file.observed !== 'object' || file.observed === null || Array.isArray(file.observed) || !e || typeof e !== 'object' || !e.catalog || typeof e.catalog !== 'object') return { reason: "Testing's observation is not the shape the contract names (observed, and evidence with a catalog)" };
  if (typeof e.revision !== 'string' || e.revision === '' || typeof e.expectedRevision !== 'string' || e.expectedRevision === '' || e.revision !== e.expectedRevision) return { reason: "Testing's observation is not for this revision (revision and expectedRevision are absent or differ)" };
  const c = e.catalog;
  if (c.complete === true) return { observed: file.observed };
  const named = [...(Array.isArray(c.findings) ? c.findings.map((f) => `${f?.kind ?? 'finding'}${f?.id ? ` ${f.id}` : ''}`) : []), ...(Array.isArray(c.unobservable) ? c.unobservable.map((f) => `unobservable ${f}`) : [])];
  return { observed: file.observed, incomplete: `the catalog of Cases is not complete${named.length ? ` (${named.join(', ')})` : ''}` };
}
