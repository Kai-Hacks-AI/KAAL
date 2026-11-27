// Case engineering/T1560 tests: engineering/F98
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1560';
export const tests = ['engineering/F98'];
export const title = 'the file holds exactly the seven TYPEs, each with an owner and no content, and DEFAULT is named invalid and is no TYPE';
export async function run() {
  const d = load();
  const by = Object.fromEntries(d.types.map((t) => [t.type, t]));
  assert.deepEqual(Object.keys(by).sort(), ['ACT', 'DO', 'HOTFIX', 'PLAN', 'PROMOTION', 'SYNC', 'WIRE']);
  for (const t of d.types) {
    assert.ok(typeof t.owner === 'string' && t.owner, `${t.type} has no owner`);
    for (const k of ['chapters']) assert.ok(!(k in t), `${t.type} carries ${k}, which its owner declares`);
  }
  assert.ok(d.invalid.includes('DEFAULT'), 'DEFAULT is not named invalid');
  assert.ok(!by.DEFAULT, 'DEFAULT is a TYPE');
}
