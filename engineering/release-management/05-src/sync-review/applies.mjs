// release/C152 verify Sync applies: decides from Git alone whether a pull request head is an attempt at a SYNC, never from its title or body.
// Applicability and validity are two answers that are never merged:
//   applies: 'sync' | 'not-sync' | 'unknown'   is this head a merge that brings the default branch into the base?
//   valid:   boolean (only when applies is 'sync') is the attempt a good one: is its other parent the CURRENT tip of the base?
// A SYNC prepared against an older base tip stays `sync` when the base advances; it is `valid: false` with the reason `stale base`.
// A fact that cannot be read, or a shape that is ambiguous, is `unknown`, never `not-sync`.
//
// git(args) -> { status, stdout }
const FULL = /^[0-9a-f]{40}$/;

export function appliesFromGit({ git, baseTipRef, mainRef, head } = {}) {
  const unknown = (reason) => ({ applies: 'unknown', reason });
  if (typeof git !== 'function' || !baseTipRef || !mainRef || !head) return unknown('a ref is missing');
  const out = (args) => { const r = git(args); return r && r.status === 0 ? String(r.stdout).trim() : null; };
  const line = out(['rev-list', '--parents', '-n', '1', head]);
  if (line === null || line === '') return unknown('the head cannot be read');
  const [sha, ...parents] = line.split(/\s+/);
  if (!FULL.test(sha) || !parents.every((p) => FULL.test(p))) return unknown('the head cannot be read');
  if (parents.length > 2) return unknown('the head has more than two parents');
  if (parents.length < 2) return { applies: 'not-sync', reason: 'the head is not a merge commit' };
  const tip = out(['rev-parse', '--verify', `${baseTipRef}^{commit}`]);
  if (!tip) return unknown('the tip of the base cannot be read');
  // 0 yes, 1 no, anything else cannot be said
  const ancestor = (a, b) => { const r = git(['merge-base', '--is-ancestor', a, b]); return r && (r.status === 0 || r.status === 1) ? r.status === 0 : null; };
  const sides = [];
  for (const p of parents) {
    const onMain = ancestor(p, mainRef);
    const inBase = ancestor(p, tip);
    if (onMain === null || inBase === null) return unknown('an ancestry fact cannot be read');
    sides.push(onMain && !inBase);
  }
  if (sides[0] && sides[1]) return unknown('both parents come from the default branch');
  if (!sides[0] && !sides[1]) return { applies: 'not-sync', reason: 'no parent brings the default branch in' };
  const other = sides[0] ? parents[1] : parents[0];
  return other === tip ? { applies: 'sync', valid: true } : { applies: 'sync', valid: false, reason: 'stale base: the other parent is not the current tip of the base' };
}
