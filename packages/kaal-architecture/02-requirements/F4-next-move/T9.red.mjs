// Case architecture/T9 tests: architecture/F4
import assert from 'node:assert/strict';
import { key, read, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T9';
export const tests = ['architecture/F4'];
export const title = "a Skill-only agent asked for its next move records keep, split or ask for every statement, and a no-Skill baseline is recorded with the same question";
export function run() {
  read('02-requirements/F4-next-move/F4.md', 'F4');
  for (const name of ['next/skill', 'next/baseline']) {
    const { meta, prompt } = trial(name);
    assert.ok(/next move/i.test(prompt), `${name}: the prompt does not ask for the next move`);
    for (const s of key()) {
      const a = meta.answers.find((x) => x.id === s.id);
      assert.ok(a && ['keep', 'split', 'ask'].includes(a.next), `${name}: ${s.id} has no recorded next move`);
    }
  }
  const { meta } = trial('next/skill');
  for (const s of key()) {
    const a = meta.answers.find((x) => x.id === s.id);
    assert.equal(a.finding, s.finding, `${s.id}: the agent found ${a.finding}, the key says ${s.finding}`);
    assert.equal(a.next, s.next, `${s.id}: the agent's next move is ${a.next}, the key says ${s.next}`);
  }
}
