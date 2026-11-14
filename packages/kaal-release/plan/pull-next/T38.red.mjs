// Case pull/T38 tests: pull/F38
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T38';
export const tests = ['pull/F38'];
export const title = 'next is the one qualifier, or the highest-valued of several whatever the declared order, and nothing else in the report changes';

export async function run() {
  const fx = await import(pathToFileURL(join(repo, 'packages/kaal-release/test/pull/fixtures.mjs')).href);
  const names = ['col-a', 'col-b', 'col-c'];
  const collectors = (values) => names.map((name, i) => ({ name, ...(values[i] === undefined ? {} : { value: values[i] }) }));
  const walk = (cols, only = names) => fx.walkCollectors({ collectors: only.map((n) => fx.good(n)) }, fx.declaration({ collectors: cols.filter((c) => only.includes(c.name)) }));

  // Two qualifiers: the higher value is next, in either declared order.
  const two = await walk(collectors([1, 2]), ['col-a', 'col-b']);
  assert.deepEqual(two.qualifiers, ['col-a', 'col-b'], 'both fixtures must qualify');
  assert.equal(two.next.collector, 'col-b', 'the higher value was not named next');
  const swapped = await walk([...collectors([1, 2])].reverse(), ['col-a', 'col-b']);
  assert.equal(swapped.next.collector, 'col-b', 'the declared order decided next');
  // Three qualifiers: the highest.
  assert.equal((await walk(collectors([5, 9, 7]))).next.collector, 'col-b', 'the highest of three was not named next');
  // One qualifier, with or without a value.
  assert.equal((await walk(collectors([3, 4]), ['col-a'])).next.collector, 'col-a', 'a single qualifier was not next');
  assert.equal((await walk(collectors([]), ['col-c'])).next.collector, 'col-c', 'a single qualifier without a value was not next');
  // With a size the rank is value / size: 6/3 = 2 loses to 3/1 = 3, and the order of the list does not matter.
  const sized = (a, b) => [{ name: 'col-a', ...a }, { name: 'col-b', ...b }];
  assert.equal((await walk(sized({ value: 6, size: 3 }, { value: 3, size: 1 }), ['col-a', 'col-b'])).next.collector, 'col-b', 'the rank was not value over size');
  assert.equal((await walk(sized({ value: 9, size: 3 }, { value: 2, size: 1 }), ['col-a', 'col-b'])).next.collector, 'col-a', 'a larger ratio did not win');
  // Nothing else changes: the same report without any value differs only in next.
  const none = await walk(collectors([]), ['col-a', 'col-b']);
  const { next: _a, ...withValues } = two;
  const { next: _b, ...without } = none;
  assert.deepEqual(withValues, without, 'a value changed more than next');
  // No qualifier: unchanged.
  const empty = await fx.walkCollectors({ collectors: [] }, fx.declaration({ collectors: collectors([4]).slice(0, 1) }));
  assert.equal(empty.next.collector, null, 'no qualifier named a next');
}
