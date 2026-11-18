// Case release/T1141 tests: release/A64
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from './fixtures.mjs';
export const id = 'release/T1141';
export const tests = ['release/A64'];
export const title = "release/A64 addresses release/F69 and keeps the collector as data, equal to its draft";
export async function run() {
  const real = join(RM, '03-architecture/A64-verdict-from-evidence/A64.md');
  assert.ok(existsSync(real), 'A64.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, draft('A64.md') + '\n', 'A64.md differs from the draft');
  assert.match(t, /addresses: \[release\/F69\]/);
  assert.match(t, /nothing of the collector is imported or run/);
}
