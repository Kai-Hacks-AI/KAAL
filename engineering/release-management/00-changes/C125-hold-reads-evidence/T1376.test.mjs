// Case release/T1376 tests: release/C125
import assert from 'node:assert/strict';
import { use } from './evidence-fixtures.mjs';
export const id = 'release/T1376';
export const tests = ['release/C125'];
export const title = 'judgeAct answers UNKNOWN, applying, when it is not known whether a retro reflects the Change: an acted that is undefined, null, a string or a number (pilot case J1)';
export async function run() {
  const { judgeAct } = await use('judge-act.mjs');
  for (const acted of [undefined, null, 'true', 1, 0, {}]) {
    const r = judgeAct({ applicable: [{ id: 'x/T1' }], observed: { 'x/T1': 'GREEN' }, acted });
    assert.equal(r.verdict, 'UNKNOWN', String(acted)); assert.equal(r.applies, true);
    assert.match(r.message, /not known whether a retro reflects the Change/);
  }
  assert.equal(judgeAct({ applicable: [{ id: 'x/T1' }], observed: { 'x/T1': 'GREEN' }, acted: true }).verdict, 'PASS');
}
