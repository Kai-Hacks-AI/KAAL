// Case classify/T8 tests: classify/A3
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
export const id = 'classify/T8';
export const tests = ['classify/A3'];
export const title = "the key covers each valid kind alone, mixed statements, misplaced statements, a weakening, an ambiguity and a dependency";
export function run() {
  const key = JSON.parse(read(KEY, 'the scenario key')).scenarios;
  const PAIRS = ['solution/target', 'delivery/target', 'change/change', 'delivery/change', 'solution/change'];
  const FINDINGS = ['none', 'mixed', 'misplaced', 'weakens-solution', 'ambiguous', 'dependency'];
  assert.equal(new Set(key.map((s) => s.id)).size, key.length, 'scenario ids repeat');
  for (const s of key) {
    assert.ok(s.parts.every((p) => PAIRS.includes(p)), `${s.id} names a pair that is not a concern and semantics`);
    assert.ok(FINDINGS.includes(s.finding), `${s.id} has an unknown finding`);
  }
  for (const p of ['solution/target', 'delivery/target', 'change/change']) assert.ok(key.some((s) => s.finding === 'none' && s.parts.length === 1 && s.parts[0] === p), `no clean scenario holds ${p}`);
  assert.ok(key.filter((s) => ['mixed', 'misplaced', 'weakens-solution'].includes(s.finding)).length >= 4, 'fewer than four negative scenarios');
  for (const f of ['mixed', 'misplaced', 'weakens-solution', 'ambiguous', 'dependency']) assert.ok(key.some((s) => s.finding === f), `no scenario holds ${f}`);
  assert.ok(key.filter((s) => s.finding === 'mixed').every((s) => s.parts.length > 1), 'a mixed scenario names one pair');
}
