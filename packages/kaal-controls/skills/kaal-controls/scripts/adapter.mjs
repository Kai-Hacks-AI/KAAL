// The thin adapter between a pure check and the world. Pure: it reads no file and calls no service.
// A concern joins it only when every control needs it: the mode, the flag, the ratchet filter, failing closed, one log line, one record.
import { judgeMode } from './judge-mode.mjs';
const MODES = ['detective', 'preventive', 'ratchet'];
const FACTS = ['defined', 'implemented', 'running', 'tested'];
const VERDICTS = ['PASS', 'FAIL', 'REPORT'];
const text = (v) => typeof v === 'string' && v.length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const names = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string') && new Set(v).size === v.length;

// The flag is told to the adapter by the adopter, never read: exactly `on` applies the mode, any other value runs the control switched off,
// and a flag that is missing or malformed is unknown. A switched-off control still executes, so its run is recorded.
function readFlag(f) {
  const known = isObject(f) && text(f.name) && (f.value === null || typeof f.value === 'string');
  return { name: known ? f.name : null, value: known ? f.value : null, state: !known ? 'UNKNOWN' : f.value === 'on' ? 'on' : 'off' };
}

export async function runControl({ id, mode: requested, check, input, baseline, previous, boundary } = {}) {
  const b = boundary ?? {};
  const flag = readFlag(b.flag);
  const off = flag.state === 'off' && MODES.includes(requested);
  const mode = off ? 'detective' : requested;
  let findings = null;
  let confirmed = null;
  if (text(id) && MODES.includes(mode) && typeof check === 'function') {
    // A check that cannot judge everything may keep what it confirmed on the error it throws; the answer stays UNKNOWN.
    try { findings = await check(input); } catch (e) { findings = null; if (names(e?.confirmed)) confirmed = e.confirmed; }
  }
  const judged = judgeMode({ mode, findings: names(findings) ? findings : null, baseline, previous });
  const verdict = text(id) ? judged.verdict : 'UNKNOWN';
  const blocked = !text(id) ? mode !== 'detective' : judged.blocked;
  const ran = off ? 'off' : requested;
  const applied = flag.state === 'on' ? true : off ? false : null;
  const log = { control: id, mode: ran, verdict, findings: names(findings) ? findings.length : null, run: b.run ?? null, sha: b.sha ?? null, flag, ...(confirmed ? { confirmed: confirmed.length } : {}) };
  const record = text(b.x) && text(b.run) && text(b.sha) && text(id) ? { control: id, x: b.x, run: b.run, sha: b.sha, verdict, by: 'adapter', mode: ran, applied, flag } : null;
  return { ...judged, id, mode: ran, ...(off ? { requested } : {}), applied, verdict, blocked, log, record, ...(confirmed ? { confirmed } : {}) };
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

// The records that count as execution evidence for a control at a revision: valid and complete, and established by the adopter.
// A committed record is a claim, not proof of its own authenticity. Running describes that the control executed and judged, not what it found.
export function provenRuns({ id, records, revision, established } = {}) {
  if (!text(id) || !text(revision)) throw new Error('executed: id and revision must be non-empty strings');
  if (!Array.isArray(records) || !Array.isArray(established)) throw new Error('executed: records and established must be lists');
  const proven = (r) => established.some((e) => e && e.control === id && e.run === r.run && e.sha === revision);
  const valid = (r) => r && r.control === id && r.x === 'real' && text(r.run) && r.sha === revision && VERDICTS.includes(r.verdict) && r.by === 'adapter';
  return records.filter((r) => valid(r) && proven(r));
}

// The one fact the adapter can show: running. It answers true or null, never false.
export function executed(input) {
  return provenRuns(input).length > 0 ? true : null;
}
