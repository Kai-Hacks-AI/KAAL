// Case engineering/T1560 tests: engineering/F98
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1560';
export const tests = ['engineering/F98'];
export const title = 'the definition holds exactly the seven TYPEs with their chapters, and DEFAULT is named invalid and is no TYPE';
export async function run() {
  const d = load();
  const by = Object.fromEntries(d.types.map((t) => [t.type, t]));
  assert.deepEqual(Object.keys(by).sort(), ['ACT', 'DO', 'HOTFIX', 'PLAN', 'PROMOTION', 'SYNC', 'WIRE']);
  for (const t of d.types) assert.ok(Array.isArray(t.chapters) && t.chapters.length > 0 && t.chapters.every((c) => typeof c === 'string' && c), `${t.type} has no chapters`);
  assert.deepEqual(by.WIRE.chapters, ['Source', 'Target', 'Verification']);
  for (const t of d.types.filter((x) => x.type !== 'WIRE')) assert.equal(t.chapters[0], 'Change', `${t.type} must open with Change`);
  assert.ok(d.invalid.includes('DEFAULT'), 'DEFAULT is not named invalid');
  assert.ok(!by.DEFAULT, 'DEFAULT is a TYPE');
}
