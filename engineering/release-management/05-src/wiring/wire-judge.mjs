// The install judge of the WIRE operation (release/F22, A47). It judges an install; it installs nothing.
// An install is right when every changed file is a declared target under .githooks/ or .github/, and each target is
//  - a copy: its source is on main and the target text equals the source text, or
//  - a move: the preimage on main has the declared sha256 and the target has exactly that content;
// and every declared target changed. Anything else, undeclared files included, is wrong.
const ZONE = /^\.(githooks|github)\//;

export function judge({ changed, pairs, onMain, baseText, hash }) {
  const byTarget = new Map(pairs.map((p) => [p.target, p]));
  const allowed = changed.every((c) => {
    const p = byTarget.get(c.path);
    if (!p || !ZONE.test(c.path)) return false;
    if (p.kind === 'copy') return onMain(p.source) && c.text === p.text;
    if (p.kind === 'move') {
      const base = baseText(p.from);
      return base !== undefined && hash(base) === p.sha256 && hash(c.text) === p.sha256;
    }
    return false;
  });
  return allowed && pairs.every((p) => changed.some((c) => c.path === p.target));
}
