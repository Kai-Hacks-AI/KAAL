import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walk, frontmatter } from './tree.mjs';

const CASE_FILE = /(^|\/)T\d+\.(red|test)\.mjs$/;
// The relationships between elements, each one-way, from the element that declares it to the one it names.
const EDGES = ['implements', 'serves', 'addresses', 'has'];

// The elements of a tree: every Markdown file with a frontmatter id, and every draft (a block fenced by five backticks)
// in the files of the Change folder, where a PLAN keeps the elements that justify its Cases until the DO places them.
// An element that is placed wins over its draft.
export function elementsOf(root, changeDir) {
  const found = new Map();
  const add = (fm, placed) => { if (fm?.id && (placed || !found.has(fm.id))) found.set(fm.id, fm); };
  for (const file of walk(root).filter((f) => f.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    add(frontmatter(text), true);
    if (relative(root, file).startsWith(`${changeDir}/`)) for (const block of text.matchAll(/^`````\n([\s\S]*?)\n`````$/gm)) add(frontmatter(block[1]), false);
  }
  return found;
}

// The ids the Change justifies: the Intents its record (C<n>.md) implements, and every element that reaches one of them along the relationships.
export function justifiedBy(elements, change) {
  const justified = new Set(([]).concat(change?.implements ?? []));
  for (let grew = true; grew;) {
    grew = false;
    for (const [id, fm] of elements) {
      if (justified.has(id)) continue;
      if (EDGES.some((k) => ([]).concat(fm[k] ?? []).some((t) => justified.has(t)))) { justified.add(id); grew = true; }
    }
  }
  return justified;
}

// The Cases that apply to a Change: those in its folder, and those that test an element it justifies, wherever they are.
// A Case is parked red while any file carrying its id is a .red.mjs.
export function applicableCases(root, changeDir) {
  const record = readdirSync(join(root, changeDir)).find((f) => /^C\d+\.md$/.test(f));
  const change = record ? frontmatter(readFileSync(join(root, changeDir, record), 'utf8')) : null;
  const justified = justifiedBy(elementsOf(root, changeDir), change);
  const cases = new Map();
  for (const file of walk(root).filter((f) => CASE_FILE.test(f))) {
    const text = readFileSync(file, 'utf8');
    const id = text.match(/export const id = '([^']+)'/)?.[1];
    if (!id) continue;
    const tests = (text.match(/export const tests = \[([^\]]*)\]/)?.[1] ?? '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    const inChange = relative(root, file).startsWith(`${changeDir}/`);
    if (!inChange && !tests.some((t) => justified.has(t))) continue;
    const parked = file.endsWith('.red.mjs');
    const known = cases.get(id);
    cases.set(id, { id, path: relative(root, file), parked: parked || (known?.parked ?? false) });
  }
  return [...cases.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

// The retros as they are found: every Markdown file under 02-learnings/retros that declares what it reflects (`reflects: [release/C103, ...]`, qualified ids as the retro writes them).
// Nothing else of a retro is read: its id and its format are kaal-retro's. No folder, no retros.
export function retrosOf(root) {
  return walk(join(root, '02-learnings/retros')).filter((f) => f.endsWith('.md')).map((f) => frontmatter(readFileSync(f, 'utf8')))
    .filter((fm) => fm && 'reflects' in fm).map((fm) => ({ reflects: ([]).concat(fm.reflects) }));
}

// The qualified id of a Change, as its record (C<n>.md) declares it and as a retro reflects it: release/C103. No record, no id.
export function changeIdOf(root, changeDir) {
  const record = existsSync(join(root, changeDir)) && readdirSync(join(root, changeDir)).find((f) => /^C\d+\.md$/.test(f));
  const id = record ? frontmatter(readFileSync(join(root, changeDir, record), 'utf8'))?.id : undefined;
  return typeof id === 'string' && id !== '' ? id : undefined;
}

// The Changes a collector carries, each { id, applicable }, from the folders handed in. A folder that is not there or has no qualified id is not a carried Change we know.
export function carriedChanges(root, dirs) {
  const ids = dirs.map((d) => changeIdOf(root, d));
  if (!dirs.length || ids.some((id) => !id) || dirs.some((d) => !existsSync(join(root, d)))) throw new Error('the carried Changes are not known');
  return dirs.map((d, i) => ({ id: ids[i], applicable: applicableCases(root, d) }));
}
