// The ratchet library: the comparison of a run against an accepted baseline. Pure: it reads no file, runs no command
// and knows no repository, Git ref or tool. The caller reads the baseline and the reference (the accepted baseline of the
// base, as Git data, never a file of the change under review) and passes the values in.
const names = (x) => Array.isArray(x) && x.every((f) => typeof f === 'string' && f) && new Set(x).size === x.length;
// The verdict of one run of a ratchet. `next` is the baseline to store, and only an accepted run carries it.
export function judgeRun({ findings, baseline, previous } = {}) {
  const mode = 'ratchet';
  if (!Array.isArray(findings)) return { mode, verdict: 'UNKNOWN', blocked: true, reason: 'could-not-judge' };
  const a = applyBaseline({ findings, baseline, previous });
  if (a.unknown) return { mode, verdict: 'UNKNOWN', blocked: true, reason: a.unknown };
  const { remaining, known, stale, grew, next } = a;
  const reasons = [grew.length && 'baseline-grew', stale.length && 'stale-allowance', remaining.length && 'new-finding'].filter(Boolean);
  const spent = baseline.length === 0;
  const out = { mode, findings, known, new: remaining, stale, grew, reasons, spent, ...(spent ? { then: 'preventive' } : {}) };
  // `next` is the baseline to store, and only an accepted run carries it: a rejected run advances nothing.
  return reasons.length ? { ...out, verdict: 'FAIL', blocked: true } : { ...out, next, verdict: 'PASS', blocked: false };
}

// The ratchet is a filter in front of the verdict. The check only emits findings. This subtracts the allowance and
// keeps the allowance honest; what remains is judged like any preventive check. With an empty baseline it removes
// nothing, so dropping the ratchet means deleting this step and the baseline, and the check is not touched.
export function applyBaseline({ findings, baseline, previous } = {}) {
  if (previous === undefined || previous === null) return { unknown: 'no-reference' };
  if (!names(previous) || !names(baseline) || !names(findings)) return { unknown: 'incompatible-reference' };
  return {
    remaining: findings.filter((f) => !baseline.includes(f)),
    known: findings.filter((f) => baseline.includes(f)),
    grew: baseline.filter((f) => !previous.includes(f)),
    stale: baseline.filter((f) => !findings.includes(f)),
    next: previous.filter((f) => findings.includes(f)),
  };
}
