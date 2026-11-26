// Case release/T1403 tests: release/C124
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { baselineFile, verdict } from './fixtures.mjs';
export const id = 'release/T1403';
export const tests = ['release/C124'];
export const title = 'with the five generic names allowed, the five of today pass, a sixth bare KAAL fails as new, a rename passes and shrinks the baseline, a baseline that grows fails, and a missing accepted baseline is UNKNOWN';
export async function run() {
  const five = JSON.parse(readFileSync(baselineFile, 'utf8'));
  assert.equal(five.length, 5);
  assert.ok(five.every((f) => f.endsWith(':generic-name')));
  const today = verdict({ findings: five, baseline: five, previous: five });
  assert.equal(today.verdict, 'PASS'); assert.equal(today.code, 0);
  const sixth = [...five, '.github/workflows/six.yml:generic-name'].sort();
  const added = verdict({ findings: sixth, baseline: five, previous: five });
  assert.equal(added.verdict, 'FAIL'); assert.deepEqual(added.new, ['.github/workflows/six.yml:generic-name']);
  const renamed = five.slice(1);
  const fixed = verdict({ findings: renamed, baseline: renamed, previous: five });
  assert.equal(fixed.verdict, 'PASS'); assert.deepEqual(fixed.next, renamed);
  const grew = verdict({ findings: five, baseline: five, previous: renamed });
  assert.equal(grew.verdict, 'FAIL'); assert.ok(grew.reasons.includes('baseline-grew'));
  const none = verdict({ findings: five, baseline: five });
  assert.equal(none.verdict, 'UNKNOWN'); assert.equal(none.code, 2);
}
