// Case release/T1156 tests: release/A65
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, SYNC, ev } from './fixtures.mjs';
export const id = 'release/T1156';
export const tests = ['release/A65'];
export const title = "the scan of the Dispatcher no longer runs on a schedule: only its manual start remains";
export async function run() {
  const code = text('05-src/wiring/workflows/dispatcher.yml').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  assert.ok(!/^\s*schedule:/m.test(code), 'no schedule');
  assert.match(code, /^\s+workflow_dispatch:/m);
  assert.ok(/^on:\n\s+workflow_dispatch:\n\npermissions/m.test(code), 'the trigger block is the draft');
}
