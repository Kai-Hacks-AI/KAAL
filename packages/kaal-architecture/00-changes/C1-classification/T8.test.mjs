// Case architecture/T8 tests: architecture/G2
import assert from 'node:assert/strict';
import { dir, judged, key, read, SKILL, trial } from './lib.mjs';
export const id = 'architecture/T8';
export const tests = ['architecture/G2'];
export const title = "gap architecture/G2 is closed: an independent Skill-only trial and a no-Skill baseline are recorded with provenance";
export function run() {
  const { meta } = trial('skill'); trial('baseline');
  for (const s of key()) assert.ok(meta.answers.some((a) => a.id === s.id), `the trial has no answer for ${s.id}`);
}
