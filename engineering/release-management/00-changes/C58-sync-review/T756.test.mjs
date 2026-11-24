// Case release/T756 tests: release/C58
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const MODULE = join(repo, 'engineering/release-management/05-src/sync-review/review.mjs');
export const id = 'release/T756';
export const tests = ['release/C58'];
export const title = 'review Sync puts a failing, unknown or missing verdict in front of a person once per head, does nothing for a pass, and never approves, merges or edits';
const H = 'c'.repeat(40);
const fail = { control: 'verify Sync', outcome: 'FAIL', passes: false, reasons: [{ code: 'merge-conflicts', detail: 'the merge of the parents conflicts' }, { code: 'no-reason', detail: 'the Reason chapter is empty' }], analyzed: { head: H } };
const none = { labelled: false, commentedHead: null, reviewRequested: false };
export async function run() {
  assert.ok(existsSync(MODULE), 'review.mjs is absent');
  const { decideReview } = await import(pathToFileURL(MODULE).href);
  const kinds = (r) => r.map((a) => a.action).sort();
  const failing = decideReview({ verdict: fail, currentHead: H, existing: none });
  assert.deepEqual(kinds(failing), ['comment', 'label', 'request-review']);
  const comment = failing.find((a) => a.action === 'comment');
  assert.ok(comment.body.includes(`<!-- review-sync:${H} -->`), 'the comment carries the head marker');
  assert.ok(comment.body.includes('merge-conflicts') && comment.body.includes('no-reason'), 'the comment names every failed condition');
  assert.equal(failing.find((a) => a.action === 'label').label, 'sync: needs review');
  assert.deepEqual(kinds(decideReview({ verdict: { ...fail, outcome: 'UNKNOWN', reasons: [] }, currentHead: H, existing: none })), ['comment', 'label', 'request-review'], 'UNKNOWN goes to a person');
  assert.deepEqual(kinds(decideReview({ verdict: undefined, currentHead: H, existing: none })), ['comment', 'label', 'request-review'], 'no verdict goes to a person');
  assert.deepEqual(decideReview({ verdict: fail, currentHead: H, existing: { labelled: true, commentedHead: H, reviewRequested: true } }), [], 'nothing is repeated for the same head');
  assert.deepEqual(kinds(decideReview({ verdict: fail, currentHead: H, existing: { labelled: true, commentedHead: 'e'.repeat(40), reviewRequested: true } })), ['comment'], 'a new head is explained again');
  const pass = { ...fail, outcome: 'PASS', passes: true, reasons: [] };
  assert.deepEqual(decideReview({ verdict: pass, currentHead: H, existing: none }), []);
  assert.deepEqual(kinds(decideReview({ verdict: pass, currentHead: H, existing: { labelled: true, commentedHead: null, reviewRequested: false } })), ['unlabel']);
  assert.deepEqual(kinds(decideReview({ verdict: { ...pass, analyzed: { head: '9'.repeat(40) } }, currentHead: H, existing: none })), ['comment', 'label', 'request-review'], 'a pass of another head is not a pass');
  const allowed = ['label', 'unlabel', 'comment', 'request-review'];
  for (const v of [fail, pass, undefined]) for (const a of decideReview({ verdict: v, currentHead: H, existing: none })) assert.ok(allowed.includes(a.action), `${a.action} is not an action of review Sync`);
}
