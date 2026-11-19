// Case release/T653 tests: release/C45
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { REAL } from './fixtures.mjs';
export const id = 'release/T653';
export const tests = ['release/C45'];
export const title = 'the SYNC template says why a SYNC is allowed: two purposes with their own evidence, and never routine branch maintenance';
const MUST = ['for PROMOTION', 'to unblock development', 'promotion queue', 'one promotion at a time', 'concrete blocker', 'otherwise blocked', 'never routine branch maintenance'];
export async function run() {
  assert.ok(existsSync(REAL), 'sync.md is absent from 05-src/wiring/templates');
  const text = readFileSync(REAL, 'utf8');
  const reason = text.split(/^## Reason$/m)[1]?.split(/^## HOW TO WORK$/m)[0] ?? '';
  for (const word of MUST) assert.ok(reason.includes(word), `the Reason chapter does not say ${word}`);
}
