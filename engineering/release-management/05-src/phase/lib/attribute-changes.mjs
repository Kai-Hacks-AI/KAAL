// Attribute Changes (release/C123): which of the paths a pull request changes are the collector's own and which main already holds. Three folders of files are read and
// nothing in them is run; Git and GitHub only bring the folders, and no commit, parent or history is read here.
//   before    the collector before the pull request
//   after     the merge result
//   contained main as the merge result contains it: main at the newest main commit already inside `after`
// A path is changed when its bytes differ between `before` and `after` or it exists in only one. A changed path is `inherited` when it has the same bytes in `after` and in
// `contained` (or is absent from both: main made the same deletion), and `own` otherwise: it differs from what main holds in the result, a conflict-resolution edit included.
// The unit is the path. A folder that is absent or unreadable gives no attribution (`complete: false`, the names in `missing`): never own, never inherited.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const files = (root, rel = '') => readdirSync(join(root, rel), { withFileTypes: true }).flatMap((e) => (e.name === '.git' ? [] : e.isDirectory() ? files(root, join(rel, e.name)) : [join(rel, e.name)]));
const same = (a, b, path) => { const x = existsSync(join(a, path)), y = existsSync(join(b, path)); return x === y && (!x || readFileSync(join(a, path)).equals(readFileSync(join(b, path)))); };

export function attributeChanges({ before, after, contained }) {
  const missing = Object.entries({ before, after, contained }).filter(([, dir]) => !dir || !existsSync(dir)).map(([name]) => name);
  const none = (why) => ({ own: [], inherited: [], unknown: [], complete: false, missing: why });
  if (missing.length) return none(missing);
  try {
    const changed = [...new Set([...files(before), ...files(after)])].sort().filter((p) => !same(before, after, p));
    const inherited = changed.filter((p) => same(after, contained, p));
    return { own: changed.filter((p) => !inherited.includes(p)), inherited, unknown: [], complete: true, missing: [] };
  } catch (e) { return none([`unreadable: ${e.message}`]); }
}
