// Case change/T1554 tests: change/G17
import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from './T1553.test.mjs';
export const id = 'change/T1554';
export const tests = ['change/G17'];
export const closes = ['change/G17'];
export const title = 'each type keeps the chapters of today in order, each with guidance';
const CHAPTERS = {
  PLAN: ['Change', 'From', 'To', 'Because'],
  DO: ['Change', 'Implement', 'Refactor'],
  ACT: ['Change', 'Records'],
  HOTFIX: ['Change', 'Defect', 'Urgency', 'Approach'],
};
export function run() {
  for (const t of load().types) {
    assert.deepEqual(t.chapters.map(c => c.name), CHAPTERS[t.type], t.type + ' chapters');
    for (const c of t.chapters) assert.ok(typeof c.guidance === 'string' && c.guidance.trim(), t.type + ' ' + c.name + ' has no guidance');
  }
}
test(id, () => run());
