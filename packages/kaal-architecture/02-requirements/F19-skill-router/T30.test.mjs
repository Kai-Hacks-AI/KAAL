// Case architecture/T30 tests: architecture/F19
import assert from 'node:assert/strict';
import { read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T30';
export const tests = ['architecture/F19'];
export const title = 'SKILL.md is a router: the body, frontmatter not counted, is within the 200 words this Change targets and still states the target state of a plateau and the Solution and Delivery test';
export function run() {
  const skill = read(SKILL, 'the Skill');
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(skill);
  assert.ok(m, 'the Skill has no frontmatter');
  const body = skill.slice(m[0].length);
  const words = body.split(/\s+/).filter(Boolean).length;
  assert.ok(words <= 200, `the router body has ${words} words, more than the 200 this Change targets`);
  assert.match(body, /target state/i);
  assert.match(body, /plateau/i);
  assert.match(body, /Solution/);
  assert.match(body, /Delivery/);
}
