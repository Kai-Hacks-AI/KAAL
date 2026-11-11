// Case release/T99 tests: F11
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const doTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/do.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T99';
export const tests = ['release/F11'];
export const title = 'the DO template has three chapters, Change, Implement and Refactor, each with a hint, and reuses no PLAN heading';
export function run() {
  const text = read(doTemplate, 'the DO template');
  assert.deepEqual(headings(text), ['Change', 'Implement', 'Refactor']);
  const planHeadings = headings(read(planTemplate, 'the PLAN template'));
  assert.ok(!headings(text).some((h) => planHeadings.includes(h) && h !== 'Change'), 'the DO template reuses a PLAN heading');
  const hints = text.split(/^## .*$/m).slice(1).map((part) => /<!--[\s\S]*?-->/.test(part));
  assert.deepEqual(hints, [true, true, true], 'every chapter carries a hint');
  assert.ok(/no refactoring/i.test(text.split(/^## Refactor$/m)[1]), 'the Refactor hint does not allow saying that none is planned');
}
