// Case release/T792 tests: release/C60
import assert from 'node:assert/strict';
import { pureSync, load } from './fixtures.mjs';
export const id = 'release/T792';
export const tests = ['release/C60'];
export const title = 'review Sync puts a pure SYNC whose approval was refused in front of a person, once per head, and leaves it alone for any other approval outcome';
const H = 'c'.repeat(40);
const pass = { control: 'verify Sync', outcome: 'PASS', passes: true, reasons: [], analyzed: { head: H } };
export async function run() {
  const { decideReview } = await load('review.mjs');
  const none = { labelled: false, commentedHead: null, reviewRequested: false };
  const ask = (over = {}) => decideReview({ verdict: pass, currentHead: H, existing: none, approval: 'refused', ...over });
  const names = (r) => r.map((a) => a.action);
  assert.deepEqual(names(ask()), ['label', 'comment', 'request-review'], 'a refused approval of a pure SYNC is put in front of a person');
  const comment = ask().find((a) => a.action === 'comment');
  assert.ok(comment.body.includes(`<!-- review-sync:${H} -->`), 'one comment per head: the marker');
  assert.ok(/approval was refused/i.test(comment.body), 'the comment says the approval was refused');
  assert.deepEqual(names(ask({ existing: { labelled: true, commentedHead: H, reviewRequested: true } })), [], 'once per head');
  for (const approval of ['approved', 'would-approve', 'skipped', undefined, '']) assert.deepEqual(names(ask({ approval })), [], `approval ${String(approval)} needs no person`);
  assert.deepEqual(names(ask({ approval: 'approved', existing: { ...none, labelled: true } })), ['unlabel']);
  const failing = { control: 'verify Sync', outcome: 'FAIL', passes: false, reasons: [{ code: 'merge-conflicts', detail: 'd' }], analyzed: { head: H } };
  assert.deepEqual(names(ask({ verdict: failing, approval: undefined })), ['label', 'comment', 'request-review'], 'a verdict that is not a pass is unchanged');
  for (const a of ask()) assert.ok(['label', 'unlabel', 'comment', 'request-review'].includes(a.action), 'only the four actions');

  const { review, verify } = await load('cli.mjs');
  const w = pureSync();
  try {
    assert.equal(verify(w.env(), w.deps()), 0);
    const verdict = w.outs.verdict;
    w.reset();
    assert.equal(review(w.env({ KAAL_VERDICT: verdict, KAAL_APPROVAL: 'refused' }), w.deps()), 0);
    assert.equal(w.posted(/labels/).length, 1);
    assert.equal(w.posted(/issues\/7\/comments/).length, 1);
    assert.equal(w.posted(/requested_reviewers/).length, 1);
    w.reset();
    assert.equal(review(w.env({ KAAL_VERDICT: verdict, KAAL_APPROVAL: 'approved' }), w.deps()), 0);
    assert.equal(w.posted(/labels|comments|requested_reviewers/).length, 0, 'an approved SYNC is left alone');
    w.reset();
    assert.equal(review(w.env({ KAAL_VERDICT: verdict }), w.deps()), 0);
    assert.equal(w.posted(/labels|comments|requested_reviewers/).length, 0, 'no approval output is not a refusal');
  } finally {
    w.done();
  }
}
