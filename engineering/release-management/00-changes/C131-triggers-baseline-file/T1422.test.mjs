// Case release/T1422 tests: release/C131
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const id = 'release/T1422';
export const tests = ['release/C131'];
export const title = 'the preventive control gate verify Triggers names its baseline file in baseline-source, the file exists, and strategy, owner and exit stay declared, with no deadline and no ratchet station';
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const rec = readFileSync(`${repo}/engineering/release-management/04-controls/CTL20-gate-verify-triggers/CTL20.md`, 'utf8').split('---')[1];
  assert.match(rec, /^type: preventive$/m); assert.match(rec, /^has: \[release\/I50\]$/m); assert.match(rec, /^strategy: ratchet$/m);
  const src = rec.match(/^baseline-source: (.+)$/m)?.[1];
  assert.ok(src && !/\s/.test(src), 'baseline-source is a path, not prose');
  assert.ok(existsSync(`${repo}/${src}`), 'the file named by baseline-source exists');
  for (const k of ['owner', 'exit']) assert.match(rec, new RegExp(`^${k}: .+$`, 'm'));
  assert.doesNotMatch(rec, /deadline/i); assert.doesNotMatch(rec, /^stations:.*ratchet/m);
}
