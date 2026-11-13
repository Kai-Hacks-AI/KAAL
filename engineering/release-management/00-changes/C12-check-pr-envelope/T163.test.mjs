// Case release/T163 tests: G44
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const id = 'release/T163';
export const tests = ['release/G44'];
export const title = 'gap release/G44 is closed: F17 and the judge are present and the files carry the Envelope name';
export function run() {
  assert.ok(existsSync(join(cap, '02-requirements/F17-envelope-rules/F17.md')), 'F17 is absent');
  assert.ok(existsSync(join(cap, '05-src/plan-body/envelope.mjs')), 'the envelope judge is absent');
  assert.match(readFileSync(join(cap, '01-intent/I7-check-pr-envelope/I7.md'), 'utf8'), /check PR Envelope/, 'I7 does not carry the Envelope name');
}
