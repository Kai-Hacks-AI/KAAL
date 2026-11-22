// Case release/T1400 tests: release/C129
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const rec = new URL('../../04-controls/CTL34-verify-codeql/CTL34.md', import.meta.url);
export const id = 'release/T1400';
export const tests = ['release/C129'];
export const title = 'the control verify CodeQL is declared preventive for release/I68, with no ratchet strategy and no ratchet registration';
export async function run() {
  const t = readFileSync(rec, 'utf8'); const head = t.split('---')[1];
  assert.match(head, /^id: release\/CTL34$/m); assert.match(head, /^title: verify CodeQL$/m);
  assert.match(head, /^type: preventive$/m); assert.match(head, /^has: \[release\/I68\]$/m); assert.match(head, /^evidence: /m);
  assert.doesNotMatch(t, /strategy:|:ratchet|baseline-source/);
}
