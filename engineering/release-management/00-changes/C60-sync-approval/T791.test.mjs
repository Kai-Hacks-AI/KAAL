// Case release/T791 tests: release/C60
import assert from 'node:assert/strict';
import { pureSync, load } from './fixtures.mjs';
export const id = 'release/T791';
export const tests = ['release/C60'];
export const title = 'approve Sync names the setting that is off when Actions may not approve, tells that refusal from every other failure, and writes what it did as the output approval';
const REFUSAL = 'gh api repos/o/r/pulls/7/reviews failed: gh: GitHub Actions is not permitted to approve pull requests. (HTTP 422)';
export async function run() {
  const { classifyRefusal } = await load('approve.mjs');
  assert.equal(typeof classifyRefusal, 'function', 'approve.mjs has no classifyRefusal');
  assert.equal(classifyRefusal(REFUSAL), 'actions-not-permitted');
  assert.equal(classifyRefusal('GITHUB ACTIONS IS NOT PERMITTED TO APPROVE PULL REQUESTS'), 'actions-not-permitted');
  for (const other of ['gh api x failed: Resource not accessible by integration (HTTP 403)', 'Can not approve your own pull request (HTTP 422)', 'Head sha can not be changed', '', undefined, null]) assert.equal(classifyRefusal(other), 'other', `${String(other)} is not the setting`);
  const { approve, verify } = await load('cli.mjs');
  const w = pureSync();
  try {
    assert.equal(verify(w.env(), w.deps()), 0);
    const verdict = w.outs.verdict;
    const live = (extra = {}) => w.env({ KAAL_VERDICT: verdict, KAAL_SYNC_APPROVE: 'on', ...extra });
    w.reset();
    assert.equal(approve(live(), w.deps()), 0);
    assert.equal(w.outs.approval, 'approved');
    assert.equal(w.posted(/pulls\/7\/reviews/).length, 1);
    w.reset();
    assert.equal(approve(w.env({ KAAL_VERDICT: verdict }), w.deps()), 0);
    assert.equal(w.outs.approval, 'would-approve');
    w.reset();
    assert.equal(approve(live({ KAAL_VERDICT: JSON.stringify({ control: 'verify Sync', outcome: 'FAIL', passes: false, reasons: [], analyzed: { head: w.head } }) }), w.deps()), 0);
    assert.equal(w.outs.approval, 'skipped');
    // the refusal: a named finding, exit 1, the output says so
    w.failOn(/-X POST.*pulls\/7\/reviews/, REFUSAL);
    w.reset();
    assert.equal(approve(live(), w.deps()), 1, 'a refused approval is red');
    assert.equal(w.outs.approval, 'refused');
    assert.equal(w.errors.length, 1);
    assert.ok(w.errors[0].startsWith('approve Sync: Actions may not approve'), w.errors[0]);
    assert.ok(w.errors[0].includes('Allow GitHub Actions to create and approve pull requests'), 'it names the setting');
    assert.ok(/organization/i.test(w.errors[0]), 'it names the other place it can be off');
    // any other failure of the call stays an unnamed failure and is not read as the setting
    w.failOn(/-X POST.*pulls\/7\/reviews/, 'gh api repos/o/r/pulls/7/reviews failed: Resource not accessible by integration (HTTP 403)');
    w.reset();
    assert.throws(() => approve(live(), w.deps()), /not accessible/);
    assert.notEqual(w.outs.approval, 'refused');
    assert.equal(w.errors.length, 0, 'no finding about the setting');
  } finally {
    w.done();
  }
}
