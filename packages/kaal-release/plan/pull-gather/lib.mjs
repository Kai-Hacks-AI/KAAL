// Shared by the PLAN Cases pull/T51 to pull/T54 (RED until the DO).
export async function script() {
  const mod = await import('../../skills/kaal-release/scripts/pull-promotion.mjs');
  if (typeof mod.gatherDeliveries !== 'function') throw new Error('gatherDeliveries is not exported by the Script');
  return mod;
}
export const ok = (sha, name) => ({ sha, name, status: 'completed', conclusion: 'success' });
export const classes = { HOTFIX: { out: ['Hotfix'], in: ['Admission'] }, WIRE: { out: ['Wire'], in: ['Admission'] }, KAAL: { out: [], in: ['Branching'] } };
