// Case controls/T11 tests: F12
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const dir = join(repo, 'engineering/controls');
const read = (rel, what) => { const path = join(dir, rel); assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const TYPES = ['directive', 'preventive', 'detective', 'corrective'];
const KEY = '03-architecture/A5-controls-incubation/A7-scenarios/scenarios.json';
const TRIAL = '00-changes/C7-controls-semantics/trial/answers.json';
const SKILL = '05-src/skill/SKILL.md';
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
// The recorded answers of an agent that was given only the Skill, compared with the key, for the named scenarios.
function judged(ids) {
  const key = JSON.parse(read(KEY, 'the scenario key')).scenarios;
  const answers = JSON.parse(read(TRIAL, 'the recorded trial')).answers;
  for (const id of ids) {
    const k = key.find((s) => s.id === id); const a = answers.find((s) => s.id === id);
    assert.ok(k, `scenario ${id} is not in the key`); assert.ok(a, `the trial has no answer for ${id}`);
    assert.ok(same(a.types, k.types), `${id}: the agent named ${JSON.stringify(a.types)}, the key says ${JSON.stringify(k.types)}`);
    assert.equal(a.claimSupported, k.claimSupported, `${id}: the agent judged the claim differently from the key`);
  }
}
export const id = 'controls/T11';
export const tests = ['controls/F12'];
export const title = "the agent rejects the claims the evidence does not support and the key says are unsupported";
export function run() {
  const key = JSON.parse(read(KEY, 'the scenario key')).scenarios;
  const claims = key.filter((s) => s.claimSupported === false);
  assert.ok(claims.length >= 3, 'the key has fewer than three unsupported claims');
  judged(claims.map((s) => s.id));
}
