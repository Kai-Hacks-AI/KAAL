// Case controls/T1508 tests: controls/F202
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
export const id = 'controls/T1508';
export const tests = ['controls/F202'];
export const title = 'the record of the trial is complete and the Skill passes it for Claude, Codex and Antigravity';
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export async function run() {
  const file = join(repo, 'packages/kaal-controls/00-changes/C140-skill-ratchet/trial/results.json');
  assert.ok(existsSync(file), 'trial/results.json is absent: the trial has not been run');
  const r = JSON.parse(readFileSync(file, 'utf8'));
  assert.ok(r.skill && r.skill.revision && r.judge && r.limits && Array.isArray(r.runs), 'the record lacks the Skill revision, the judge, the limits or the runs');
  const applies = { P1: ['R2', 'R3', 'R4', 'R5', 'R6'], P2: ['R3', 'R4', 'R5', 'R6'], P3: ['R2', 'R6'] };
  const sample = (agent, arm) => r.runs.filter((x) => x.agent === agent && x.arm === arm);
  for (const x of r.runs) {
    assert.ok(applies[x.prompt], `unknown prompt ${x.prompt}`);
    for (const [k, v] of Object.entries(x.scores || {})) assert.ok(applies[x.prompt].includes(k) && Number.isInteger(v) && v >= 0 && v <= 3, `bad score ${k}=${v} for ${x.prompt}`);
    for (const k of applies[x.prompt]) assert.ok(k in (x.scores || {}), `${x.agent} ${x.arm} ${x.prompt} lacks ${k}`);
  }
  const per = (runs, k) => { const v = runs.filter((x) => k in x.scores).map((x) => x.scores[k]); return v.length ? mean(v) : NaN; };
  for (const agent of ['claude', 'codex', 'antigravity']) {
    const s = sample(agent, 'skill'), b = sample(agent, 'blank');
    for (const prompt of Object.keys(applies)) for (const arm of [s, b]) assert.ok(arm.filter((x) => x.prompt === prompt).length >= 3, `${agent} has fewer than three runs of ${prompt} in an arm`);
    assert.ok(s.every((x) => x.opened === true), `${agent}: a skill run did not open SKILL.md`);
    for (const k of ['R2', 'R3', 'R4', 'R5']) assert.ok(per(s, k) >= 2, `${agent}: mean ${k} is below 2`);
    assert.equal(per(s, 'R6'), 3, `${agent}: mean R6 is not 3`);
    for (const k of ['R2', 'R3', 'R4', 'R5', 'R6']) assert.ok(per(s, k) >= per(b, k), `${agent}: the skill arm is below the blank arm on ${k}`);
  }
}
