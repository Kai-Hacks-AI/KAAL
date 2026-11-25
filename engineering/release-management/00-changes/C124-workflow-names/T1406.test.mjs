// Case release/T1406 tests: release/C124
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
export const id = 'release/T1406';
export const tests = ['release/C124'];
export const title = 'the control verify Workflow names is a preventive record with its Intent, declares the ratchet strategy with source, owner and exit, and declares no deadline and no ratchet station';
export async function run() {
  const t = readFileSync(new URL('../../04-controls/CTL36-verify-workflow-names/CTL36.md', import.meta.url), 'utf8');
  const head = t.split('---')[1];
  assert.match(head, /^id: release\/CTL36$/m); assert.match(head, /^title: verify Workflow names$/m);
  assert.match(head, /^type: preventive$/m); assert.match(head, /^has: \[release\/I70\]$/m);
  assert.match(head, /^strategy: ratchet$/m);
  for (const k of ['baseline-source', 'owner', 'exit', 'evidence']) assert.match(head, new RegExp(`^${k}: .+$`, 'm'));
  assert.doesNotMatch(head, /^stations:.*ratchet/m); assert.doesNotMatch(head, /deadline/i);
  assert.match(head, /baseline\.json$/m);
}
