// Case change/T1703 tests: change/G17
import test from 'node:test';
import assert from 'node:assert/strict';
import * as hosting from '@kaihacksai/kaal-hosting';
import { load } from './T1553.test.mjs';
export const id = 'change/T1703';
export const tests = ['change/G17'];
export const closes = ['change/G17'];
export const title = 'HOTFIX keeps its envelope line as visible text, and Hosting renders every declared type';
const LINE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export function run() {
  const types = load().types;
  for (const t of types) {
    if (t.type === 'HOTFIX') assert.equal(t.visible, LINE, 'the HOTFIX envelope line is not kept unchanged');
    else assert.ok(!('visible' in t), t.type + ' declares visible text');
    assert.doesNotThrow(() => hosting.renderTemplate(t), t.type + ' is refused by the declaration format of Hosting');
  }
  const hotfix = types.find(t => t.type === 'HOTFIX');
  assert.ok(hosting.renderTemplate(hotfix).split('\n').includes(LINE), 'the envelope line is not plain text in the template');
}
test(id, () => run());
