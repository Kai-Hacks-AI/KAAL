import { execFileSync } from 'node:child_process';
import { findControls } from './find-controls.mjs';
import { fileURLToPath } from 'node:url';
// `stations` is the list of station names of the adopter's setup, as for `findControls`.
export function registryAt(files, station, stations) {
  return findControls(files, { stations }).controls.filter((c) => c.valid).flatMap((c) => c.stations.filter((s) => s.station === station).map((s) => ({ id: c.id, title: c.title, mode: s.mode, status: c.status, path: c.path })));
}
export function filesAt(repo, ref) {
  const g = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8', maxBuffer: 1 << 28 });
  return g('ls-tree', '-r', '--name-only', ref).split('\n').filter((p) => /\.(md|mjs|json)$/.test(p) && !/(^|\/)package-lock\.json$/.test(p)).map((p) => ({ path: p, text: g('show', `${ref}:${p}`) }));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = Object.fromEntries(process.argv.slice(2).reduce((r, x, i, v) => (x.startsWith('--') ? [...r, [x.slice(2), v[i + 1]]] : r), []));
  console.log(JSON.stringify(registryAt(filesAt(a.repo, a.base), a.station, (a.stations ?? '').split(',').map((n) => n.trim()).filter(Boolean)), null, 2));
}
