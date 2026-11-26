// verify Adapter: names a control confirmed not to run through the adapter. Pure: it reads no file and calls no service.
// A control is judged when it has a station or is delivered. What it claims about itself is never read.
// Anything missing, stale, malformed or contradictory is unknown: the check throws and keeps what it confirmed on the error.
const text = (v) => typeof v === 'string' && v.length > 0;
const list = (v) => Array.isArray(v) && v.every(text);

export function findUnadapted({ controls, delivered, observed, revision } = {}) {
  if (!Array.isArray(controls) || !controls.every((c) => c && text(c.id))) throw new Error('findUnadapted: controls must be a list of controls with an id');
  if (!list(delivered)) throw new Error('findUnadapted: delivered must be a list of ids');
  if (!Array.isArray(observed)) throw new Error('findUnadapted: observed must be a list');
  if (!text(revision)) throw new Error('findUnadapted: revision must be a non-empty string');
  const unknown = [];
  const seen = new Map();
  for (const o of observed) {
    if (!o || !text(o.control) || typeof o.adapted !== 'boolean' || o.revision !== revision) { unknown.push(`malformed:${o && o.control}`); continue; }
    if (seen.has(o.control) && seen.get(o.control) !== o.adapted) { seen.set(o.control, null); continue; }
    if (!seen.has(o.control)) seen.set(o.control, o.adapted);
  }
  const confirmed = [];
  for (const c of controls) {
    const judged = (Array.isArray(c.stations) && c.stations.length > 0) || delivered.includes(c.id);
    if (!judged) continue;
    if (!seen.has(c.id) || seen.get(c.id) === null) { unknown.push(`unobserved:${c.id}`); continue; }
    if (seen.get(c.id) === false) confirmed.push(`unadapted:${c.id}`);
  }
  confirmed.sort();
  if (unknown.length > 0) throw Object.assign(new Error(`findUnadapted: unknown: ${unknown.sort().join(', ')}`), { confirmed, unknown: unknown.sort() });
  return confirmed;
}
