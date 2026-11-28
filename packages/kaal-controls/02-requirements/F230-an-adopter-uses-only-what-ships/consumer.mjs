// The consumer of the package: the shipped files copied into a directory outside the repository, as an installed package would be.
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const pkgDir = join(repo, 'packages/kaal-controls');
export const pkg = () => JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
// The paths (relative to the package) that `files` selects: its directories and files, less the `!` entries.
export function shippedPaths() {
  const { files } = pkg();
  const keep = files.filter((f) => !f.startsWith('!'));
  const drop = new Set(files.filter((f) => f.startsWith('!')).map((f) => f.slice(1)));
  return keep.flatMap((f) => walk(join(pkgDir, f)).map((p) => relative(pkgDir, p))).filter((p) => !drop.has(p)).sort();
}
// A consumer directory with the shipped files installed under node_modules and nothing else.
export function installConsumer() {
  const root = mkdtempSync(join(tmpdir(), 'consumer-'));
  const at = join(root, 'node_modules/@kaihacksai/kaal-controls');
  for (const p of shippedPaths()) { mkdirSync(dirname(join(at, p)), { recursive: true }); cpSync(join(pkgDir, p), join(at, p)); }
  writeFileSync(join(at, 'package.json'), JSON.stringify({ name: '@kaihacksai/kaal-controls', version: '0.0.1', type: 'module' }));
  const use = (path) => import(pathToFileURL(join(at, 'skills/kaal-controls/scripts', path)).href);
  return { root, at, use };
}
