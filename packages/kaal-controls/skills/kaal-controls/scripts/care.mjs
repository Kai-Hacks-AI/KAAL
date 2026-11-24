// Judges the decisions taken on a set of findings: every finding gets a disposition,
// only a valid finding takes exactly one response (contain, accept, ratchet, eliminate).
const str = (x) => typeof x === 'string' && x.trim() !== '';
const RESPONSE = { contain: ['owner', 'limits'], accept: ['owner'], ratchet: ['owner', 'corrects'], eliminate: ['corrects'] };
const DISPOSITION = { valid: [], invalid: ['evidence'], unknown: ['investigate'] };

export function judgeDecision({ findings, dispositions, decisions } = {}) {
  if (![findings, dispositions, decisions].every(Array.isArray) || !findings.every((f) => typeof f === 'string')) return { verdict: 'UNKNOWN' };
  const reasons = [];
  const add = (kind, finding, field) => reasons.push(field ? { kind, finding, field } : { kind, finding });
  const listed = new Set(findings);
  const disposed = new Map();
  for (const d of dispositions) {
    if (!listed.has(d.finding)) { add('unknown-finding', d.finding); continue; }
    if (disposed.has(d.finding)) { add('duplicate-disposition', d.finding); continue; }
    disposed.set(d.finding, d);
    if (!Object.hasOwn(DISPOSITION, d.disposition)) { add('bad-disposition', d.finding); continue; }
    for (const f of ['reviewedBy', ...DISPOSITION[d.disposition]]) if (!str(d[f])) add('missing-field', d.finding, f);
  }
  for (const f of findings) if (!disposed.has(f)) add('undisposed', f);
  const decided = new Map();
  for (const d of decisions) {
    if (!listed.has(d.finding)) { add('unknown-finding', d.finding); continue; }
    if (decided.has(d.finding)) { add('duplicate-decision', d.finding); continue; }
    decided.set(d.finding, d);
    const disp = disposed.get(d.finding);
    if (disp && Object.hasOwn(DISPOSITION, disp.disposition) && disp.disposition !== 'valid') { add('decision-not-valid', d.finding); continue; }
    if (!Object.hasOwn(RESPONSE, d.response)) { add('bad-response', d.finding); continue; }
    for (const f of ['proposedBy', 'selectedBy', 'reason', ...RESPONSE[d.response]]) if (!str(d[f])) add('missing-field', d.finding, f);
  }
  for (const [f, d] of disposed) if (d.disposition === 'valid' && !decided.has(f)) add('uncovered', f);
  const unresolved = [...disposed].filter(([, d]) => d.disposition === 'unknown').map(([f]) => f).sort();
  return { verdict: reasons.length ? 'FAIL' : 'PASS', reasons, unresolved };
}
