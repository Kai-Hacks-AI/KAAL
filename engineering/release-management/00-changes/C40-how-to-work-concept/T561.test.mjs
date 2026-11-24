// Case release/T561 tests: C40 (the parts of the concept)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const file = join(repo, 'engineering/release-management/HOW-TO-WORK.md');
const read = () => { assert.ok(existsSync(file), 'HOW-TO-WORK.md is absent from engineering/release-management'); return readFileSync(file, 'utf8'); };
const draft = () => {
  const after = readFileSync(join(repo, 'engineering/release-management/00-changes/C40-how-to-work-concept/interface.md'), 'utf8').split(/^## Draft of HOW-TO-WORK\.md$/m)[1];
  const m = after?.match(/^````\n([\s\S]*?)\n````$/m);
  assert.ok(m, 'the fenced draft is absent');
  return `${m[1]}\n`;
};
export const id = 'release/T561';
export const tests = ['release/C40'];
export const title = 'the Definition equals its draft, names HOW without copying it, states TO and the four parts of WORK, prescribes no step for a type and does not know about the templates';
export function run() {
  const text = read();
  assert.equal(text, draft(), 'HOW-TO-WORK.md differs from the draft');
  assert.ok(text.includes('HOW ARE WE DOING?') && /first word/.test(text), 'HOW is not named as the first word of HOW ARE WE DOING?');
  assert.ok(!/Agents Review Each-other|Durable Observations|With Experience/.test(text), 'the Definition HOW ARE WE DOING? is copied');
  for (const k of ['**TO**', '**WORK**', '**Worker**', '**Owner**', '**Reviewer**', '**Knowledge**', 'engineering/VIVA-AQUA.md']) assert.ok(text.includes(k), `the Definition lacks ${k}`);
  assert.ok(!/^\d+\. /m.test(text) && !/\b(PLAN|DO|ACT|PROMOTION|HOTFIX|WIRE)\b.*\b(step|first|then)\b/.test(text), 'the Definition prescribes a step for a type of work');
  assert.ok(!/template|chapter|trailer/i.test(text), 'the concept knows about the templates');
}
