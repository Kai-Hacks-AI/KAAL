// Case release/T1378 tests: release/C125
import assert from 'node:assert/strict';
import { use } from './evidence-fixtures.mjs';
export const id = 'release/T1378';
export const tests = ['release/C125'];
export const title = 'the shape of the verdict is pinned: no applicable Case, an unobserved Case, an unknown acted and an unreadable carried Change are UNKNOWN and apply, and applies false appears only on a PASS (pilot case J3)';
export async function run() {
  const { judgeAct, judgeHold } = await use('judge-act.mjs');
  const { casesAreGreen } = await use('lib/cases-green.mjs');
  const answers = [
    casesAreGreen({ applicable: [], observed: {} }),
    casesAreGreen({ applicable: [{ id: 'x/T1' }], observed: {} }),
    judgeAct({ applicable: [{ id: 'x/T1' }], observed: { 'x/T1': 'GREEN' }, acted: undefined }),
    judgeHold({ changes: [{ id: '', applicable: [] }], retros: [], observed: {} }),
    judgeHold({ changes: null, retros: [], observed: {} }),
  ];
  for (const r of answers) { assert.equal(r.verdict, 'UNKNOWN'); assert.equal(r.applies, true); }
  const nothing = [judgeAct({ applicable: [], observed: {}, acted: false }), judgeHold({ changes: [{ id: 'x/C1', applicable: [] }], retros: [], observed: {} })];
  for (const r of nothing) { assert.equal(r.verdict, 'PASS'); assert.equal(r.applies, false); }
}
