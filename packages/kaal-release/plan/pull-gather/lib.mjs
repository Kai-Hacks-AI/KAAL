// Shared by the PLAN Cases pull/T430 to pull/T434 (RED until the DO).
export async function pkg() {
  const mod = await import('../../skills/kaal-release/scripts/deliveries.mjs');
  if (typeof mod.resolveDeliveries !== 'function') throw new Error('resolveDeliveries is not exported by deliveries.mjs');
  return mod;
}
export const classes = ['HOTFIX', 'WIRE', 'KAAL'];
export const authorities = {
  HOTFIX: { out: 'hotfix-out', in: 'merge-checks' },
  WIRE: { out: 'wire-out', in: 'merge-checks' },
  KAAL: { out: 'kaal-out', in: 'merge-checks' },
};
export const cand = (id, cls, revision = 'r1', owner = 'cap-a') => ({ id, class: cls, name: id, revision, owner });
export const verdict = (candidate, side, v, revision, authority) => ({ candidate, side, verdict: v, revision, authority });
export const facts = (over = {}) => ({ classes, candidates: [], authorities, verdicts: [], registrations: [], ...over });
