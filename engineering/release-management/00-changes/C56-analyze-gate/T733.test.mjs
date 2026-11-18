// Case release/T733 tests: release/CTL5
import assert from 'node:assert/strict';
import { requiredChecks } from './fixtures.mjs';
export const id = 'release/T733';
export const tests = ['release/CTL5'];
export const title = 'the promoting ruleset source requires verify Stages (Promoting) and then analyze Vulnerabilities (Promoting), both from the same integration';
export async function run() {
  const checks = requiredChecks('promoting');
  assert.deepEqual(checks.map((c) => c.context), ['verify Stages (Promoting)', 'analyze Vulnerabilities (Promoting)']);
  assert.equal(new Set(checks.map((c) => c.integration_id)).size, 1, 'the checks come from different integrations');
  assert.equal(checks[1].integration_id, 15368);
}
