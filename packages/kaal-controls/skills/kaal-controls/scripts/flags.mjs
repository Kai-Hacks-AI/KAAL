// The flag file: format, reader and flag source. Pure: it reads no file and no environment; the adopter hands the text over.
import { flagState } from './stamp.mjs';
const SCHEMA = 'kaal-controls/flags@1';
const text = (v) => typeof v === 'string' && v.length > 0;
const key = (control, place) => `${control}@${place}`;

export function parseFlags(source) {
  if (typeof source !== 'string') throw new Error('parseFlags: the text must be a string');
  let doc;
  try { doc = JSON.parse(source); } catch { throw new Error('parseFlags: not JSON'); }
  if (doc === null || typeof doc !== 'object' || Array.isArray(doc) || doc.schema !== SCHEMA) throw new Error(`parseFlags: the schema is not ${SCHEMA}`);
  if (!Array.isArray(doc.flags)) throw new Error('parseFlags: flags must be a list');
  const seen = new Set();
  for (const e of doc.flags) {
    if (e === null || typeof e !== 'object' || Array.isArray(e) || !text(e.control) || !text(e.place) || !text(e.name) || !(e.value === null || typeof e.value === 'string')) throw new Error('parseFlags: an entry is not whole');
    if (seen.has(key(e.control, e.place))) throw new Error(`parseFlags: ${key(e.control, e.place)} has two entries`);
    seen.add(key(e.control, e.place));
  }
  return doc.flags.map(({ control, place, name, value }) => ({ control, place, name, value })).sort((a, b) => (key(a.control, a.place) < key(b.control, b.place) ? -1 : 1));
}

// A flag source is anything with `of(control, place)` giving `{ name, value }` or undefined; `controls()` is optional. The file is the first.
export function flagSource(entries) {
  if (!Array.isArray(entries)) throw new Error('flagSource: entries must be a list');
  const map = new Map(entries.map((e) => [key(e.control, e.place), { name: e.name, value: e.value }]));
  return { of: (control, place) => map.get(key(control, place)), controls: () => [...map.keys()].sort() };
}

// Configuration validation, before anything runs: every preventive or detective control has a recognized flag in every place it runs. Orphan flags are not errors.
export function validateFlags({ controls, source } = {}) {
  if (!Array.isArray(controls) || !controls.every((c) => c && typeof c.id === 'string' && Array.isArray(c.places) && c.places.length > 0 && c.places.every(text))) throw new Error('validateFlags: controls must be a list of {id, type, places}');
  if (!source || typeof source.of !== 'function') throw new Error('validateFlags: source must be a flag source');
  const errors = [];
  for (const c of controls.filter((x) => x.type === 'preventive' || x.type === 'detective')) {
    for (const p of c.places) {
      const flag = source.of(c.id, p);
      const bad = flag === undefined || flag === null ? 'no-flag' : flagState(flag.value) === 'UNKNOWN' ? 'unrecognized-flag' : null;
      if (bad) errors.push(`${c.type === 'preventive' ? 'preventive-without-flag' : bad}:${c.id}@${p}`);
    }
  }
  errors.sort();
  return { ok: errors.length === 0, errors };
}

// The outcome of one pipeline pass, with enforcement (what a verdict does under an explicit flag) apart from a configuration failure (nothing ran).
// `validation` is the result of validateFlags, or absent for a legacy caller that does not validate; `runs` are the controls that ran: { control, place, applied, blocked }.
export function decideOutcome({ validation, runs } = {}) {
  const tri = (v) => v === true || v === false || v === null;
  if (!Array.isArray(runs) || !runs.every((r) => r && text(r.control) && text(r.place) && tri(r.applied) && tri(r.blocked))) throw new Error('decideOutcome: runs must be a list of { control, place, applied, blocked }');
  if (validation !== undefined && validation !== null && (typeof validation.ok !== 'boolean' || !Array.isArray(validation.errors))) throw new Error('decideOutcome: validation must be the result of validateFlags');
  if (validation && !validation.ok) {
    if (runs.length > 0) throw new Error('decideOutcome: nothing runs after a failed validation');
    const reasons = [...validation.errors].sort();
    return { outcome: 'CONFIG_FAILED', enforcement: 'none', exit: 1, reasons };
  }
  const blocked = runs.filter((r) => r.blocked === true);
  const reasons = blocked.map((r) => `${r.applied === true ? 'blocked' : r.applied === null ? 'blocked-without-flag' : 'blocked-without-authority'}:${r.control}@${r.place}`).sort();
  const enforcement = blocked.some((r) => r.applied === null) ? 'legacy' : blocked.length ? 'authorized' : 'none';
  return { outcome: blocked.length ? 'BLOCKED' : 'PASSED', enforcement, exit: blocked.length ? 1 : 0, reasons };
}
