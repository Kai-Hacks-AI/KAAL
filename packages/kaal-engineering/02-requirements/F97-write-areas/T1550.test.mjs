// Case engineering/T1550 tests: engineering/F97
import assert from 'node:assert/strict';
import { layout, load, resolve } from './fixture.mjs';
export const id = 'engineering/T1550';
export const tests = ['engineering/F97'];
export const title = 'every folder and child of the layout, and every package root file, resolves to a phase, except the ones named as unassigned';
export async function run() {
  const areas = load();
  const unassigned = new Set(['dist', '14-operations/runs']);
  const paths = [];
  for (const f of layout.folders) {
    if (!f.children) paths.push(`${f.name}/x.md`);
    for (const c of f.children ?? []) paths.push(`${f.name}/${c}/x.md`);
  }
  for (const r of layout.root) paths.push(r.name.replaceAll('*', 'x'));
  for (const p of paths) {
    const phase = resolve(areas, p);
    if ([...unassigned].some((u) => p.startsWith(`${u}/`))) assert.equal(phase, undefined, `${p} must be unassigned`);
    else assert.ok(['PLAN', 'DO', 'CHECK', 'ACT'].includes(phase), `${p} has no phase`);
  }
}
