// limit Act: does a pull request that is an ACT write only the folders of the ACT route? Pure over facts: nothing is read from Git or GitHub.
// judgeLimitAct({ changed, map, roots }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message[, outside] }
// changed: every path the pull request changes, relative to the repository (both ends of a rename); roots: the capability roots, relative to the repository,
// handed in by the wiring; map: the write map as in write-map.json, [{ route, folders, files? }]: the folders a route may write and the exact files
// (the legacy places of an ACT), each relative to a capability root, so that the answer does not depend on where a capability stands. This judge reads only the row of the route 'act'; the other rows are other controls'.
// A folder is a prefix that ends in '/'; a file is an exact path; '*' stands for exactly one segment in both. A pull request that changes a path in a folder
// or a file of the row, under a capability root, is an ACT. A path under no root is in no capability and is outside.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inRoute } from './lib/write-map.mjs';

export { inFolder, isFile } from './lib/write-map.mjs';

import { pass, fail, unknown as cannotTell } from './lib/result.mjs';

const unknown = (message) => cannotTell(message);
const usable = (p) => typeof p === 'string' && p !== '' && !p.startsWith('/') && !p.split('/').includes('..') && !p.split('/').includes('.');

export function judgeLimitAct(facts) {
  const { changed, map, roots } = facts && typeof facts === 'object' ? facts : {};
  if (!Array.isArray(changed) || !changed.every(usable)) return unknown('the changed paths could not be read');
  const plain = (x) => typeof x === 'string' && x.length > 1 && !x.startsWith('/') && !x.split('/').includes('..') && !x.split('/').includes('.');
  const row = (r) => r && typeof r.route === 'string' && r.route !== ''
    && Array.isArray(r.folders ?? []) && Array.isArray(r.files ?? []) && (r.folders?.length ?? 0) + (r.files?.length ?? 0) > 0
    && (r.folders ?? []).every((f) => plain(f) && f.endsWith('/')) && (r.files ?? []).every((f) => plain(f) && !f.endsWith('/'));
  if (!Array.isArray(roots) || !roots.every((r) => typeof r === 'string' && plain(r.endsWith('/') ? r.slice(0, -1) : r))) return unknown('the capability roots could not be read');
  if (!Array.isArray(map) || !map.every(row)) return unknown('the write map could not be read');
  const rows = map.filter((r) => r.route === 'act');
  if (rows.length !== 1) return unknown('the write map has no single row for the route act');
  const { folders = [], files = [] } = rows[0];
  const lies = (p) => inRoute(p, { folders, files }, roots);
  if (!changed.some(lies)) return pass('not an ACT: it changes no folder the route act writes', { applies: false, outside: [] });
  const outside = changed.filter((p) => !lies(p));
  if (outside.length) return fail(`an ACT may write only its folders and files (${[...folders, ...files].join(', ')}): these paths are outside: ${outside.join(', ')}`, { outside });
  return pass('an ACT that writes only the folders and files of its route', { applies: true, outside: [] });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const map = JSON.parse(readFileSync(arg('--map') ?? join(dirname(fileURLToPath(import.meta.url)), 'write-map.json'), 'utf8'));
    r = judgeLimitAct({ changed: JSON.parse(readFileSync(arg('--changed'), 'utf8')), map, roots: JSON.parse(readFileSync(arg('--roots'), 'utf8')) });
  } catch (e) { r = unknown(String(e.message)); }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
