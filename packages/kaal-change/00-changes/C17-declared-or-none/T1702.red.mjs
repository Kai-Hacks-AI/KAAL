// Case change/T1702 tests: change/G20
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
export const id = 'change/T1702';
export const tests = ['change/G20'];
export const closes = ['change/G20'];
export const title = 'the Record definition and the Skill reference say that an empty succeeds is an answer and an absent one is not, and the reference stays free of KAAL terms';
export function run() {
  const record = readFileSync(new URL('../../capability/Change-Record.md', import.meta.url), 'utf8');
  const skill = readFileSync(new URL('../../skills/kaal-change/references/succession.md', import.meta.url), 'utf8');
  for (const [name, text] of [['Change-Record.md', record], ['succession.md', skill]]) {
    assert.match(text, /succeeds: \[\]/, `${name} does not state the empty list`);
    assert.match(text, /none/i, `${name} does not say that the empty list means none`);
  }
  assert.match(record, /absent/i, 'the Record definition does not say that an absent succeeds is not an answer');
  for (const w of ['collector', 'promotion', 'KAAL', 'Release', 'Dispatcher'])
    assert.ok(!skill.includes(w), `the Skill reference names ${w}`);
}
test(id, () => run());
