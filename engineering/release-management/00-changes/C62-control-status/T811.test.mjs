// Case release/T811 tests: release/C62
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { finderPath, releaseDir } from './fixtures.mjs';
export const id = 'release/T811';
export const tests = ['release/C62'];
export const title = 'every release control is listed as valid with its declared status: CTL1 running, CTL2, CTL7, CTL8 and CTL9 implemented';
export async function run() {
  const out = JSON.parse(execFileSync(process.execPath, [finderPath, releaseDir], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'a release control was refused');
  const status = Object.fromEntries(out.controls.filter((c) => c.id.startsWith('release/')).map((c) => [c.id, c.status]));
  for (const [ctl, expected] of Object.entries({ 'release/CTL1': 'running', 'release/CTL2': 'implemented', 'release/CTL7': 'implemented', 'release/CTL8': 'implemented', 'release/CTL9': 'implemented' })) {
    assert.equal(status[ctl], expected, `${ctl} does not declare status ${expected}`);
  }
}
