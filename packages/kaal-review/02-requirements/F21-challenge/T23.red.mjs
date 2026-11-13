// Case review/T23 tests: review/F21
import assert from 'node:assert/strict';
import { each, section, trial } from '../../00-changes/C1-skill-trial-review/lib.mjs';
export const id = 'review/T23';
export const tests = ['review/F21'];
export const title = "the record answers each question of its subject.json and says what the baseline comparison establishes and how independent the key is";
export function run() {
  each((app) => {
    const t = section(app, 'Findings') + section(app, 'Skill versus baseline');
    for (const q of app.subject.questions) assert.ok(t.includes(q), `${app.name}: the question is not answered: ${q}`);
    assert.match(section(app, 'Skill versus baseline'), /establishes/i);
    assert.match(t, /independen/i);
  });
}
