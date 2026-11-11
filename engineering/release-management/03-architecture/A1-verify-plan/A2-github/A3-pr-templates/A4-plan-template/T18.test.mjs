// Case release/T18 tests: release/A4
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
export const id = 'release/T18';
export const tests = ['release/A4'];
export const title = 'the plan template carries headings for Change, Intent, Requirements, Architecture and Cases';
const template = join(dirname(fileURLToPath(import.meta.url)), '../../../../../../../.github/PULL_REQUEST_TEMPLATE/plan.md');
test(`${id} ${title}`, () => {
  const headings = readFileSync(template, 'utf8').split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
  assert.deepEqual(headings, ['Change', 'Intent', 'Requirements', 'Architecture', 'Cases']);
});
