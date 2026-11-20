// Case review/T295 tests: review/F26 (RED until review/C4 DO records an application that carries a subject)
import assert from 'node:assert/strict';
import { applications } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T295';
export const tests = ['review/F26', 'review/G5'];
export const title = 'a review that names the element it validates gives its id, one id without spaces, and its record names it';
export function run() {
  const apps = applications();
  const named = apps.filter((a) => 'subject' in a.subject);
  assert.ok(named.length > 0, 'no application names the element it validates');
  for (const app of named) {
    const s = app.subject.subject;
    assert.equal(typeof s, 'string', `${app.name}: subject is not a string`);
    assert.match(s, /^\S+$/, `${app.name}: subject is not one non-empty id without spaces`);
    assert.ok(app.review().includes(s), `${app.name}: the review record does not name the element ${s}`);
  }
}
