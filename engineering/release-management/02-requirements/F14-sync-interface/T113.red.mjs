// Case release/T113 tests: F14
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/sync.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T113';
export const tests = ['release/F14'];
export const title = 'the SYNC template reuses no heading of the PLAN, DO or ACT template, and has no Change chapter';
const others = ['Change', 'From', 'To', 'Because', 'Implement', 'Refactor', 'Records'];
export function run() {
  const own = headings(read(template, 'the SYNC template'));
  assert.ok(!own.some((h) => others.includes(h)), 'the SYNC template reuses a heading of another template');
}
