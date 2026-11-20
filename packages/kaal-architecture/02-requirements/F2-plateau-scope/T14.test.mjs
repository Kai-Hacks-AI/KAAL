// Case architecture/T14 tests: architecture/F2
import assert from 'node:assert/strict';
import { read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T14';
export const tests = ['architecture/F2'];
export const title = "the Skill scopes Architecture to the target state of a plateau and leaves transition and delivery of Changes to other capabilities";
export function run() {
  read('02-requirements/F2-plateau-scope/F2.md', 'F2');
  const skill = read(SKILL, 'the Skill');
  assert.match(skill, /plateau/i, 'the Skill never says plateau');
  assert.match(skill, /target state/i, 'the Skill never says target state');
  const hit = skill.split(/^---$/m).slice(2).join('---').match(/\b(migrat\w*|transition\w*|change management|change control|release|roll-?out|retire\w*)\b/i);
  assert.equal(hit, null, `the Skill speaks of ${hit && hit[0]}`);
}
