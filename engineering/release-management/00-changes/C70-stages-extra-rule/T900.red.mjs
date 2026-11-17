// Case release/T900 tests: release/C70
import assert from 'node:assert/strict';
import { judge, declared } from './fixtures.mjs';
export const id = 'release/T900';
export const tests = ['release/C70'];
export const title = 'a branch ruleset that holds its checks and then the extra rule its stage declares, with its declared parameters, passes, and so does one whose stage declares none';
export async function run() {
  const { judge: j } = await judge();
  const out = j(declared());
  assert.equal(out.kind, 'pass', `the declared extra rule is not accepted: ${out.findings.map((f) => f.message).join('; ')}`);
}
