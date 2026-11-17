// Case release/T683 tests: release/C51
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { T281 } from './fixtures.mjs';
export const id = 'release/T683';
export const tests = ['release/C51'];
export const title = 'Case release/T281 of release/C27 judges the WIRE template as the four chapters Source, Target, Verification and HOW TO WORK and reads the draft of release/C51';
export async function run() {
  assert.ok(existsSync(T281), 'Case T281 is absent');
  const text = readFileSync(T281, 'utf8');
  assert.ok(text.includes("'Source|Target|Verification|HOW TO WORK'"), 'T281 does not expect the four chapters');
  assert.ok(text.includes('C51-wire-template/interface.md'), 'T281 does not read the draft of release/C51');
}
