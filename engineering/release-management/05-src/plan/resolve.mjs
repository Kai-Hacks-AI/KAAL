// A8 trace-resolver: indexes a plan model and resolves ids and links.
export function index(plan) {
  const byId = new Map();
  const add = (kind, item) => { if (item && typeof item.id === 'string') byId.set(item.id, { kind, item }); };
  for (const item of plan.intents ?? []) add('intent', item);
  for (const item of plan.requirements ?? []) add('requirement', item);
  for (const item of plan.architecture ?? []) add('architecture', item);
  for (const item of plan.defects ?? []) add('defect', item);
  for (const item of plan.cases ?? []) add('case', item);
  for (const item of plan.gaps ?? []) add('gap', item);
  for (const change of plan.changes ?? []) add('change', change);
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
  // Decomposition applies to every kind that has a parent; it places Cases and carries no coverage.
  const parent = typeof item.parent === 'string' ? [item.parent] : [];
  if (kind === 'change') return [...(item.implements ?? []), ...(item.resolves ?? [])];
  if (kind === 'requirement') return [...parent, ...(item.serves ?? [])];
  if (kind === 'architecture') return [...parent, ...(item.addresses ?? [])];
  return parent;
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

// The Change that closes a gap. A gap sits in the folder of its closing Change, and no Change reaches a gap as an ancestor.
export const closersOf = (byId, gap) => [...byId.values()].filter((entry) => entry.kind === 'change' && Array.isArray(entry.item.closes) && entry.item.closes.includes(gap)).map((entry) => entry.item.id);
const placeOf = (byId, id) => (byId.get(id)?.kind === 'gap' ? closersOf(byId, id)[0] ?? id : id);

// The nearest shared ancestor of the targets, or the owning capability when they share none.
// With no shared ancestor, the place is the owning capability, named by the prefix of the targets.
export const capabilityOf = (id) => (typeof id === 'string' && id.includes('/') ? id.split('/')[0] : undefined);

export function nearestShared(byId, targetIds) {
  const targets = [...new Set(targetIds.map((id) => placeOf(byId, id)))];
  if (targets.length === 1) return targets[0];
  const reaches = targets.map((target) => reach(byId, target));
  const common = [...reaches[0].keys()].filter((id) => reaches.every((distance) => distance.has(id)));
  if (common.length === 0) return capabilityOf(targets[0]) ?? 'capability';
  // A shared candidate that another shared candidate reaches is further up the hierarchy: the lowest ones win before distance breaks ties.
  const reachOf = new Map(common.map((id) => [id, reach(byId, id)]));
  const lowest = common.filter((id) => !common.some((other) => other !== id && reachOf.get(other).has(id) && !reachOf.get(id).has(other)));
  if (lowest.length > 0) common.splice(0, common.length, ...lowest);
  const score = (id) => [Math.max(...reaches.map((distance) => distance.get(id))), reaches.reduce((sum, distance) => sum + distance.get(id), 0), id];
  common.sort((a, b) => {
    const [a1, a2, a3] = score(a);
    const [b1, b2, b3] = score(b);
    return a1 - b1 || a2 - b2 || (a3 < b3 ? -1 : a3 > b3 ? 1 : 0);
  });
  return common[0];
}
