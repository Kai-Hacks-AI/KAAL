// demand Evidence: names each fact and the authorization that a discovered activation or enforcement transition lacks.
// Pure: it reads no file and calls no service. Nothing here is ratchet-eligible: no baseline stands in for readiness or authorization.
// Missing, stale or incomplete evidence throws, so that the adapter answers UNKNOWN and nothing is permitted.
const MODES = ['detective', 'preventive', 'ratchet'];
const NEEDS = {
  activation: ['defined', 'implemented', 'testedPre'],
  enforcement: ['defined', 'implemented', 'installed', 'running', 'testedOperational'],
};
const text = (v) => typeof v === 'string' && v.length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export function findEvidenceDue({ discovery, transitions, facts, authorizations, revision, mode } = {}) {
  if (!MODES.includes(mode)) throw new Error('findEvidenceDue: mode must be detective, preventive or ratchet');
  if (mode === 'ratchet') throw new Error('findEvidenceDue: nothing here is ratchet-eligible');
  if (!text(revision)) throw new Error('findEvidenceDue: revision must be a non-empty string');
  if (!isObject(discovery) || discovery.complete !== true || discovery.revision !== revision) throw new Error('findEvidenceDue: the discovery of transitions is missing, stale or incomplete');
  if (!Array.isArray(transitions)) throw new Error('findEvidenceDue: transitions must be a list');
  if (!isObject(facts)) throw new Error('findEvidenceDue: facts must be an object keyed by control id');
  if (!Array.isArray(authorizations) || !authorizations.every((a) => isObject(a) && text(a.control) && text(a.kind) && text(a.revision))) throw new Error('findEvidenceDue: authorizations are malformed');
  const due = new Set();
  for (const t of transitions) {
    if (!isObject(t) || !text(t.control) || !(t.kind in NEEDS) || t.revision !== revision) throw new Error('findEvidenceDue: a transition is malformed, of an unknown kind or of another revision');
    const entry = facts[t.control];
    if (!isObject(entry) || entry.revision !== revision) throw new Error(`findEvidenceDue: facts of ${t.control} are missing or stale`);
    for (const k of NEEDS[t.kind]) {
      if (typeof entry[k] !== 'boolean') throw new Error(`findEvidenceDue: fact ${k} of ${t.control} is unknown`);
      if (!entry[k]) due.add(`evidence-due:${t.kind}:${k}:${t.control}`);
    }
    if (!authorizations.some((a) => a.control === t.control && a.kind === t.kind && a.revision === revision)) due.add(`evidence-due:${t.kind}:authorized:${t.control}`);
  }
  return [...due].sort();
}
