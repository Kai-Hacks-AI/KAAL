// Case review/T24 tests: review/F22
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T24';
export const tests = ['review/F22'];
export const title = "each finding is marked Proven with its test evidence and result, Judged with why, or Testable, not tested, and the record runs no test";
export function run() {
  each((app) => {
    assert.match(section(app, 'Comparison'), /Proven/); assert.match(section(app, 'Comparison'), /Judged/); assert.match(section(app, 'Comparison'), /Testable, not tested/);
    for (const l of findings(app)) {
      assert.match(l, /Proven|Judged|Testable, not tested/, `${app.name}: a finding is not marked: ${l.slice(0, 60)}`);
      if (/Proven/.test(l)) assert.match(l, /\b(\w+\/)?T\d+\b|trial\/[\w.-]+\.json/, `${app.name}: a Proven finding cites no Case id or recorded trial: ${l.slice(0, 60)}`);
    }
    assert.ok(!/^## (Trial|Reviewer trial)/m.test(app.review()), `${app.name}: the record holds a trial of its own`);
  });
}
