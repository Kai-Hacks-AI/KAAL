// Case release/T131 tests: F15
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/promotion.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T131';
export const tests = ['release/F15'];
export const title = 'the promotion template has three chapters, Collector, Delivers and Order, each with a hint, and reuses no PLAN heading';
export function run() {
  const text = read(template, 'the promotion template');
  assert.deepEqual(headings(text), ['Collector', 'Delivers', 'Order']);
  const plan = headings(read(planTemplate, 'the PLAN template'));
  assert.ok(!headings(text).some((h) => plan.includes(h)), 'the promotion template reuses a PLAN heading');
  const hints = text.split(/^## .*$/m).slice(1).map((part) => /<!--[\s\S]*?-->/.test(part));
  assert.deepEqual(hints, [true, true, true], 'every chapter carries a hint');
}
