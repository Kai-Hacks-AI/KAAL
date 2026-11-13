// Case change/T63 tests: change/A24
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial, FIELDS } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T63';
export const tests = ['change/A24'];
export const title = "the additions are minimal and its key covers every kind of truth, a mixed statement and each confusion";
export function run() {
  read(SKILL, 'the Skill');
  const KINDS = JSON.parse(read('03-architecture/A24-transition-package/scenarios.json', 'the key')).kinds;
  const k = key();
  assert.equal(new Set(k.map((s) => s.id)).size, k.length, 'scenario ids repeat');
  for (const s of k) assert.ok(s.parts.every((p) => KINDS.includes(p)), `${s.id} names an unknown kind`);
  for (const kind of KINDS) assert.ok(k.some((s) => s.finding === 'none' && s.parts.length === 1 && s.parts[0] === kind), `no clean scenario holds ${kind}`);
  for (const f of ['mixed', 'historical-as-target', 'historical-as-evidence', 'retires-enduring', 'no-transition-evidence']) assert.ok(k.some((s) => s.finding === f), `no scenario holds ${f}`);
}
