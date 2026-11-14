// Case skills/T267 tests: skills/F7. A judgment Skill is activated by a pointer, not by a decision: the capability owns a situation and a reminder, the integrator owns the trigger.
import assert from 'node:assert/strict';
import { ARCH_DRAFT, PKG, archDraft, check, draft, passes, ROOT } from './lib.mjs';
import { join } from 'node:path';
export const id = 'skills/T267';
export const tests = ['skills/F7'];
export const title = 'a skill-level mechanism declares when an agent should consider it and a short reminder that names the Skill and its section and decides nothing; one without, with a reminder that points nowhere or is too long, or that claims a gate, is refused';
export async function run() {
  // Testing's assessment (on main) and Architecture's classification (a snapshot of its collector; the CPO's example, functional placement).
  const testing = await check(draft());
  assert.equal(testing.v.F7, 'PASS', `Testing's assessment must activate: ${JSON.stringify(testing.out.F7)}`);
  assert.ok(passes(testing.out, 'F7', 'assess-claim'));
  const arch = await check(archDraft(), { root: join(PKG, '..', '..') });
  assert.equal(arch.v.F5, 'PASS', `Architecture's classification must read as a judgment mechanism: ${JSON.stringify(arch.out.F5)}`);
  assert.equal(arch.v.F7, 'PASS', `Architecture's classification must activate: ${JSON.stringify(arch.out.F7)}`);
  assert.ok(passes(arch.out, 'F7', 'classify'));
  assert.ok(ARCH_DRAFT && ROOT);
  const mutants = {
    'no activation': (d) => { delete d.mechanisms[4].activation; },
    'no situation': (d) => { d.mechanisms[4].activation.when = ''; },
    'a reminder that does not name the Skill': (d) => { d.mechanisms[4].activation.reminder = 'Think carefully about tests before writing them.'; },
    'a reminder that does not point at the section': (d) => { d.mechanisms[4].activation.reminder = 'Read kaal-testing before you write a test.'; },
    'a reminder longer than 280 characters': (d) => { d.mechanisms[4].activation.reminder += ' kaal-testing'.repeat(40); },
    'a gate claimed by the activation': (d) => { d.mechanisms[4].activation.gate = 'block'; },
  };
  for (const [why, mutate] of Object.entries(mutants)) { const d = draft(); mutate(d); assert.equal((await check(d)).v.F7, 'FAIL', `an activation with ${why} must be refused`); }
}
