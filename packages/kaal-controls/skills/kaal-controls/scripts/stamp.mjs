// STAMP: the state of one control in one place, kept as three separate facts: the declared decision (the flag), the observed signal (did it run and give a verdict) and the blocking evidence (what blocked).
// Pure: it reads nothing and blocks nothing. An unknown flag is a configuration error, none of the states.
const DECLARED = ['STOPPED', 'ADVISORY', 'PREVENTING', 'UNKNOWN'];
const VERDICTS = ['PASS', 'REPORT', 'FAIL', 'UNKNOWN'];

export function flagState(value) {
  if (value === 'preventing' || value === 'on') return 'PREVENTING';
  if (value === 'advisory' || value === 'off') return 'ADVISORY';
  if (value === 'stopped') return 'STOPPED';
  return 'UNKNOWN';
}

// What the adopter hands the adapter as boundary.flag; null means the control is not run. An unknown value is refused: validate the file first.
export function toBoundary(name, value) {
  if (typeof name !== 'string' || name === '') throw new Error('toBoundary: the flag needs a name');
  const s = flagState(value);
  if (s === 'UNKNOWN') throw new Error(`toBoundary: ${name} has no recognized value`);
  return s === 'PREVENTING' ? { name, value: 'on' } : s === 'ADVISORY' ? { name, value: 'off' } : null;
}

const tri = (v) => v === true || v === false || v === null;
const whole = (r) => r !== null && typeof r === 'object' && typeof r.run === 'string' && (r.verdict === null || VERDICTS.includes(r.verdict)) && tri(r.applied) && tri(r.blocked);

export function judgeStamp({ declared, runs } = {}) {
  if (!DECLARED.includes(declared)) throw new Error('judgeStamp: declared is not a state');
  if (!Array.isArray(runs) || !runs.every(whole)) throw new Error('judgeStamp: runs must be a list of established runs');
  const last = runs.length ? runs[runs.length - 1] : null;
  const blocked = last ? last.blocked : null;
  const out = (o, reasons) => ({ declared: o.declared ?? null, observed: o.observed ?? null, stamp: o.stamp ?? null, blocking: o.blocking ?? null, blocked, reasons: [...new Set(reasons)].sort() });
  if (declared === 'UNKNOWN') return out({}, ['config-error', ...(blocked === true ? ['blocked-without-flag'] : [])]);
  if (declared === 'STOPPED') return out({ declared, observed: 'N/A', stamp: 'STOPPED', blocking: false }, [...(last ? ['ran-while-stopped'] : []), ...(blocked === true ? ['blocked-while-stopped'] : [])]);
  const reasons = [];
  let observed = 'OK';
  if (!last) { observed = 'MUTE'; reasons.push('no-trace'); }
  else if (last.verdict === null || last.verdict === 'UNKNOWN') { observed = 'TORN'; reasons.push('no-verdict'); }
  const stamp = observed === 'OK' ? declared : observed;
  let blocking = false;
  if (declared === 'PREVENTING') {
    blocking = observed === 'OK' ? last.verdict !== 'PASS' : true;
    if (last && last.verdict === 'REPORT') reasons.push('unexpected-verdict-while-preventing');
    if (!runs.some((r) => r.verdict !== null && r.verdict !== 'UNKNOWN' && r.applied === false)) reasons.push('unproven-preventing');
    if (blocked === false && blocking) reasons.push('not-blocked-while-preventing');
    if (blocked === true && !blocking) reasons.push('blocked-unexpectedly');
  } else if (blocked === true) reasons.push('blocked-while-advisory');
  return out({ declared, observed, stamp, blocking }, reasons);
}
