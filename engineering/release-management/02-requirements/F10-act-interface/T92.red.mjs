// Case release/T92 tests: F10
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const act = join(repo, '.github/PULL_REQUEST_TEMPLATE/act.md');
const plan = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T92';
export const tests = ['release/F10'];
export const title = 'the ACT template has two chapters, Change and Records, is shorter than the PLAN template and names no obligation';
export function run() {
  const text = read(act, 'the ACT template');
  assert.deepEqual(headings(text), ['Change', 'Records']);
  assert.ok(text.length < read(plan, 'the PLAN template').length, 'the ACT template is not shorter than the PLAN template');
  assert.ok(!/\b(must|shall|mandatory|required|follow-up)\b/i.test(text), 'the ACT template names an obligation');
}
