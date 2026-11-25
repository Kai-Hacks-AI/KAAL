// Case research/T1428 tests: research/F7
import assert from 'node:assert/strict';
import { GOOD, judged, load, problems, swap } from '../fixture.mjs';
export const id = 'research/T1428';
export const tests = ['research/F7'];
export const title = 'a record names its technique and version in the form name@n, records of different techniques and versions are all well-formed, and the finder lists the technique';
export async function run() {
  const refused = async (rule, text) => assert.ok(problems(await judged(text)).includes(rule), `${rule}: not refused`);
  for (const t of ['judged-trial@1', 'judged-trial@2', 'parallel-harness-runs@1', 'trial@12']) {
    const r = await judged(swap('technique: judged-trial@1', `technique: ${t}`));
    assert.equal(r.result, 'well-formed', `${t}: refused (${problems(r)})`);
  }
  await refused('front:technique', swap('technique: judged-trial@1\n', ''));
  for (const t of ['judged-trial', '@1', 'judged-trial@0', 'judged-trial@v2', 'judged-trial@1.5', 'Judged Trial@1', 'judged-trial@']) {
    await refused('front:technique', swap('technique: judged-trial@1', `technique: ${t}`));
  }
  const { findRehearsals } = await load('find-rehearsals.mjs');
  const r = findRehearsals([{ path: 'a/RH1.md', text: GOOD }, { path: 'a/RH2.md', text: swap('id: demo/RH1', 'id: demo/RH2').replace('judged-trial@1', 'parallel-harness-runs@3') }]);
  assert.deepEqual(r.rehearsals.map((x) => [x.id, x.technique]), [['demo/RH1', 'judged-trial@1'], ['demo/RH2', 'parallel-harness-runs@3']]);
}
