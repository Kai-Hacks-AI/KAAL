// Case review/T22 tests: review/F20
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T22';
export const tests = ['review/F20'];
export const title = "the record states its focus and names its reference and actual, and everything subject.json lists as inspected, by what was read";
export function run() {
  each((app) => {
    assert.ok(section(app, 'Focus').includes(app.subject.focus), `${app.name}: the record does not state its focus`);
    assert.ok(section(app, 'Reference').includes(app.subject.reference.reads), `${app.name}: the reference is not named`);
    assert.ok(section(app, 'Actual').includes(app.subject.actual.reads), `${app.name}: the actual is not named`);
    const e = section(app, 'Evidence');
    for (const p of app.subject.inspected) assert.ok(e.includes(p), `${app.name}: Evidence does not name ${p}`);
  });
}
