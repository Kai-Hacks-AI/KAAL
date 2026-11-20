// Shared by the Cases of this package: reads files and compares a recorded, Skill-only agent trial with the key.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const dir = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const read = (rel, what) => { const p = join(dir, rel); assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export const KEY = '03-architecture/A24-transition-package/scenarios.json';
export const SKILL = 'skills/kaal-change/SKILL.md';
export const REF = 'skills/kaal-change/references/transition.md';
const T = '00-changes/C10-transition/trial/';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
export const FIELDS = ['current', 'intended', 'changes', 'superseded_and_protected', 'evidence'];
export const decompositions = () => JSON.parse(read(KEY, 'the scenario key')).decompositions;
export const key = () => JSON.parse(read(KEY, 'the scenario key')).scenarios;
// A trial is valid only with provenance: who observed it, that its prompt is the statements (and the Skill) and nothing else,
// and that the recorded answers are the raw output unedited.
export function trial(name) {
  const meta = JSON.parse(read(`${T}${name}.json`, `the ${name} record`));
  const prompt = read(`${T}${name}.prompt.txt`, `the ${name} prompt`);
  const raw = JSON.parse(read(`${T}${name}.raw.txt`, `the ${name} raw output`));
  assert.equal(meta.promptSha256, sha(prompt), `${name}: the prompt is not the one recorded`);
  assert.ok(meta.observer && meta.observer !== meta.author, `${name}: the observer is the author or unnamed`);
  assert.ok(meta.agent && meta.model && meta.date, `${name}: agent, model or date is not recorded`);
  assert.deepEqual(raw.answers, meta.answers, `${name}: the answers are not the raw output unedited`);
  assert.deepEqual(raw.decompositions, meta.decompositions, `${name}: the decompositions are not the raw output unedited`);
  assert.deepEqual(raw.explanation, meta.explanation, `${name}: the explanation is not the raw output unedited`);
  for (const f of FIELDS) assert.ok(String(meta.explanation?.[f] ?? '').trim(), `${name}: the explanation lacks ${f}`);
  for (const s of key()) assert.ok(prompt.includes(s.statement), `${name}: the prompt lacks ${s.id}`);
  for (const s of decompositions()) assert.ok(prompt.includes(s.statement), `${name}: the prompt lacks ${s.id}`);
  assert.ok(!prompt.includes('"finding"') && !prompt.includes('"parts"'), `${name}: the prompt carries the key`);
  return { meta, prompt };
}
export function judgedDecompositions() {
  const { meta } = trial('skill');
  for (const k of decompositions()) {
    const a = (meta.decompositions || []).find((x) => x.id === k.id);
    assert.ok(a, `${k.id} is missing from the trial`);
    assert.equal(a.changes, k.changes, `${k.id}: the agent counted ${a.changes} Change(s), the key says ${k.changes}`);
    if (k.changes > 1) assert.ok(String(a.boundaries || '').trim(), `${k.id}: the agent names no boundaries`);
  }
}
export function judged(ids) {
  const { meta, prompt } = trial('skill');
  const shipped = read(SKILL, 'the Skill'), reference = read(REF, 'the reference');
  assert.ok(prompt.includes(shipped) && prompt.includes(reference), 'the prompt does not hold the Skill and its reference as shipped');
  for (const id of ids) {
    const k = key().find((s) => s.id === id); const a = meta.answers.find((s) => s.id === id);
    assert.ok(k && a, `scenario ${id} is missing from the key or the trial`);
    assert.ok(same(a.parts, k.parts), `${id}: the agent named ${JSON.stringify(a.parts)}, the key says ${JSON.stringify(k.parts)}`);
    assert.equal(a.finding, k.finding, `${id}: the agent found ${a.finding}, the key says ${k.finding}`);
  }
}
