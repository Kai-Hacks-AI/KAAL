// Case release/T864 tests: release/CTL10
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const real = join(repo, 'engineering/release-management/04-controls/CTL10-approve-integration/CTL10.md');
export const id = 'release/T864';
export const tests = ['release/CTL10'];
export const title = 'release/CTL10 states the approval and the dismissal, the empty bypass list, the SYNC approvers, that nothing operates before the Owner loads it, and that the old ruleset keeps its other rules';
export async function run() {
  assert.ok(existsSync(real), 'CTL10.md is absent');
  const text = readFileSync(real, 'utf8').replace(/\s+/g, ' ');
  assert.match(text, /one approving review and dismisses an approval when a commit is pushed after it/, 'the approval and the dismissal are not stated');
  assert.match(text, /bypass list is empty/, 'the empty bypass list is not stated');
  assert.match(text, /bot of release\/CTL8/, 'the SYNC approvers are not stated');
  assert.match(text, /only once the Owner has loaded it/, 'the Owner boundary is not stated');
  assert.match(text, /after the sync bot's first live approval/, 'the timing is not stated');
  assert.match(text, /removed only after this one is proven equivalent, alone and never reducing protection/, 'the old ruleset step is not stated');
  assert.ok(!/^status:/m.test(readFileSync(real, 'utf8')), 'a status line is declared before the finder knows it');
}
