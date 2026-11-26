// Case architecture/T11 tests: architecture/F12
import assert from 'node:assert/strict';
import { arm, FIELDS, read, requests, SKILL } from './lib.mjs';
export const id = 'architecture/T11';
export const tests = ['architecture/F12'];
export const title = "an agent with the Skill and one without it were asked the same questions on all five requests, every answer is well formed, the outputs are unedited, and the comparison is left to the independent Review";
export function run() {
  const skill = arm('skill'); const base = arm('baseline');
  // Apart from the Skill, both arms were asked the same questions and given the same architecture boundary.
  assert.ok(skill.prompt.includes(read(SKILL, 'the Skill')), 'the skill prompt does not hold the Skill as shipped');
  const bare = skill.prompt.replace(/\nThe Skill you are given:\n\n---\n[\s\S]*?\n\nRequests:\n/, '\nRequests:\n');
  assert.equal(bare, base.prompt, 'the two arms were not asked the same questions');
  assert.ok(!base.prompt.includes('kaal-architecture'), 'the baseline prompt names the Skill');
  for (const [name, a] of [['skill', skill], ['baseline', base]]) {
    for (const r of requests()) {
      const x = a.meta.answers.find((y) => y.id === r.id);
      assert.ok(x, `${name}: no answer for ${r.id}`);
      for (const f of FIELDS) assert.ok(Array.isArray(x[f]) && x[f].every((s) => typeof s === 'string'), `${name}: ${r.id} ${f} is not a list of strings`);
    }
    assert.equal(a.meta.answers.length, 5, `${name}: the answers are not exactly five`);
  }
  // Nothing here claims fitness: the record leaves the comparison to the Review.
  const doc = read('00-changes/C2-realistic-trial/do.md', 'do.md');
  assert.ok(/Left to the independent Review/.test(doc), 'do.md does not leave the comparison to the independent Review');
}
