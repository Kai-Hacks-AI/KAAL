import { test } from 'node:test';
import assert from 'node:assert/strict';
test('parent asserts after children pass', async (t) => {
  await t.test('child one', () => {});
  await t.test('child two', () => {});
  assert.equal(1, 2);
});
test('parent ok with children', async (t) => { await t.test('c', () => {}); });
test('parent with failing child', async (t) => { await t.test('bad', () => assert.fail('x')); });
test('childless leaf', () => {});
