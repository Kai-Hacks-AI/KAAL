// Case change/T1131 tests: change/G16
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T1131';
export const tests = ['change/G16'];
export const closes = ['change/G16'];
export const title = "the guide asks how the result reaches those affected without prescribing steps";
const REF = new URL('../../skills/kaal-change/references/transition.md', import.meta.url);
const SKILL = new URL('../../skills/kaal-change/SKILL.md', import.meta.url);
const section = () => {
  assert.ok(existsSync(REF), 'the transition guide is absent');
  const t = readFileSync(REF, 'utf8');
  const i = t.indexOf('## Impact and adoption');
  assert.ok(i >= 0, 'the guide has no Impact and adoption section');
  const j = t.indexOf('\n## ', i + 3);
  return j < 0 ? t.slice(i) : t.slice(i, j);
};
export function run() {
  const s = section();
  for (const w of ["**How does the result reach those affected?**", "available", "integrated", "active", "coincide", "One step is a valid answer", "No sequence is prescribed"]) assert.ok(s.includes(w), 'missing: ' + w);
}
test(id, () => run());
