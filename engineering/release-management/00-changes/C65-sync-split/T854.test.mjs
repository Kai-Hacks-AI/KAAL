// Case release/T854 tests: release/C65
import assert from 'node:assert/strict';
import { pureSync, load } from './fixtures.mjs';
export const id = 'release/T854';
export const tests = ['release/C65'];
export const title = 'review Sync runs without reading any Git object of the candidate, keeps only plain text of the verdict, leaves a verdict of another head to its own run, and puts a pass whose base moved in front of a person';
export async function run() {
  const { cleanVerdict } = await load('review.mjs');
  assert.equal(typeof cleanVerdict, 'function', 'review.mjs has no cleanVerdict');
  const H = 'c'.repeat(40), T = 'a'.repeat(40);
  const dirty = { control: 'verify Sync', outcome: 'FAIL', passes: false, reasons: [{ code: 'merge-conflicts', detail: 'see [x](http://e.example) <b>@everyone</b> `rm -rf` ${x}' + 'y'.repeat(500) }, { code: 'c'.repeat(100), detail: 'd' }], analyzed: { head: H, base: { ref: 'kaal/x', tip: T } } };
  const c = cleanVerdict(dirty);
  for (const r of c.reasons) assert.ok(/^[A-Za-z0-9 .,'/*:()_-]*$/.test(r.code + r.detail), 'only plain characters survive');
  assert.ok(c.reasons[0].detail.length <= 200 && c.reasons[1].code.length <= 40, 'texts are cut');
  assert.ok(c.reasons.every((r) => !/[@<>\[\]`$]/.test(r.code + r.detail)), 'no markup, no mention, no link');
  assert.equal(c.reasons[0].code, 'merge-conflicts');
  assert.equal(cleanVerdict({ ...dirty, outcome: 'maybe' }).outcome, 'UNKNOWN', 'an outcome that is not one of three is UNKNOWN');
  assert.equal(cleanVerdict({ ...dirty, analyzed: { head: 'HEAD' } }).analyzed, null, 'a head that is not a commit name is dropped');
  assert.equal(cleanVerdict({ ...dirty, control: 'x' }), null);
  assert.equal(cleanVerdict('FAIL'), null);
  assert.equal(cleanVerdict({ ...dirty, reasons: Array.from({ length: 50 }, () => ({ code: 'x', detail: 'y' })) }).reasons.length, 20, 'at most twenty reasons');

  const { review, verify } = await load('cli.mjs');
  const w = pureSync();
  try {
    assert.equal(verify(w.env(), w.deps()), 0);
    const earlier = w.outs.verdict;
    const run = (extra = {}) => { w.reset(); return review(w.env({ KAAL_VERDICT: earlier, ...extra }), w.deps({ git: w.noGit })); };
    // a pass of this head and the live base: nothing to do, and nothing of the candidate was read
    assert.equal(run(), 0);
    assert.equal(w.posted(/labels|comments|requested_reviewers/).length, 0);
    // a verdict of another head: left to the run of that head, nothing posted
    w.state.head = 'f'.repeat(40);
    assert.equal(run(), 0);
    assert.ok(w.logs.some((l) => l.includes('another head')), w.logs.join(' | '));
    assert.equal(w.posted(/labels|comments|requested_reviewers/).length, 0);
    w.state.head = w.head;
    // a pass whose base moved: a person is asked, once, with the reason named
    w.state.baseTip = 'e'.repeat(40);
    assert.equal(run(), 0);
    assert.equal(w.posted(/labels/).length, 1);
    assert.equal(w.posted(/requested_reviewers/).length, 1);
    assert.ok(w.posted(/issues\/7\/comments/)[0].includes('base-moved'));
    w.state.baseTip = JSON.parse(earlier).analyzed.base.tip;
    // no verdict at all, or one that is not verify Sync's: a person is asked
    for (const none of ['', 'garbage', '{"control":"x"}']) {
      assert.equal(run({ KAAL_VERDICT: none }), 0);
      assert.equal(w.posted(/labels/).length, 1, `no usable verdict (${none}) needs a person`);
    }
    // the refusal of an approval still reaches a person on a pass of this head and base
    assert.equal(run({ KAAL_APPROVAL: 'refused' }), 0);
    assert.equal(w.posted(/requested_reviewers/).length, 1);
  } finally {
    w.done();
  }
}
