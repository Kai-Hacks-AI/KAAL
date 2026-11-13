// Case classify/T6 tests: classify/G2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'classify/T6';
export const tests = ['classify/G2'];
export const title = "gap classify/G2 is closed: an independent Skill-only trial and a no-Skill baseline are recorded with provenance";
export function run() {
  const { meta } = trial('skill'); trial('baseline');
  for (const s of key()) assert.ok(meta.answers.some((a) => a.id === s.id), `the trial has no answer for ${s.id}`);
}
