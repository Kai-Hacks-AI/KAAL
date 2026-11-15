// Shared by the PLAN Cases pull/T430 to pull/T433 (RED until the DO).
export async function pkg() {
  const mod = await import('../../skills/kaal-release/scripts/deliveries.mjs');
  if (typeof mod.resolveDeliveries !== 'function') throw new Error('resolveDeliveries is not exported by deliveries.mjs');
  return mod;
}
export const classes = ['HOTFIX', 'WIRE', 'KAAL'];
export const authorities = { HOTFIX: 'hotfix-stock', WIRE: 'wire-stock', KAAL: 'kaal-stock' };
export const cand = (id, cls, revision = 'r1', stock = 'cap-a') => ({ id, class: cls, name: id, revision, stock });
export const verdict = (candidate, v, revision, authority) => ({ candidate, verdict: v, revision, authority });
export const facts = (over = {}) => ({ classes, candidates: [], authorities, verdicts: [], registrations: [], ...over });
