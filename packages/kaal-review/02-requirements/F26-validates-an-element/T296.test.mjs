// Case review/T296 tests: review/F26 (GREEN since review/C4 DO recorded an application with the focus control)
import assert from 'node:assert/strict';
import { applications, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T296';
export const tests = ['review/F26', 'review/G5'];
export const title = 'a review of a control, a focus Review does not define, carries its own reference and actual and names the element it validates';
export function run() {
  assert.ok(!('control' in FOCI), 'the focus control is defined by Review, so it would not carry its own reference and actual');
  const found = applications().filter((a) => a.subject.focus === 'control');
  assert.ok(found.length > 0, 'no application of the focus control exists');
  for (const app of found) {
    assert.ok(app.subject.reference.provided && app.subject.actual.provided, `${app.name}: the reference and actual of a control are not provided`);
    assert.ok(typeof app.subject.subject === 'string' && app.subject.subject.length > 0, `${app.name}: the review of a control does not name the element it validates`);
  }
}
