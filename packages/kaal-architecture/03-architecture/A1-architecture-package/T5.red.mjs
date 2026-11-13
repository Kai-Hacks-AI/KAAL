// Case architecture/T5 tests: architecture/A1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T5';
export const tests = ['architecture/A1'];
export const title = "the package is minimal and its key covers each kind, transferable domains and the negative findings";
export function run() {
  const pkg = JSON.parse(read('package.json', 'package.json'));
  assert.equal(pkg.name, 'kaal-architecture'); assert.equal(pkg.private, true); assert.deepEqual(pkg.files, ['skills']);
  const PAIRS = ['solution/target', 'delivery/target', 'transition'];
  const k = key();
  assert.equal(new Set(k.map((s) => s.id)).size, k.length, 'scenario ids repeat');
  for (const s of k) assert.ok(s.parts.every((p) => PAIRS.includes(p)), `${s.id} names an unknown part`);
  for (const p of PAIRS) assert.ok(k.some((s) => s.finding === 'none' || s.finding === 'transition' ? s.parts.length === 1 && s.parts[0] === p : false), `no scenario holds ${p} alone`);
  for (const f of ['mixed', 'disguised', 'ambiguous', 'transition']) assert.ok(k.some((s) => s.finding === f), `no scenario holds ${f}`);
  const outside = new Set(k.filter((s) => s.domain !== 'software').map((s) => s.domain));
  assert.ok(outside.size >= 4, 'fewer than four domains outside software');
  assert.ok(k.some((s) => s.domain === 'software'), 'no software scenario');
}
