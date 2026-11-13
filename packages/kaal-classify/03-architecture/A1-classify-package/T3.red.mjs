// Case classify/T3 tests: classify/A1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'classify/T3';
export const tests = ['classify/A1'];
export const title = "the package is minimal and its key covers every valid kind, mixed and misplaced statements, a weakening, an ambiguity and a dependency";
export function run() {
  const pkg = JSON.parse(read('package.json', 'package.json'));
  assert.equal(pkg.name, 'kaal-classify'); assert.equal(pkg.private, true); assert.deepEqual(pkg.files, ['skills']);
  const PAIRS = ['solution/target', 'delivery/target', 'change/change', 'delivery/change', 'solution/change'];
  const k = key();
  assert.equal(new Set(k.map((s) => s.id)).size, k.length, 'scenario ids repeat');
  for (const s of k) assert.ok(s.parts.every((p) => PAIRS.includes(p)), `${s.id} names an unknown pair`);
  for (const p of PAIRS.slice(0, 3)) assert.ok(k.some((s) => s.finding === 'none' && s.parts.length === 1 && s.parts[0] === p), `no clean scenario holds ${p}`);
  for (const f of ['mixed', 'misplaced', 'weakens-solution', 'ambiguous', 'dependency']) assert.ok(k.some((s) => s.finding === f), `no scenario holds ${f}`);
  assert.ok(k.filter((s) => ['mixed', 'misplaced', 'weakens-solution'].includes(s.finding)).length >= 4, 'fewer than four negative scenarios');
}
