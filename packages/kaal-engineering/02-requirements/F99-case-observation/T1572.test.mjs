// Case engineering/T1572 tests: engineering/F99
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'engineering/T1572';
export const tests = ['engineering/F99'];
export const title = 'run-cases uploads artifact run-report; observe-cases uploads artifact observation holding observation.json, even when the run is red';
export async function run() {
  const y = load();
  const ups = y.match(/upload-artifact@[\s\S]*?(?=\n\s*- |\n\S|$)/g) ?? [];
  assert.equal(ups.length, 2, 'two uploads');
  assert.ok(ups.some((u) => /name:\s*run-report\b/.test(u)), 'artifact run-report');
  const obs = ups.find((u) => /name:\s*observation\b/.test(u));
  assert.ok(obs && /observation\.json/.test(obs), 'artifact observation holds observation.json');
  assert.ok(/if:\s*always\(\)/.test(y), 'the observation upload runs always');
}
