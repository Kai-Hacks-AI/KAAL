// Case skills/T267 tests: skills/F7. A judgment Skill is activated by an invocable mechanism the capability owns: an integrator calls it and receives a short, actionable reminder, and copies none of the capability's rules.
import assert from 'node:assert/strict';
import { ARCH_FIXTURES, GOOD_REMIND, ROOT, archDraft, check, draft, judgmentSubject, passes } from './lib.mjs';
export const id = 'skills/T267';
export const tests = ['skills/F7'];
export const title = 'a skill-level mechanism names a declared remind mechanism; invoking it returns a reminder naming the Skill and the section within 280 characters; a reminder held as declaration data, an undeclared or wrong-kind mechanism, a reminder that points nowhere, and one that gates are refused; no activation is unknown';
export async function run() {
  // Architecture's classification (the CPO's example, functional placement; a snapshot of its collector) with the mechanism Architecture would own.
  const arch = await check(archDraft(), { root: ROOT, fixtures: ARCH_FIXTURES });
  assert.equal(arch.v.F2, 'PASS', `the remind mechanism is called by its declaration alone: ${JSON.stringify(arch.out.F2)}`);
  assert.equal(arch.v.F5, 'PASS', `Architecture's classification reads as a judgment mechanism: ${JSON.stringify(arch.out.F5)}`);
  assert.equal(arch.v.F7, 'PASS', `the integrator receives the reminder: ${JSON.stringify(arch.out.F7)}`);
  assert.ok(passes(arch.out, 'F7', 'classify'));
  assert.ok(!JSON.stringify(archDraft()).includes('reminder'), 'the declaration holds the situation and the name of the mechanism, never the reminder: one source, the capability\'s own mechanism');
  // A capability that has declared no activation is unknown, never conforming (Testing, today).
  const testing = await check(draft());
  assert.equal(testing.v.F7, 'UNKNOWN', 'no activation declared is unknown');
  const mutants = {
    'a static reminder in the declaration': (d) => { d.mechanisms[0].activation.reminder = 'Read kaal-architecture, The test.'; },
    'a mechanism that is not declared': (d) => { d.mechanisms[0].activation.invoke = 'nope'; },
    'a mechanism that is not a remind': (d) => { d.mechanisms[1].kind = 'measure'; },
    'a remind mechanism that claims an outcome': (d) => { d.mechanisms[1].outcome = { at: 'exit', clear: [0] }; },
    'no situation': (d) => { d.mechanisms[0].activation.when = ''; },
    'a gate claimed by the activation': (d) => { d.mechanisms[0].activation.gate = 'block'; },
  };
  for (const [why, mutate] of Object.entries(mutants)) { const d = archDraft(); mutate(d); assert.equal((await check(d, { root: ROOT, fixtures: ARCH_FIXTURES })).v.F7, 'FAIL', `an activation with ${why} must be refused`); }
  // The mechanism's own behaviour, on throwaway Skills.
  const good = judgmentSubject({ remind: GOOD_REMIND });
  assert.equal((await check(good.declaration, good)).v.F7, 'PASS', 'a short reminder naming the Skill and the section conforms');
  const behaviours = {
    'a reminder that does not name the Skill': `process.stdout.write(JSON.stringify({ reminder: "Read the section 'The section' first." }));\n`,
    'a reminder that does not point at the section': `process.stdout.write(JSON.stringify({ reminder: 'Read x-skill first.' }));\n`,
    'a reminder longer than 280 characters': `process.stdout.write(JSON.stringify({ reminder: "Read x-skill, 'The section'. " + 'x'.repeat(300) }));\n`,
    'no reminder at all': `process.stdout.write(JSON.stringify({}));\n`,
    'a mechanism that writes into its package': `import { writeFileSync } from 'node:fs';\nwriteFileSync('scratch.txt', 'x');\n`,
  };
  for (const [why, remind] of Object.entries(behaviours)) { const s = judgmentSubject({ remind }); assert.equal((await check(s.declaration, s)).v.F7, 'FAIL', `a remind mechanism with ${why} must be refused`); }
}
