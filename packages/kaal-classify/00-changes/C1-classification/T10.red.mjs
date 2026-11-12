// Case classify/T10 tests: classify/G2
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-classify');
const read = (rel, what) => { const path = join(dir, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const KEY = '03-architecture/A1-classify-package/A3-scenarios/scenarios.json';
const TRIAL = '00-changes/C1-classification/trial/answers.json';
const SKILL = 'skills/kaal-classify/SKILL.md';
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
// The recorded answers of an agent that was given only the Skill, compared with the key, for the named scenarios.
function judged(ids) {
  const key = JSON.parse(read(KEY, 'the scenario key')).scenarios;
  const answers = JSON.parse(read(TRIAL, 'the recorded trial')).answers;
  for (const id of ids) {
    const k = key.find((s) => s.id === id); const a = answers.find((s) => s.id === id);
    assert.ok(k, `scenario ${id} is not in the key`); assert.ok(a, `the trial has no answer for ${id}`);
    assert.ok(same(a.parts, k.parts), `${id}: the agent named ${JSON.stringify(a.parts)}, the key says ${JSON.stringify(k.parts)}`);
    assert.equal(a.finding, k.finding, `${id}: the agent found ${a.finding}, the key says ${k.finding}`);
  }
}
export const id = 'classify/T10';
export const tests = ['classify/G2'];
export const title = "gap classify/G2 is closed: the Skill is present";
export function run() {
  read(SKILL, 'the Skill');
}
