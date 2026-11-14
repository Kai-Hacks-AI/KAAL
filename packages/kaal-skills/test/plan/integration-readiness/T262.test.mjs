// Case skills/T262 tests: skills/F3. A check mechanism's result tells clear, report and unknown apart, and an undecidable input is never clear.
import assert from 'node:assert/strict';
import { EXIT_OUTCOME, HONEST_TOOL, OUTCOME, THREE, check, commandSubject, draft, passes, subject } from './lib.mjs';
export const id = 'skills/T262';
export const tests = ['skills/F3'];
export const title = 'a declared reading maps a check result to clear, report or unknown; unknown is never clear; every non-clear result carries a reason; a mechanism that reads everything as clear is refused';
export async function run() {
  const { out, v } = await check(draft());
  assert.notEqual(v.F3, 'FAIL', `Testing's checks must not fail: ${JSON.stringify(out.F3.filter((x) => x.status === 'FAIL'))}`);
  for (const name of ['duplicates', 'report']) assert.ok(passes(out, 'F3', name), `${name} reads clear, report and unknown, with reasons`);
  const accept = draft().mechanisms.find((m) => m.name === 'accept');
  assert.ok(accept && accept.outcome && !/passed/.test(accept.outcome.at), "Testing's accept is read by its findings, never by passed, which stays true with unknown findings present");
  const mutants = {
    'a value under two outcomes': (d) => { d.mechanisms[0].outcome.clear.push('unknown'); },
    'the undecidable value read as clear': (d) => { const o = d.mechanisms[0].outcome; o.unknown = []; o.clear.push('unknown'); },
    'no reason carried by a non-clear result': (d) => { d.mechanisms[1].reason = ['nothing[]']; },
  };
  for (const [why, mutate] of Object.entries(mutants)) { const d = draft(); mutate(d); assert.equal((await check(d)).v.F3, 'FAIL', `${why} must be refused`); }
  const yesman = subject({ module: `export const m = () => ({ result: 'clear', why: 'fine' });`, fixtures: THREE, mechanism: { outcome: OUTCOME, reason: ['why'] } });
  assert.equal((await check(yesman.declaration, yesman)).v.F3, 'FAIL', 'a mechanism that cannot tell an undecidable input from a clear one is refused');
  const tool = commandSubject({ tool: HONEST_TOOL, fixtures: THREE, mechanism: { outcome: EXIT_OUTCOME, reason: ['stdout.why'] } });
  assert.equal((await check(tool.declaration, tool)).v.F3, 'PASS', 'a command read by its exit status (0 clear, 1 report, 2 unknown) with a reason in its output conforms');
  const always0 = commandSubject({ tool: `process.stdout.write(JSON.stringify({ why: 'fine' }));\n`, fixtures: THREE, mechanism: { outcome: EXIT_OUTCOME, reason: ['stdout.why'] } });
  assert.equal((await check(always0.declaration, always0)).v.F3, 'FAIL', 'a command that exits 0 whatever it was given is refused');
}
