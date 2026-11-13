// Case testing/T157 tests: testing/F130
import assert from 'node:assert/strict';
import { HEADING, skillParts } from './lib.mjs';
export const id = 'testing/T157';
export const tests = ['testing/F130'];
export const title = 'the Skill forbids an invented oracle and an autonomous rewrite, and keeps judgment apart from a passing test';
export function run() {
  const { section } = skillParts();
  assert.ok(section, `the Skill has no section "${HEADING}"`);
  const rules = {
    'never invent an oracle, a threshold or a key to obtain GREEN': /never invent an oracle[^.]*\bkey\b[^.]*GREEN/i,
    'a judgment is recorded as a judgement, never as a passing test': /a judgement, never as a passing test/i,
    'what cannot be proven is pointed at as judgement': /cannot be proven is pointed at as judgement/i,
    'a pushback is reported as unknown': /\bunknown\b/i,
    'Testing recommends and does not rewrite the owner\'s claim': /recommend[^.]*do not rewrite/i,
    'an author\'s key is that author\'s judgment, and a difference is recorded as both': /key is that author's judgment[^.]*record both/i,
    'every claim states why and what stays unresolved': /why[^.]*unresolved/i,
  };
  assert.doesNotMatch(section, /validation/i, 'the section does not use "validation", a KAAL convention that differs from IEEE 1012');
  for (const [rule, re] of Object.entries(rules)) assert.match(section, re, `the section does not state: ${rule}`);
}
