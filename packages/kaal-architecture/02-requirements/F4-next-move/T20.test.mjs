// Case architecture/T20 tests: architecture/F4
import assert from 'node:assert/strict';
import { read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T20';
export const tests = ['architecture/F4'];
export const title = "the Skill's report ends in a next move: keep, split or ask";
export function run() {
  const s = read(SKILL, 'the Skill');
  assert.match(s, /## What to report[\s\S]*The next move: keep, split or ask/);
}
