// Case review/T22 tests: review/F20
import assert from 'node:assert/strict';
import { read, trial, REVIEW, section } from '../../00-changes/C1-architecture-classification-review/lib.mjs';
export const id = 'review/T22';
export const tests = ['review/F20'];
export const title = "the review names every thing inspected, by path and commit, and states what was checked for each finding";
export function run() {
  const s = section('Inspected');
  for (const p of ['skills/kaal-architecture/SKILL.md', 'scenarios.json', 'bfee577', 'bf42468', 'trial/run1', 'trial/run2', 'trial/skill.json', 'T3', 'I1']) assert.ok(s.includes(p), `Inspected does not name ${p}`);
  const f = section('Findings').split('\n').filter((l) => /^\s*[-*] /.test(l));
  assert.ok(f.length > 0, 'no findings are listed');
  for (const l of f) assert.match(l, /Checked:|Inferred:/, `a finding states no evidence: ${l.slice(0, 60)}`);
}
