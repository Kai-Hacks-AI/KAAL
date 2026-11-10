// A8 trace-resolver: indexes a plan model and resolves ids and links.
export function index(plan) {
  const byId = new Map();
  const add = (kind, item) => { if (item && typeof item.id === 'string') byId.set(item.id, { kind, item }); };
  for (const item of plan.intents ?? []) add('intent', item);
  for (const item of plan.requirements ?? []) add('requirement', item);
  for (const item of plan.architecture ?? []) add('architecture', item);
  for (const item of plan.defects ?? []) add('defect', item);
  for (const change of plan.changes ?? []) {
    add('change', change);
    for (const gap of change.gaps ?? []) byId.set(gap, { kind: 'gap', item: { id: gap, change: change.id } });
  }
  return byId;
}

export const kindOf = (byId, id) => byId.get(id)?.kind;

// Elements with a parent link, with the kind a parent must have.
export function decomposed(byId) {
  return [...byId.entries()].filter(([, entry]) => entry.item.parent !== undefined).map(([id, entry]) => ({ id, kind: entry.kind, parent: entry.item.parent }));
}

// Ids that sit on a parent cycle. Parent is decomposition only.
export function cycleMembers(byId) {
  const members = new Set();
  for (const [id] of byId) {
    const seen = new Set([id]);
    let next = byId.get(id)?.item.parent;
    while (typeof next === 'string' && byId.has(next)) {
      if (next === id) { members.add(id); break; }
      if (seen.has(next)) break;
      seen.add(next);
      next = byId.get(next).item.parent;
    }
  }
  return members;
}

function edges(byId, id) {
  const entry = byId.get(id);
  if (!entry) return [];
  const { kind, item } = entry;
  if (kind === 'gap') return [item.change];
  if (kind === 'change') return [...(item.implements ?? []), ...(item.resolves ?? [])];
  if (kind === 'requirement') return item.serves ?? [];
  if (kind === 'architecture') return [...(item.parent ? [item.parent] : []), ...(item.addresses ?? [])];
  return [];
}

// Distance to every semantic or decomposition ancestor of an element, itself at 0.
export function reach(byId, id) {
  const distance = new Map([[id, 0]]);
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of edges(byId, current)) {
      if (byId.has(next) && !distance.has(next)) {
        distance.set(next, distance.get(current) + 1);
        queue.push(next);
      }
    }
  }
  return distance;
}

// The nearest shared ancestor of the targets, or 'capability' when they share none.
// A gap has no folder, so a Case that tests it sits beside its Change.
const placeOf = (byId, id) => (byId.get(id)?.kind === 'gap' ? byId.get(id).item.change : id);

export function nearestShared(byId, targetIds) {
  const targets = [...new Set(targetIds.map((id) => placeOf(byId, id)))];
  if (targets.length === 1) return targets[0];
  const reaches = targets.map((target) => reach(byId, target));
  const common = [...reaches[0].keys()].filter((id) => reaches.every((distance) => distance.has(id)));
  if (common.length === 0) return 'capability';
  const score = (id) => [Math.max(...reaches.map((distance) => distance.get(id))), reaches.reduce((sum, distance) => sum + distance.get(id), 0), id];
  common.sort((a, b) => {
    const [a1, a2, a3] = score(a);
    const [b1, b2, b3] = score(b);
    return a1 - b1 || a2 - b2 || (a3 < b3 ? -1 : a3 > b3 ? 1 : 0);
  });
  return common[0];
}
