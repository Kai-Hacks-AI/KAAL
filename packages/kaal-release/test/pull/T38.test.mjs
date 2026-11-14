// Case pull/T38 tests: pull/F38
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T38';
export const tests = ['pull/F38'];
export const title = 'next is the one qualifier, or the highest value density of several with the same unit whatever the declared order, and nothing else in the report changes';

export async function run() {
  const fx = await import(pathToFileURL(join(repo, 'packages/kaal-release/test/pull/fixtures.mjs')).href);
  const col = (name, value, size, unit = 'Cases added') => ({ name, ...(value === undefined ? {} : { value }), ...(size === undefined ? {} : { size }), ...(unit === undefined ? {} : { unit }) });
  const walk = (cols) => fx.walkCollectors({ collectors: cols.map((c) => fx.good(c.name)) }, fx.declaration({ collectors: cols }));

  // Two qualifiers: 6/3 = 2 loses to 3/1 = 3, in either declared order.
  const two = await walk([col('col-a', 6, 3), col('col-b', 3, 1)]);
  assert.deepEqual(two.qualifiers, ['col-a', 'col-b'], 'both fixtures must qualify');
  assert.equal(two.next.collector, 'col-b', 'the higher value density was not named next');
  assert.equal((await walk([col('col-b', 3, 1), col('col-a', 6, 3)])).next.collector, 'col-b', 'the declared order decided next');
  assert.equal((await walk([col('col-a', 9, 3), col('col-b', 2, 1)])).next.collector, 'col-a', 'a larger density did not win');
  // Three qualifiers: the highest density.
  assert.equal((await walk([col('col-a', 5, 1), col('col-b', 9, 1), col('col-c', 7, 1)])).next.collector, 'col-b', 'the highest of three was not named next');
  // One qualifier, with or without the fields.
  assert.equal((await walk([col('col-a', 3, 1)])).next.collector, 'col-a', 'a single qualifier was not next');
  assert.equal((await walk([col('col-c', undefined, undefined, undefined)])).next.collector, 'col-c', 'a single qualifier without the fields was not next');
  // Nothing else changes: the same report without any field differs only in next.
  const none = await walk([col('col-a', undefined, undefined, undefined), col('col-b', undefined, undefined, undefined)]);
  const same = await walk([col('col-a', 6, 3), col('col-b', 3, 1)]);
  const { next: _a, ...withFields } = same;
  const { next: _b, ...without } = none;
  assert.deepEqual(withFields, without, 'the fields changed more than next');
  // No qualifier: unchanged.
  const empty = await fx.walkCollectors({ collectors: [] }, fx.declaration({ collectors: [col('col-a', 4, 1)] }));
  assert.equal(empty.next.collector, null, 'no qualifier named a next');
}
