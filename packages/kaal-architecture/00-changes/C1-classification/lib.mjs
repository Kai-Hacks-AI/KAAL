// Shared by the Cases of this package: reads files and compares a recorded, Skill-only agent trial with the key.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const dir = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const read = (rel, what) => { const p = join(dir, rel); assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export const KEY = '00-changes/C1-classification/trial/key/scenarios.json';
export const SKILL = 'skills/kaal-architecture/SKILL.md';
const T = '00-changes/C1-classification/trial/';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
export const key = () => JSON.parse(read(KEY, 'the scenario key')).scenarios;
// A trial is valid only with provenance: who observed it, that its prompt holds the statements and nothing of the key,
// and that the recorded answers are the raw output unedited.
export function trial(name) {
  const meta = JSON.parse(read(`${T}${name}.json`, `the ${name} record`));
  const prompt = read(`${T}${name}.prompt.txt`, `the ${name} prompt`);
  const raw = read(`${T}${name}.raw.txt`, `the ${name} raw output`);
  assert.equal(meta.promptSha256, sha(prompt), `${name}: the prompt is not the one recorded`);
  assert.ok(meta.observer && meta.observer !== meta.author, `${name}: the observer is the author or unnamed`);
  assert.ok(meta.agent && meta.model && meta.date, `${name}: agent, model or date is not recorded`);
  assert.deepEqual(JSON.parse(raw).answers, meta.answers, `${name}: the answers are not the raw output unedited`);
  assert.ok(!prompt.includes('"finding"'), `${name}: the prompt carries the key`);
  for (const s of key()) assert.ok(prompt.includes(s.statement), `${name}: the prompt lacks ${s.id}`);
  return { meta, prompt };
}
export function judged(ids) {
  const { meta, prompt } = trial('skill');
  assert.ok(prompt.includes(read(SKILL, 'the Skill')), 'the prompt does not hold the Skill as shipped');
  for (const id of ids) {
    const k = key().find((s) => s.id === id); const a = meta.answers.find((s) => s.id === id);
    assert.ok(k && a, `scenario ${id} is missing from the key or the trial`);
    assert.ok(same(a.parts, k.parts), `${id}: the agent named ${JSON.stringify(a.parts)}, the key says ${JSON.stringify(k.parts)}`);
    assert.equal(a.finding, k.finding, `${id}: the agent found ${a.finding}, the key says ${k.finding}`);
  }
}
