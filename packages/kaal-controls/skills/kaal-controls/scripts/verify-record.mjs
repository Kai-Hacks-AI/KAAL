// verify Record: names each declared claim that lags or overclaims its own fact. Pure: it reads no file and calls no service.
// The four facts are independent and each is compared alone. A fact that is not a boolean, or a stale or missing entry, is unknown:
// never a finding and never clean. The confirmed discrepancies are kept beside it.
const FACTS = ['defined', 'implemented', 'running', 'tested'];
const text = (v) => typeof v === 'string' && v.length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export class UnknownEvidence extends Error {
  constructor(message, { confirmed, unknown }) { super(message); this.name = 'UnknownEvidence'; this.confirmed = confirmed; this.unknown = unknown; }
}

export function assessRecord({ controls, facts, revision } = {}) {
  if (!Array.isArray(controls)) throw new Error('assessRecord: controls must be a list');
  if (!isObject(facts) || Object.keys(facts).length === 0) throw new Error('assessRecord: facts must be a non-empty object keyed by control id');
  if (!text(revision)) throw new Error('assessRecord: revision must be a non-empty string');
  const findings = [];
  const unknown = [];
  for (const c of controls) {
    if (!c || !text(c.id) || !isObject(c.claimed)) throw new Error('assessRecord: each control needs an id and claimed');
    for (const k of FACTS) if (typeof c.claimed[k] !== 'boolean') throw new Error(`assessRecord: claim ${k} of ${c.id} is not a boolean`);
    const entry = facts[c.id];
    const current = isObject(entry) && entry.revision === revision;
    for (const k of FACTS) {
      const f = current ? entry[k] : undefined;
      if (typeof f !== 'boolean') { unknown.push(`${k}:${c.id}`); continue; }
      if (c.claimed[k] && !f) findings.push(`${k}:overclaims:${c.id}`);
      if (!c.claimed[k] && f) findings.push(`${k}:lags:${c.id}`);
    }
  }
  return { findings: findings.sort(), unknown: unknown.sort() };
}

export function findDisagreeing(input) {
  const { findings, unknown } = assessRecord(input);
  if (unknown.length > 0) throw new UnknownEvidence(`findDisagreeing: unknown: ${unknown.join(', ')}`, { confirmed: findings, unknown });
  return findings;
}
