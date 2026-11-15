// Shared by the PLAN Cases pull/T430 to pull/T433 (RED until the DO).
export async function script() {
  const mod = await import('../../skills/kaal-release/scripts/pull-promotion.mjs');
  if (typeof mod.gatherDeliveries !== 'function') throw new Error('gatherDeliveries is not exported by the Script');
  return mod;
}
export const authorities = { HOTFIX: 'hotfix-authority', WIRE: 'wire-authority', KAAL: 'kaal-authority' };
export const verdict = (source, v, revision, authority) => ({ source, verdict: v, revision, authority });
export const done = (sha, name, conclusion = 'success') => ({ sha, name, status: 'completed', conclusion });
