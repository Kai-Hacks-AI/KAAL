// Case engineering/T1561 tests: engineering/F98
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1561';
export const tests = ['engineering/F98'];
export const title = 'content owners are as ruled: kaal-change for PLAN, DO, ACT and HOTFIX; kaal-release for SYNC, PROMOTION and WIRE';
export async function run() {
  const by = Object.fromEntries(load().types.map((t) => [t.type, t.owner]));
  for (const t of ['PLAN', 'DO', 'ACT', 'HOTFIX']) assert.equal(by[t], 'kaal-change', t);
  for (const t of ['SYNC', 'PROMOTION', 'WIRE']) assert.equal(by[t], 'kaal-release', t);
}
