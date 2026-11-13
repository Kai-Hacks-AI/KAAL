// Case review/T22 tests: review/F20
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T22';
export const tests = ['review/F20'];
export const title = "the record names every thing its subject.json lists as inspected, and states what was checked for each finding";
export function run() {
  each((app) => {
    const s = section(app, 'Inspected');
    for (const p of app.subject.inspected) assert.ok(s.includes(p), `${app.name}: Inspected does not name ${p}`);
    const f = section(app, 'Findings').split('\n').filter((l) => /^\s*[-*] /.test(l));
    assert.ok(f.length > 0, `${app.name}: no findings are listed`);
    for (const l of f) assert.match(l, /Checked:|Inferred:/, `${app.name}: a finding states no evidence: ${l.slice(0, 60)}`);
  });
}
