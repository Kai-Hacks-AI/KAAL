// verify Delivery: names a delivered entry that no declaration correlates to. Pure: it reads no file and calls no service.
// An inventory is usable only when it is complete, of the applicable revision and of the applicable scope.
// Anything else (failed, partial, stale, missing, malformed) throws, so that the adapter answers UNKNOWN.
const text = (v) => typeof v === 'string' && v.length > 0;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function usable(name, inventory, revision, scope) {
  if (!isObject(inventory)) throw new Error(`findUnrecorded: the ${name} inventory is missing or malformed`);
  if (inventory.complete !== true) throw new Error(`findUnrecorded: the ${name} inventory is not established complete`);
  if (inventory.revision !== revision || inventory.scope !== scope) throw new Error(`findUnrecorded: the ${name} inventory is stale or of another scope`);
  if (!Array.isArray(inventory.entries)) throw new Error(`findUnrecorded: the ${name} inventory has no entries list`);
  return inventory.entries;
}

export function findUnrecorded({ declarations, delivered, revision, scope } = {}) {
  if (!text(revision) || !text(scope)) throw new Error('findUnrecorded: revision and scope must be non-empty strings');
  const declared = usable('declarations', declarations, revision, scope);
  const found = usable('delivered', delivered, revision, scope);
  const known = new Set();
  for (const d of declared) {
    if (!isObject(d) || !text(d.id) || !text(d.path)) throw new Error('findUnrecorded: a declaration entry is malformed');
    known.add(d.id);
    known.add(d.path);
  }
  const unrecorded = new Set();
  for (const e of found) {
    if (!text(e)) throw new Error('findUnrecorded: a delivered entry is malformed');
    if (!known.has(e)) unrecorded.add(`unrecorded:${e}`);
  }
  return [...unrecorded].sort();
}
