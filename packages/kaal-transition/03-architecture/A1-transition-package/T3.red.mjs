// Case transition/T3 tests: transition/A1
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C1-transition/lib.mjs';
export const id = 'transition/T3';
export const tests = ['transition/A1'];
export const title = "the package is minimal and its key covers every kind of truth, a mixed statement and each confusion";
export function run() {
  const pkg = JSON.parse(read('package.json', 'package.json'));
  assert.equal(pkg.name, 'kaal-transition'); assert.equal(pkg.private, true); assert.deepEqual(pkg.files, ['skills']);
  const KINDS = JSON.parse(read('03-architecture/A1-transition-package/scenarios.json', 'the key')).kinds;
  const k = key();
  assert.equal(new Set(k.map((s) => s.id)).size, k.length, 'scenario ids repeat');
  for (const s of k) assert.ok(s.parts.every((p) => KINDS.includes(p)), `${s.id} names an unknown kind`);
  for (const kind of KINDS) assert.ok(k.some((s) => s.finding === 'none' && s.parts.length === 1 && s.parts[0] === kind), `no clean scenario holds ${kind}`);
  for (const f of ['mixed', 'historical-as-target', 'historical-as-evidence', 'retires-enduring', 'no-transition-evidence']) assert.ok(k.some((s) => s.finding === f), `no scenario holds ${f}`);
}
