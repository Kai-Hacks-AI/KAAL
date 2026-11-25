// Case release/T1410 tests: release/C130
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const rec = (p) => readFileSync(new URL('../../04-controls/' + p, import.meta.url), 'utf8').split('---')[1];
export const id = 'release/T1410';
export const tests = ['release/C130'];
export const title = 'the preventive control gate verify Triggers declares the ratchet with source, owner and exit and no deadline and no ratchet station, and the check that reveals stays detective';
export async function run() {
  const gate = rec('CTL20-gate-verify-triggers/CTL20.md');
  assert.match(gate, /^id: release\/CTL20$/m); assert.match(gate, /^type: preventive$/m); assert.match(gate, /^has: \[release\/I50\]$/m);
  assert.match(gate, /^strategy: ratchet$/m);
  for (const k of ['baseline-source', 'owner', 'exit']) assert.match(gate, new RegExp(`^${k}: .+$`, 'm'));
  assert.doesNotMatch(gate, /deadline/i); assert.doesNotMatch(gate, /^stations:.*ratchet/m);
  const check = rec('CTL19-verify-triggers/CTL19.md');
  assert.match(check, /^id: release\/CTL19$/m); assert.match(check, /^type: detective$/m);
  assert.doesNotMatch(check, /strategy:|deadline/);
}
