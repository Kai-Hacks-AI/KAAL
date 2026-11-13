// Case architecture/T5 tests: architecture/A1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T5';
export const tests = ['architecture/A1'];
export const title = "the package is minimal and its key covers each kind, six domains outside software and the negative findings";
export function run() {
  const pkg = JSON.parse(read('package.json', 'package.json'));
  assert.equal(pkg.name, 'kaal-architecture'); assert.equal(pkg.private, true); assert.deepEqual(pkg.files, ['skills']);
  const k = key();
  assert.equal(new Set(k.map((s) => s.id)).size, k.length, 'scenario ids repeat');
  for (const s of k) assert.ok(s.parts.every((p) => ['solution', 'delivery'].includes(p)), `${s.id} names a part that is neither Solution nor Delivery`);
  for (const p of ['solution', 'delivery']) assert.ok(k.some((s) => s.finding === 'none' && s.parts.length === 1 && s.parts[0] === p), `no clean scenario holds ${p}`);
  for (const f of ['mixed', 'ambiguous']) assert.ok(k.some((s) => s.finding === f), `no scenario holds ${f}`);
  assert.ok(k.filter((s) => s.finding === 'mixed').every((s) => s.parts.length === 2), 'a mixed scenario does not hold both');
  assert.ok(new Set(k.filter((s) => s.domain !== 'software').map((s) => s.domain)).size >= 4, 'fewer than four domains outside software');
  assert.ok(k.some((s) => s.domain === 'software'), 'no software scenario');
}
