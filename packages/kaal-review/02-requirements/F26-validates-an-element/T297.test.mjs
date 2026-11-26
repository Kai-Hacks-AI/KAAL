// Case review/T297 tests: review/F26 (the contract of subject: one non-empty id without whitespace, optional, and valid values pass)
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applications, checkSubject } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T297';
export const tests = ['review/F26', 'review/G5'];
export const title = 'a malformed subject is rejected by the review, a well-formed one or none at all is accepted';
const side = (label) => ({ label, reads: `${label} as read`, items: ['x'], provided: true });
// Builds one application in a fresh root, as Review reads it, with the given subject field (absent when undefined).
function application(subject) {
  const root = mkdtempSync(join(tmpdir(), 'review-t297-'));
  const dir = join(root, 'a');
  mkdirSync(dir);
  const body = { focus: 'control', reference: side('what it declares'), actual: side('what it does'), inspected: ['x'], questions: ['q'] };
  if (subject !== undefined) body.subject = subject;
  writeFileSync(join(dir, 'subject.json'), JSON.stringify(body));
  return root;
}
const rejected = (v) => { const r = application(v); try { assert.throws(() => applications(r), undefined, `the subject ${JSON.stringify(v)} was accepted`); } finally { rmSync(r, { recursive: true, force: true }); } };
const accepted = (v) => { const r = application(v); try { assert.equal(applications(r).length, 1); } finally { rmSync(r, { recursive: true, force: true }); } };
export function run() {
  for (const bad of ['', ' ', 'a b', ' x', 'x ', 'a\tb', 'a\nb', 123, null, true, ['x'], { id: 'x' }]) {
    rejected(bad);
    assert.throws(() => checkSubject(bad), undefined, `checkSubject accepted ${JSON.stringify(bad)}`);
  }
  for (const good of ['release/CTL1', 'controls/C18', 'a', 'x:y.z-1']) {
    accepted(good);
    assert.equal(checkSubject(good), good);
  }
  accepted(undefined); // a review that names no element stays valid
}
