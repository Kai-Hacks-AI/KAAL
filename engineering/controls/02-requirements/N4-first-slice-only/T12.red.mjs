// Case controls/T12 tests: N4
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
export const id = 'controls/T12';
export const tests = ['controls/N4'];
export const title = "the Skill stays inside the first slice and sits only in Engineering";
export function run() {
  const skill = read(SKILL, 'the candidate Skill');
  for (const [re, what] of [[/\bPASS\b|\bFAIL\b|\bUNKNOWN\b/, 'a verdict contract'], [/\bguard\b.*\bfreeze\b|\bdrain\b/i, 'a naming-verb taxonomy'], [/\bDevelopment\b.*\bPublishing\b|\bIntegration IN\b/s, 'a placement scheme'], [/^##\s*\d+\./m, 'a numbered procedure'], [/github|workflow|ruleset|pull request/i, 'a technical realization']]) assert.ok(!re.test(skill), `the Skill prescribes ${what}`);
  assert.match(skill, /Testing/, 'the Skill does not cite Testing');
  for (const gone of ['packages/kaal-controls', '.claude/skills/kaal-controls', '.agents/skills/kaal-controls']) assert.ok(!existsSync(join(repo, gone)), `${gone} exists`);
}
