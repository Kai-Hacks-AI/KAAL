// The shared set-up of the Cases of engineering/F97: where the data sits, and how a path resolves against it.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = new URL(import.meta.url).pathname.split('/packages/')[0];
const refs = join(root, 'packages/kaal-engineering/skills/kaal-engineering/references');
export const layout = JSON.parse(readFileSync(join(refs, 'package-layout.json'), 'utf8'));
export const areasPath = join(refs, 'write-areas.json');
export const load = () => { if (!existsSync(areasPath)) throw new Error('write-areas.json does not exist'); return JSON.parse(readFileSync(areasPath, 'utf8')); };
const seg = (s, p) => new RegExp(`^${p.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}$`).test(s);
// The phase of a path: the longest row it lies under; undefined when no row names it.
export function resolve(areas, path) {
  const parts = path.split('/');
  const alias = areas.legacy?.[parts[0]];
  const norm = alias ? [...alias.split('/'), ...parts.slice(1)] : parts;
  let best;
  for (const row of areas.areas) {
    const r = row.path.split('/');
    if (r.length <= norm.length && r.every((s, i) => seg(norm[i], s)) && (!best || r.length > best.len)) best = { len: r.length, phase: row.phase ?? (row.delegatedTo ? `delegated:${row.delegatedTo}` : row.transition ? `transition:${row.transition}` : undefined) };
  }
  return best?.phase;
}
