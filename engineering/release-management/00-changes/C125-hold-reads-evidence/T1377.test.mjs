// Case release/T1377 tests: release/C125
import assert from 'node:assert/strict';
import { use } from './evidence-fixtures.mjs';
export const id = 'release/T1377';
export const tests = ['release/C125'];
export const title = 'judgeHold answers UNKNOWN, applying, and does not throw when a retro reflects something that is not a string (pilot case J2)';
export async function run() {
  const { judgeHold } = await use('judge-act.mjs');
  for (const reflects of [[1], [null], [undefined], [['x/C1']]]) {
    let r;
    assert.doesNotThrow(() => { r = judgeHold({ changes: [{ id: 'x/C1', applicable: [] }], retros: [{ reflects }], observed: {} }); }, `reflects ${JSON.stringify(reflects)}`);
    assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.applies, true);
  }
}
