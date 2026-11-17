// Case release/T760 tests: release/C59
import assert from 'node:assert/strict';
import { judge, declared } from './fixtures.mjs';
export const id = 'release/T760';
export const tests = ['release/C59'];
export const title = 'a branch ruleset that requires its own verify Stages check and then the extra check its stage declares passes, and so does one whose stage declares none';
export async function run() {
  const { judge: j } = await judge();
  const out = j(declared());
  assert.equal(out.kind, 'pass', `the declared extra check is not accepted: ${out.findings.map((f) => f.message).join('; ')}`);
}
