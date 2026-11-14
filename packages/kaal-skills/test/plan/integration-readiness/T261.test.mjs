// Case skills/T261 tests: skills/F2. A script mechanism runs from its declaration with data only, and disturbs nothing.
import assert from 'node:assert/strict';
import { EXIT_OUTCOME, HONEST_TOOL, OUTCOME, THREE, check, commandSubject, draft, passes, subject } from './lib.mjs';
export const id = 'skills/T261';
export const tests = ['skills/F2'];
export const title = 'a script mechanism is called by its declared invocation with stdin closed and fixture data, returns data, and changes nothing in its package; one that throws or writes is refused';
export async function run() {
  const { out, v } = await check(draft());
  assert.notEqual(v.F2, 'FAIL', `Testing's mechanisms must not fail: ${JSON.stringify(out.F2.filter((x) => x.status === 'FAIL'))}`);
  for (const name of ['duplicates', 'report', 'inventory']) assert.ok(passes(out, 'F2', name), `${name} runs from its declaration`);
  const wrongExport = draft(); wrongExport.mechanisms[2].invoke.export = 'nope';
  assert.equal((await check(wrongExport)).v.F2, 'FAIL', 'a declared export that does not exist is refused');
  const thrower = subject({ module: `export const m = () => { throw new Error('boom'); };`, fixtures: THREE, mechanism: { outcome: OUTCOME, reason: ['why'] } });
  assert.equal((await check(thrower.declaration, thrower)).v.F2, 'FAIL', 'a mechanism that throws on a fixture is refused');
  const writer = subject({ module: `import { writeFileSync } from 'node:fs';\nexport const m = () => { writeFileSync(new URL('../scratch.txt', import.meta.url), 'x'); return { result: 'clear' }; };`, fixtures: THREE, mechanism: { outcome: OUTCOME, reason: ['why'] } });
  assert.equal((await check(writer.declaration, writer)).v.F2, 'FAIL', 'a mechanism that writes into its own package is refused');
  const tool = commandSubject({ tool: HONEST_TOOL, fixtures: THREE, mechanism: { outcome: EXIT_OUTCOME, reason: ['stdout.why'] } });
  assert.notEqual((await check(tool.declaration, tool)).v.F2, 'FAIL', 'a command is called with stdin closed and fixture arguments, and its exit status and output are its result');
  const dirty = commandSubject({ tool: `import { writeFileSync } from 'node:fs';\nwriteFileSync('scratch.txt', 'x');\n`, fixtures: THREE, mechanism: { outcome: EXIT_OUTCOME, reason: ['stdout.why'] } });
  assert.equal((await check(dirty.declaration, dirty)).v.F2, 'FAIL', 'a command that writes into its package is refused');
}
