// Case skills/T264 tests: skills/F5. Judgment is declared as judgment: a Skill, a section, a result shape, and no pass/fail outcome.
import assert from 'node:assert/strict';
import { check, draft, passes } from './lib.mjs';
export const id = 'skills/T264';
export const tests = ['skills/F5'];
export const title = 'a skill-level mechanism names its Skill file, section and result shape and claims no outcome; one that claims an outcome, has no shape, or names a missing section is refused';
export async function run() {
  const { out, v } = await check(draft());
  assert.equal(v.F5, 'PASS', `Testing's assessment must read: ${JSON.stringify(out.F5)}`);
  assert.ok(passes(out, 'F5', 'assess-claim'));
  const mutants = {
    'a pass/fail outcome': (d) => { d.mechanisms[4].outcome = { at: 'x', clear: ['a'] }; },
    'no result shape': (d) => { delete d.mechanisms[4].shape; },
    'a section the Skill does not have': (d) => { d.mechanisms[4].section = 'No such section'; },
    'a Skill file that does not exist': (d) => { d.mechanisms[4].skill = 'skills/nope/SKILL.md'; },
  };
  for (const [why, mutate] of Object.entries(mutants)) { const d = draft(); mutate(d); assert.equal((await check(d)).v.F5, 'FAIL', `a judgment mechanism with ${why} must be refused`); }
}
