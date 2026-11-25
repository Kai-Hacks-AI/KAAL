// The thin adapter between a pure check and the world. Pure: it reads no file and calls no service.
// A concern joins it only when every control needs it: the mode, the ratchet filter, failing closed, one log line, one record.
import { judgeMode } from './judge-mode.mjs';
const MODES = ['detective', 'preventive', 'ratchet'];
const FACTS = ['defined', 'implemented', 'running', 'tested'];
const VERDICTS = ['PASS', 'FAIL'];
const text = (v) => typeof v === 'string' && v.length > 0;
const names = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string') && new Set(v).size === v.length;

export async function runControl({ id, mode, check, input, baseline, previous, boundary } = {}) {
  const b = boundary ?? {};
  let findings = null;
  let confirmed = null;
  if (text(id) && MODES.includes(mode) && typeof check === 'function') {
    // A check that cannot judge everything may keep what it confirmed on the error it throws; the answer stays UNKNOWN.
    try { findings = await check(input); } catch (e) { findings = null; if (names(e?.confirmed)) confirmed = e.confirmed; }
  }
  const judged = judgeMode({ mode, findings: names(findings) ? findings : null, baseline, previous });
  const verdict = text(id) ? judged.verdict : 'UNKNOWN';
  const blocked = !text(id) ? mode !== 'detective' : judged.blocked;
  const log = { control: id, mode, verdict, findings: names(findings) ? findings.length : null, run: b.run ?? null, sha: b.sha ?? null, ...(confirmed ? { confirmed: confirmed.length } : {}) };
  const record = text(b.x) && text(b.run) && text(b.sha) && text(id) ? { control: id, x: b.x, run: b.run, sha: b.sha, verdict, by: 'adapter' } : null;
  return { ...judged, id, mode, verdict, blocked, log, record, ...(confirmed ? { confirmed } : {}) };
}

// Compares each declared claim with its own fact. The four facts are independent: none implies another.
// A fact that is null or missing is unknown, never a finding and never proof of absence.
export function compareClaims({ id, claimed, facts } = {}) {
  if (!text(id)) throw new Error('compareClaims: id is missing');
  if (!claimed || typeof claimed !== 'object' || !facts || typeof facts !== 'object') throw new Error('compareClaims: claimed and facts are required');
  const findings = [];
  const unknown = [];
  for (const k of FACTS) {
    if (typeof claimed[k] !== 'boolean') throw new Error(`compareClaims: claim ${k} is not a boolean`);
    const f = facts[k];
    if (f === null || f === undefined) { unknown.push(k); continue; }
    if (typeof f !== 'boolean') throw new Error(`compareClaims: fact ${k} is not a boolean`);
    if (claimed[k] && !f) findings.push(`${k}:overclaims`);
    if (!claimed[k] && f) findings.push(`${k}:lags`);
  }
  return { id, findings: findings.sort(), unknown: unknown.sort() };
}

// The one fact the adapter can show: running. A committed record is a claim, not proof of its own authenticity,
// so a record counts only when it is valid and complete and the adopter has independently established the run.
export function executed({ id, records, revision, established } = {}) {
  if (!text(id) || !text(revision)) throw new Error('executed: id and revision must be non-empty strings');
  if (!Array.isArray(records) || !Array.isArray(established)) throw new Error('executed: records and established must be lists');
  const proven = (r) => established.some((e) => e && e.control === id && e.run === r.run && e.sha === revision);
  const valid = (r) => r && r.control === id && r.x === 'real' && text(r.run) && r.sha === revision && VERDICTS.includes(r.verdict) && r.by === 'adapter';
  return records.some((r) => valid(r) && proven(r)) ? true : null;
}
