// Case release/T1327 tests: release/F70
import assert from 'node:assert/strict';
import { decide, TEMPLATE_TEXT } from './tree-fixtures.mjs';
import { readBody } from './raise.mjs';
export const id = 'release/T1327';
export const tests = ['release/F70'];
export const title = 'the body of a PROMOTION has the three chapters of the source template, a line per carried Change, and the table of the template';
export async function run() {
  const d = await decide({}, { changes: [{ n: 2, name: 'first-thing' }, { n: 3, name: 'second-thing', doRecord: false }], retros: [{ n: 1, reflects: ['cap/C2', 'cap/C3'] }] });
  assert.equal(d.action, 'raise');
  assert.deepEqual([...d.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]), ['Change', 'Why now', 'HOW TO WORK']);
  const change = d.body.split('## Why now')[0];
  assert.match(change, /^cap\/C2 first-thing: PLAN, DO, ACT$/m);
  assert.match(change, /^cap\/C3 second-thing: PLAN, ACT$/m);
  assert.match(d.body.split('## Why now')[1].split('## HOW TO WORK')[0], /To be written by Promoting/, 'why now is Promoting\'s judgement');
  // The table is the template's: its header, its rule and one row per step, read from the template rather than written again here.
  const rows = (text) => text.split('\n').filter((l) => /^\|.*\|$/.test(l));
  const tpl = rows(TEMPLATE_TEXT.split('## HOW TO WORK')[1]);
  const got = rows(d.body.split('## HOW TO WORK')[1]);
  assert.equal(got.length, tpl.length);
  assert.equal(got[0], tpl[0]);
  assert.equal(got[1], tpl[1]);
  const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim());
  tpl.slice(2).forEach((row, i) => assert.deepEqual(cells(got[i + 2]).slice(0, 4), cells(row).slice(0, 4), `step ${i} keeps its who, action and status`));
  assert.match(cells(got[2])[4], /kaal\/cap\/small-thing/, 'step 0 names the source branch');
  assert.match(cells(got[2])[4], /#77/, 'step 0 names the merged ACT pull request');
  assert.ok(!got.some((l) => /^\| \d+ \| Dependency/.test(l)), 'the Dependency row is Promoting\'s to add');
  assert.equal(readBody(d.body).startsWith('## Change'), true, 'raise accepts the body of the Dispatcher\'s own making');
  assert.ok(readBody(d.body).includes('| --- |'), 'with its table');
  const noTemplate = await decide({ template: undefined });
  assert.equal(noTemplate.action, 'skip');
  assert.equal(noTemplate.reason, 'no-template');
}
