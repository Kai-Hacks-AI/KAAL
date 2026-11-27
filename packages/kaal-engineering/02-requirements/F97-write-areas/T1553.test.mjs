// Case engineering/T1553 tests: engineering/F97
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1553';
export const tests = ['engineering/F97'];
export const title = 'the pull request types: PLAN, DO and ACT carry their own phase, SYNC nothing, PROMOTION all three, HOTFIX PLAN and DO, WIRE no package area (recognition and routes are in pull-request-types.json, C37)';
export async function run() {
  const areas = load();
  const by = Object.fromEntries(areas.pullRequests.map((p) => [p.type, p]));
  assert.deepEqual(Object.keys(by).sort(), ['ACT', 'DO', 'HOTFIX', 'PLAN', 'PROMOTION', 'SYNC', 'WIRE']);
  for (const p of ['PLAN', 'DO', 'ACT']) assert.deepEqual(by[p].may, [p], `${p} carries only its own phase`);
  assert.deepEqual(by.SYNC.may, [], 'a SYNC carries nothing of its own');
  assert.deepEqual([...by.PROMOTION.may].sort(), ['ACT', 'DO', 'PLAN'], 'a PROMOTION moves what was already judged');
  assert.deepEqual([...by.HOTFIX.may].sort(), ['DO', 'PLAN']);
  assert.deepEqual(by.WIRE.may, [], 'a WIRE carries no package area');
}
