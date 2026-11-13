// Case review/T26 tests: review/N4
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T26';
export const tests = ['review/N4'];
export const title = "the record says the subject was changed nowhere and no Case or key was weakened, and it approves nothing";
export function run() {
  each((app) => {
    const n = section(app, 'No authority');
    assert.match(n, /changed nothing|no change/i);
    assert.doesNotMatch(app.review(), /^\s*(Verdict|Decision):\s*(approve|merge)/im);
  });
}
