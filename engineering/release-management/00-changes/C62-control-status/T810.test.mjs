// Case release/T810 tests: release/C62
import assert from 'node:assert/strict';
import { control, loadFinder } from './fixtures.mjs';
export const id = 'release/T810';
export const tests = ['release/C62'];
export const title = 'the finder lists a control with its status and rank, and keeps a control with a missing or unknown status listed with the problem named';
export async function run() {
  const { findControls } = await loadFinder();
  const ok = findControls([control({ status: 'running' })]);
  assert.deepEqual(ok.refused, [], 'a control with a status was refused');
  assert.deepEqual([ok.controls[0].status, ok.controls[0].rank, ok.controls[0].valid], ['running', 3, true]);
  for (const status of [undefined, 'done']) {
    const out = findControls([control({ status })]);
    assert.equal(out.controls.length, 1, `a control with status ${status} was dropped`);
    assert.equal(out.controls[0].valid, false);
    assert.equal(out.controls[0].problems[0].field, 'status');
  }
}
