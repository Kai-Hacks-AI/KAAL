// Case review/T23 tests: review/F21
import assert from 'node:assert/strict';
import { each, section, findings, FOCI } from '../../00-changes/C1-focused-review/lib.mjs';
export const id = 'review/T23';
export const tests = ['review/F21'];
export const title = "the record compares both ways, states what was checked for each finding and answers each question of its subject.json";
export function run() {
  each((app) => {
    const c = section(app, 'Comparison');
    assert.match(c, /promised.{0,40}not delivered|not delivered/i);
    assert.match(c, /delivered.{0,40}not promised|not promised/i);
    const f = c.split('\n').filter((l) => /^\s*[-*] /.test(l));
    assert.ok(f.length > 0, `${app.name}: no findings are listed`);
    for (const l of f) assert.match(l, /Checked:|Inferred:/, `${app.name}: a finding states no evidence: ${l.slice(0, 60)}`);
    const t = c + section(app, 'Evidence');
    for (const q of app.subject.questions) assert.ok(t.includes(q), `${app.name}: the question is not answered: ${q}`);
  });
}
