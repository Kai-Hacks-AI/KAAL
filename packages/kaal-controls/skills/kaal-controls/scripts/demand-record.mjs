// demand Record: when a correction of a discrepancy is due. Timing only: no status comparison, no judgement of correctness.
// Pure: it reads no file and calls no service. The owning capability's pull request is the applicable one; an unrelated one owes nothing.
// A lag of a post-WIRE fact is due only when the control is observed installed, its operational evidence exists and the pull request follows it.
// An overclaim is never deferred. Unknown evidence of an owned control, or anything malformed, throws: never clean.
const FACTS = ['defined', 'implemented', 'running', 'tested'];
const DIRECTIONS = ['lags', 'overclaims'];
const text = (v) => typeof v === 'string' && v.length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function parse(name) {
  if (!text(name)) throw new Error('findRecordDue: a discrepancy name is malformed');
  const [fact, direction, ...rest] = name.split(':');
  const control = rest.join(':');
  if (!FACTS.includes(fact) || !DIRECTIONS.includes(direction) || !text(control)) throw new Error(`findRecordDue: a discrepancy name is malformed: ${name}`);
  return { fact, direction, control };
}

export function findRecordDue({ discrepancies, unknown, owners, pr, timing, observed, revision } = {}) {
  if (!text(revision)) throw new Error('findRecordDue: revision must be a non-empty string');
  if (!Array.isArray(discrepancies) || !Array.isArray(unknown)) throw new Error('findRecordDue: discrepancies and unknown must be lists');
  if (!isObject(owners) || !isObject(pr) || !text(pr.capability)) throw new Error('findRecordDue: owners and pr are required');
  if (!Array.isArray(timing) || !Array.isArray(observed)) throw new Error('findRecordDue: timing and observed must be lists');
  const parsed = discrepancies.map(parse);
  const mine = (control) => {
    if (!text(owners[control])) throw new Error(`findRecordDue: ${control} has no owner`);
    return owners[control] === pr.capability;
  };
  const unknownOwned = unknown.filter((u) => {
    if (!text(u)) throw new Error('findRecordDue: an unknown name is malformed');
    const control = u.split(':').slice(1).join(':');
    return text(owners[control]) && owners[control] === pr.capability;
  });
  if (unknownOwned.length > 0) throw new Error(`findRecordDue: unknown evidence of an owned control: ${unknownOwned.sort().join(', ')}`);
  const due = new Set();
  for (const { fact, direction, control } of parsed) {
    if (!mine(control)) continue;
    const t = timing.find((x) => isObject(x) && x.control === control && x.fact === fact && x.revision === revision);
    if (!t || typeof t.followsEvidence !== 'boolean') throw new Error(`findRecordDue: no valid timing for ${fact}:${control}`);
    const o = observed.find((x) => isObject(x) && x.control === control && x.revision === revision);
    if (!o || typeof o.installed !== 'boolean' || typeof o.operationalEvidence !== 'boolean' || !['pre', 'operational'].includes(o.testing)) throw new Error(`findRecordDue: no valid observation of ${control}`);
    const postWire = fact === 'running' || (fact === 'tested' && o.testing === 'operational');
    const deferred = direction === 'lags' && postWire && !(o.installed && o.operationalEvidence && t.followsEvidence);
    if (!deferred) due.add(`record-due:${fact}:${direction}:${control}`);
  }
  return [...due].sort();
}
