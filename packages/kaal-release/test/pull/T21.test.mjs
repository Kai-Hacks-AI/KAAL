// Case pull/T21 tests: pull/F23
import assert from 'node:assert/strict';
import { bad, collector, declaration, facts, green, lifecycle, ok, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T21';
export const tests = ['pull/F23'];
export const title = 'the qualifiers come out in the declared order and the first is named as the one that moves next; when none qualifies, every collector says why; the order is the declaration\'s and nothing else\'s';
export async function run() {
  const all = await walkCollectors(facts(), declaration());
  assert.deepEqual(all.qualifiers, ['col-a', 'col-b', 'col-c'], 'the qualifiers are not in the declared order');
  assert.equal(all.next.collector, 'col-a', 'the first qualifier is not named as next');

  // the order comes from the declaration, not from the facts or the names
  const reversed = await walkCollectors(facts(), declaration({ collectors: [{ name: 'col-c' }, { name: 'col-b' }, { name: 'col-a' }] }));
  assert.deepEqual(reversed.qualifiers, ['col-c', 'col-b', 'col-a'], 'the order is not the declaration\'s');
  assert.equal(reversed.next.collector, 'col-c');

  // a collector that fails is skipped; the next qualifier moves
  const skipped = await walkCollectors(facts({ collectors: [collector('col-a', [ok('build'), bad('suite')]), collector('col-b'), collector('col-c')] }), declaration());
  assert.deepEqual(skipped.qualifiers, ['col-b', 'col-c']);
  assert.equal(skipped.next.collector, 'col-b');

  // none qualifies: nothing is invented, each collector says why
  const none = await walkCollectors(facts({ pieces: lifecycle('col-a').filter((p) => p.type !== 'ACT') }), declaration());
  assert.deepEqual(none.qualifiers, []);
  assert.equal(none.next.collector, null, 'a next collector was named when none qualifies');
  assert.ok(none.next.reason && none.next.reason.length > 0, 'no reason is given when none qualifies');
  for (const c of none.collectors) assert.ok(c.missing.length > 0, `${c.name}: it does not qualify and says nothing about why`);
  void green; void ok;
}
