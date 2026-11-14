// Case skills/T263 tests: skills/F4. The rule is the capability's: the declared invocation alone, given each fixture, reaches three distinct outcomes.
import assert from 'node:assert/strict';
import { OUTCOME, check, draft, passes, subject } from './lib.mjs';
export const id = 'skills/T263';
export const tests = ['skills/F4'];
export const title = 'each check mechanism offers a clear, a report and an unknown fixture and the declared invocation reaches three distinct outcomes; a missing fixture is unknown, never a pass';
export async function run() {
  const { out } = await check(draft());
  for (const name of ['duplicates', 'report']) assert.ok(passes(out, 'F4', name), `${name}: its rule is told apart through the declared invocation alone`);
  const noUnknown = subject({ module: `export const m = (x) => ({ result: x === 'r' ? 'report' : 'clear', why: 'w' });`, fixtures: `export const m = { clear: { args: ['c'] }, report: { args: ['r'] } };\n`, mechanism: { outcome: OUTCOME, reason: ['why'] } });
  const r = await check(noUnknown.declaration, noUnknown);
  assert.equal(r.v.F4, 'UNKNOWN', 'a mechanism with no unknown fixture is unknown, not conforming');
  assert.notEqual(r.v.F4, 'PASS');
  const same = subject({ module: `export const m = () => ({ result: 'clear' });`, fixtures: `export const m = { clear: { args: [1] }, report: { args: [2] }, unknown: { args: [3] } };\n`, mechanism: { outcome: OUTCOME, reason: ['why'] } });
  assert.equal((await check(same.declaration, same)).v.F4, 'FAIL', 'three fixtures that read alike do not show a rule');
}
