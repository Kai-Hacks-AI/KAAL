// Case review/T26 tests: review/N4
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T26';
export const tests = ['review/N4'];
export const title = "the record says the reviewed work was changed nowhere and no Case or key was weakened, it approves nothing and it relies on no Skill of another capability";
export function run() {
  each((app) => {
    const n = section(app, 'No authority');
    assert.match(n, /changed nothing|no change/i);
    assert.doesNotMatch(app.review(), /kaal-testing|Testing's Skill/i, `${app.name}: the record relies on the Skill or package of Testing`);
    assert.doesNotMatch(app.review(), /^\s*(Verdict|Decision):\s*(approve|merge)/im);
  });
}
