// Shared by the PLAN Cases pull/T430 to pull/T434 (RED until the DO).
export async function pkg() {
  const mod = await import('../../skills/kaal-release/scripts/deliveries.mjs');
  if (typeof mod.resolveDeliveries !== 'function') throw new Error('resolveDeliveries is not exported by deliveries.mjs');
  return mod;
}
export const classes = ['HOTFIX', 'WIRE', 'KAAL'];
export const authorities = {
  HOTFIX: { stock: 'hotfix-stock', out: 'creation-rules', in: 'merge-checks' },
  WIRE: { stock: 'wire-stock', out: 'creation-rules', in: 'merge-checks' },
  KAAL: { stock: 'kaal-stock', out: 'creation-rules', in: 'merge-checks' },
};
export const cand = (id, cls, revision = 'r1', stock = 'cap-a') => ({ id, class: cls, name: id, revision, stock });
export const verdict = (candidate, side, v, revision, authority) => ({ candidate, side, verdict: v, revision, authority });
export const facts = (over = {}) => ({ classes, candidates: [], authorities, verdicts: [], registrations: [], ...over });
