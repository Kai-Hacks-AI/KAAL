// Case release/T3 tests: release/F1
import assert from 'node:assert/strict';
import test from 'node:test';
import { judge } from '../../05-src/plan/judge.mjs';
export const id = 'release/T3';
export const tests = ['release/F1'];
export const title = 'a functional or nonfunctional Requirement that serves no Intent fails';
test(`${id} ${title}`, async () => {
  const result = await judge({ intents: [{ id: 'release/I1' }], requirements: [{ id: 'release/F9', kind: 'F', serves: [] }, { id: 'release/N9', kind: 'N', serves: [] }] });
  assert.equal(result.verdict, 'FAIL');
  assert.ok(['release/F9', 'release/N9'].every((rid) => result.findings.some((f) => f.rule === 'F1/2' && f.id === rid)));
  assert.ok(result.findings.every((f) => f.recovery));
});
