// Case release/T1139 tests: release/I51
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1139';
export const tests = ['release/I51'];
export const title = "release/I51 states that the verdict is judged from test evidence and never from the seat";
export async function run() {
  const real = join(RM, '01-intent/I51-dispatcher-verdict-per-collector/I51.md');
  assert.ok(existsSync(real), 'I51.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, draft('I51.md') + '\n', 'I51.md differs from the draft');
  assert.match(t, /everything except the evidence of its ACT is GREEN/);
  assert.match(t, /never depends on whether the seat is free/);
}
