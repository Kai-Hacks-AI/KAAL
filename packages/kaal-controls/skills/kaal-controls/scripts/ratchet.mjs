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

// The history of a ratchet: a JSON list beside the baseline, one line for every change of the baseline, appended and never
// rewritten. A line is {at, change, from, to, removed}: when, which Change, the size before and after, the names that left.
const isList = (x) => Array.isArray(x);
const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sorted = (x) => [...x].sort();
const fail = (reason) => ({ verdict: 'FAIL', reason });

// The verdict of one pull request on the history. Pure: the caller passes the base's and the head's baseline and history
// (as Git data, the base's never from the change under review), the Change the pull request carries, and the time window
// the request ran in. A missing or malformed input is UNKNOWN, never a pass.
export function judgeProgress({ base, head, change, window } = {}) {
  const unknown = () => ({ verdict: 'UNKNOWN', reason: 'could-not-judge' });
  if (!base || !head || !change || !window) return unknown();
  if (!names(base.baseline) || !names(head.baseline) || !isList(base.history) || !isList(head.history)) return unknown();
  if (typeof change.id !== 'string' || !change.id || typeof change.exists !== 'boolean') return unknown();
  const from = Date.parse(window.from), to = Date.parse(window.to);
  if (Number.isNaN(from) || Number.isNaN(to)) return unknown();
  // A baseline never grows, whatever the history says.
  if (head.baseline.some((f) => !base.baseline.includes(f))) return fail('baseline-grew');
  // The history of the base is a prefix of the head's: lines are appended, never changed.
  if (head.history.length < base.history.length || !base.history.every((line, i) => sameJson(line, head.history[i]))) return fail('history-rewritten');
  const added = head.history.slice(base.history.length);
  const removed = sorted(base.baseline.filter((f) => !head.baseline.includes(f)));
  if (removed.length === 0) return added.length ? fail('history-without-change') : { verdict: 'PASS' };
  if (added.length === 0) return fail('history-missing');
  if (added.length > 1) return fail('line-mismatch');
  const [line] = added;
  if (!line || line.from !== base.baseline.length || line.to !== head.baseline.length || !isList(line.removed) || !sameJson(sorted(line.removed), removed)) return fail('line-mismatch');
  if (line.change !== change.id) return fail('change-mismatch');
  if (change.exists !== true) return fail('change-unknown');
  const at = Date.parse(line.at);
  const last = base.history.length ? Date.parse(base.history[base.history.length - 1].at) : -Infinity;
  if (Number.isNaN(last)) return unknown();
  if (Number.isNaN(at) || at < last) return fail('time-before-previous');
  if (at < from || at > to) return fail('time-out-of-window');
  return { verdict: 'PASS' };
}

// The verdict on ending a ratchet: the baseline is empty, and the history of the completed ratchet is kept, ending in 0.
export function judgeRetirement({ base, head } = {}) {
  if (!base || !head || !isList(base.baseline) || !isList(base.history)) return { verdict: 'UNKNOWN', reason: 'could-not-judge' };
  if (base.baseline.length !== 0) return fail('retired-early');
  if (!isList(head.history) || !sameJson(head.history, base.history)) return fail('history-removed');
  const last = base.history[base.history.length - 1];
  if (!last || last.to !== 0) return fail('history-incomplete');
  return { verdict: 'PASS' };
}
