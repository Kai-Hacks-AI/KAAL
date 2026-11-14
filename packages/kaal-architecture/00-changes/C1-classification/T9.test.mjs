// Case architecture/T9 tests: architecture/F4
// The contract is objective: what was asked, what was recorded and how it compares with the declared key.
// Agreement with the key is reported and kept visible, not required: the key is an author's judgment.
import assert from 'node:assert/strict';
import { key, read, SKILL, trial } from './lib.mjs';
export const id = 'architecture/T9';
export const tests = ['architecture/F4'];
export const title = "the next move is observable: both arms are asked for it, every answer is well formed, S4 and S5 record the declared next move, and every disagreement with the declared key is named";
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
// Every difference between a recorded arm and the declared key, as one line each.
export function disagreements(name, meta) {
  const out = [];
  for (const s of key()) {
    const a = meta.answers.find((x) => x.id === s.id);
    if (!same(a.parts, s.parts)) out.push(`T9 disagreement: ${name} ${s.id} parts ${JSON.stringify(a.parts)} (key ${JSON.stringify(s.parts)})`);
    if (a.finding !== s.finding) out.push(`T9 disagreement: ${name} ${s.id} finding ${a.finding} (key ${s.finding})`);
    if (a.next !== s.next) out.push(`T9 disagreement: ${name} ${s.id} next ${a.next} (key ${s.next})`);
  }
  return out;
}
export function run() {
  read('02-requirements/F4-next-move/F4.md', 'F4');
  const arms = {};
  for (const name of ['skill', 'baseline']) arms[name] = trial(`next/${name}`);
  // Both arms were asked the same questions: apart from the Skill, the prompts are the same.
  const skillText = read(SKILL, 'the Skill');
  assert.ok(arms.skill.prompt.includes(skillText), 'the next/skill prompt does not hold the Skill as shipped');
  assert.equal(arms.skill.prompt.replace(/\nThe Skill you are given:\n\n---\n[\s\S]*?\n\nStatements:\n/, '\nStatements:\n'), arms.baseline.prompt, 'the two arms were not asked the same questions');
  for (const name of Object.keys(arms)) {
    const { meta, prompt } = arms[name];
    assert.ok(/next move/i.test(prompt), `${name}: the prompt does not ask for the next move`);
    for (const s of key()) {
      const a = meta.answers.find((x) => x.id === s.id);
      assert.ok(a, `${name}: no answer for ${s.id}`);
      assert.ok(Array.isArray(a.parts) && a.parts.every((p) => ['solution', 'delivery'].includes(p)), `${name}: ${s.id} parts are not allowed values`);
      assert.ok(['none', 'mixed', 'ambiguous'].includes(a.finding), `${name}: ${s.id} finding is not an allowed value`);
      assert.ok(['keep', 'split', 'ask'].includes(a.next), `${name}: ${s.id} has no recorded next move`);
    }
    // The question the Owner asked: whether asking is chosen where the key declares it.
    for (const s of key().filter((x) => x.next === 'ask')) assert.equal(meta.answers.find((x) => x.id === s.id).next, 'ask', `${name}: ${s.id} did not record ask`);
  }
  // Every disagreement with the declared key is named in do.md, so that it stays visible to the Review and the Owner.
  const doc = read('00-changes/C1-classification/do.md', 'do.md');
  const found = Object.entries(arms).flatMap(([name, a]) => disagreements(name, a.meta));
  for (const line of found) assert.ok(doc.includes(line), `do.md does not name: ${line}`);
  for (const line of doc.split('\n').filter((l) => l.startsWith('T9 disagreement:'))) assert.ok(found.includes(line), `do.md names a disagreement the trial does not show: ${line}`);
}
