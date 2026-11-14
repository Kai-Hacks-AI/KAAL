// Shared by the Cases T10 and T11: reads the requests and the recorded trial of the realistic comparison.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const dir = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const read = (rel, what) => { const p = join(dir, rel); assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export const SKILL = 'skills/kaal-architecture/SKILL.md';
const C = '00-changes/C2-realistic-trial/';
export const sha = (s) => createHash('sha256').update(s).digest('hex');
export const requests = () => JSON.parse(read(`${C}requests.json`, 'the requests')).requests;
export const requestsSha = () => sha(read(`${C}requests.json`, 'the requests'));
export const TOPICS = ['agent hosting', 'Review installation', 'Pull Promotion', 'incident reporting', 'Testing and Review integration'];
export const FIELDS = ['solution', 'delivery', 'mixed', 'unresolved', 'change'];
// A recorded arm: who observed it, the requests it saw, the prompt, and the raw output unedited.
export function arm(name) {
  const meta = JSON.parse(read(`${C}trial/${name}.json`, `the ${name} record`));
  const prompt = read(`${C}trial/${name}.prompt.txt`, `the ${name} prompt`);
  const raw = read(`${C}trial/${name}.raw.txt`, `the ${name} raw output`);
  assert.equal(meta.promptSha256, sha(prompt), `${name}: the prompt is not the one recorded`);
  assert.equal(meta.requestsSha256, requestsSha(), `${name}: the requests changed after the run`);
  assert.ok(meta.observer && meta.observer !== meta.author, `${name}: the observer is the author or unnamed`);
  assert.ok(meta.agent && meta.model && meta.date, `${name}: agent, model or date is not recorded`);
  assert.deepEqual(JSON.parse(raw).answers, meta.answers, `${name}: the answers are not the raw output unedited`);
  return { meta, prompt };
}
