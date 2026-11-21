// The tree facts of a collector, read as data (release/C122). Two folders are read and nothing in them is run: the default branch (the judge's side:
// the write map, the scripts of kaal-retro) and the collector as the pull request would leave it. The answers are the facts the judges of the ACT ask for. Git is not read here (lib/ starts no process); the changed paths are handed in.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { walk } from './tree.mjs';
import { changeIdOf, retrosOf } from './collector.mjs';

export const RETRO_SCRIPTS = 'packages/kaal-retro/skills/kaal-retro/scripts';
export const WRITE_MAP = 'engineering/release-management/05-src/phase/write-map.json';

// Whether a path holds the same bytes in two folders (both must have it): what a pull request got from main is not its own change (release/D18).
export const sameContent = (a, b, path) => existsSync(join(a, path)) && existsSync(join(b, path)) && readFileSync(join(a, path)).equals(readFileSync(join(b, path)));

const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);

// The capability roots of a tree: every folder under engineering/ and packages/ that holds a 00-changes folder.
export const capabilityRoots = (tree) => ['engineering', 'packages'].flatMap((top) => dirs(join(tree, top)).map((n) => `${top}/${n}`).filter((r) => existsSync(join(tree, r, '00-changes'))));

// The Changes a collector carries: the Change folders that are in the collector and not on main. A folder difference of the two trees.
export function carriedFolders(main, collector, roots) {
  return roots.flatMap((root) => dirs(join(collector, root, '00-changes')).filter((d) => /^C\d+-./.test(d) && !existsSync(join(main, root, '00-changes', d))).map((d) => ({
    root, dir: `00-changes/${d}`, id: changeIdOf(join(collector, root), `00-changes/${d}`),
  }))).sort((a, b) => String(a.id).localeCompare(String(b.id), 'en', { numeric: true }));
}

// The facts: carried Changes, retros (as the demand judge and the verify judge read them), what the finder refused, the changed paths, the roots and the write map.
export async function readTree({ main, collector, changed, scripts = join(main, RETRO_SCRIPTS), mapFile = join(main, WRITE_MAP) }) {
  const roots = capabilityRoots(collector);
  const carried = carriedFolders(main, collector, roots);
  const { findRetros } = await import(pathToFileURL(join(scripts, 'find-retros.mjs')).href);
  const { judgeRetro } = await import(pathToFileURL(join(scripts, 'judge-retro.mjs')).href);
  const files = roots.flatMap((root) => walk(join(collector, root, '02-learnings/retros')).filter((f) => f.endsWith('.md')).map((f) => ({ path: relative(collector, f), text: readFileSync(f, 'utf8') })));
  const found = findRetros(files);
  return {
    carried,
    demandRetros: roots.flatMap((root) => retrosOf(join(collector, root))),
    retros: found.retros.map((r) => ({ path: r.path, reflects: r.reflects, form: judgeRetro(files.find((f) => f.path === r.path).text) })),
    refused: found.refused,
    changed,
    roots,
    map: JSON.parse(readFileSync(mapFile, 'utf8')),
  };
}
