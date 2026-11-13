// Case review/T24 tests: review/F22
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T24';
export const tests = ['review/F22'];
export const title = "each finding is marked Proven with its test evidence and result, Judged with why, or Testable, not tested, and the record runs no test";
export function run() {
  each((app) => {
    for (const l of findings(app)) {
      assert.match(l, /Proven|Judged|Testable, not tested/, `${app.name}: a finding is not marked: ${l.slice(0, 60)}`);
      if (/Proven/.test(l)) assert.match(l, /Case|trial|test/i, `${app.name}: a Proven finding cites no test evidence`);
    }
    assert.ok(!/^## (Trial|Reviewer trial)/m.test(app.review()), `${app.name}: the record holds a trial of its own`);
  });
}
