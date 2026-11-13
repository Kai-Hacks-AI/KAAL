// Case coordination/T39 tests: F9 (acceptance on the real repository; run by hand, evidence in evidence/)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deliveryDir } from './fixtures.mjs';
export const id = 'coordination/T39';
export const tests = ['coordination/F9'];
export const title = 'the command run on the real repository printed one line per open piece with a disposition, exited 0, and the invocation, output and limitations are recorded';
export async function run() {
  const record = readFileSync(join(deliveryDir, 'evidence/live-run.md'), 'utf8');
  assert.match(record, /Exit code: 0/, 'the exit code is not recorded');
  assert.match(record, /Invocation:/, 'the invocation is not recorded');
  assert.match(record, /Limitations/i, 'the limitations are not recorded');
  const report = readFileSync(join(deliveryDir, 'evidence/live-report.txt'), 'utf8');
  const lines = report.split('\n').filter((l) => /^#\d+ /.test(l));
  assert.ok(lines.length > 0, 'the report names no piece');
  assert.ok(lines.every((l) => /\b(WORK|REVIEW|WAIT|UNKNOWN)\b/.test(l)), 'a line has no disposition');
}
