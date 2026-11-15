// release/A48: the release judge. A pure function; it reads and changes nothing.
// It keeps four questions apart and has no single "ready" answer:
//   deliveryScope        every declared (committed) Change is delivered on main
//   contract.unserved    the "new" Intents of the version's contract that no Change of the delivery scope serves
//   productVerification  UNKNOWN until its own Change defines it
//   publicationReadiness UNKNOWN until its own Change defines it
const INTENT_STATUS = new Set(['new', 'retained']);

const fail = (why) => { throw new Error(`invalid release manifest: ${why}`); };
const ids = (list, what, check) => {
  if (!Array.isArray(list)) fail(`${what} is not a list`);
  const seen = new Set();
  for (const e of list) {
    if (!e || typeof e.id !== 'string' || !e.id) fail(`${what} has an entry without an id`);
    if (seen.has(e.id)) fail(`${what} lists ${e.id} twice`);
    seen.add(e.id);
    check(e);
  }
  return list.map((e) => e.id);
};

export function judge(manifest, delivered, serves) {
  if (!manifest || typeof manifest.package !== 'string' || typeof manifest.version !== 'string') fail('package and version are required');
  ids(manifest.contract?.intents, 'contract.intents', (e) => {
    if (!INTENT_STATUS.has(e.status)) fail(`${e.id} has status ${String(e.status)}, expected new or retained`);
  });
  const changes = ids(manifest.delivery?.changes, 'delivery.changes', (e) => {
    if ('role' in e) fail(`${e.id} carries a role; every declared Change is committed`);
  });
  const have = delivered instanceof Set ? delivered : new Set(delivered);
  const deliveredIds = changes.filter((c) => have.has(c));
  const missing = changes.filter((c) => !have.has(c));
  let unserved = 'UNKNOWN';
  if (typeof serves === 'function') {
    const served = new Set(changes.flatMap((c) => serves(c) ?? []));
    unserved = manifest.contract.intents.filter((i) => i.status === 'new' && !served.has(i.id)).map((i) => i.id);
  }
  return {
    deliveryScope: { complete: missing.length === 0, delivered: deliveredIds, missing },
    contract: { unserved },
    productVerification: 'UNKNOWN',
    publicationReadiness: 'UNKNOWN',
  };
}
