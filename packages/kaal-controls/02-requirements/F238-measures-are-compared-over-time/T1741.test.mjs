// Case controls/T1741 tests: controls/F237, controls/F238
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/lib/measures.mjs');
export const id = 'controls/T1741';
export const tests = ['controls/F237', 'controls/F238'];
export const title = 'checkMeasures names the invalid ones and compareMeasures says unknown (never zero, better or worse) for a name missing on either side, incomparable, same, better, worse or changed per name, by the declared direction only, and throws on invalid input';
const m = (name, value, unit = 'calls', better) => ({ name, value, unit, ...(better ? { better } : {}) });
export async function run() {
  assert.ok(existsSync(FILE), 'scripts/lib/measures.mjs is absent');
  assert.doesNotMatch(readFileSync(FILE, 'utf8'), /^\s*import /m, 'the library imports something, so it is not pure');
  const { checkMeasures, compareMeasures } = await import(pathToFileURL(FILE).href);
  assert.deepEqual(checkMeasures([m('a', 1)]), { measures: [m('a', 1)], problems: [] });
  const checked = checkMeasures([m('a', 1), m('a', 2), { name: 'b', value: 'x', unit: 'u' }, 5]);
  assert.deepEqual(checked.measures, [m('a', 1)]);
  assert.deepEqual(checked.problems.map((p) => p.split(':')[0]), ['a', 'b', '3']);
  const cmp = compareMeasures(
    [m('down', 10, 'calls', 'lower'), m('up', 10, 'calls', 'lower'), m('eq', 5), m('gone', 1), m('unit', 1, 'ms'), m('free', 1), m('hi', 1, 'x', 'higher'), m('hi2', 3, 'x', 'higher')],
    [m('down', 4, 'calls', 'lower'), m('up', 12, 'calls', 'lower'), m('eq', 5), m('new', 2), m('unit', 1, 'calls'), m('free', 2), m('hi', 2, 'x', 'higher'), m('hi2', 1, 'x', 'higher')],
  );
  const by = Object.fromEntries(cmp.map((e) => [e.name, e]));
  assert.deepEqual(cmp.map((e) => e.name), [...cmp.map((e) => e.name)].sort(), 'sorted by name');
  assert.deepEqual([by.down.change, by.down.delta], ['better', -6]);
  assert.deepEqual([by.up.change, by.up.delta], ['worse', 2]);
  assert.equal(by.eq.change, 'same');
  assert.deepEqual([by.new.change, by.new.missing, by.new.before, by.new.delta], ['unknown', 'before', undefined, undefined], 'a measure missing before is unknown');
  assert.deepEqual([by.gone.change, by.gone.missing, by.gone.after, by.gone.delta], ['unknown', 'after', undefined, undefined], 'a measure missing after is unknown');
  const vanished = compareMeasures([m('calls', 10, 'calls', 'lower')], []);
  assert.deepEqual([vanished[0].change, vanished[0].delta], ['unknown', undefined], 'a lower-is-better measure that vanished is never read as zero or as better');
  const appeared = compareMeasures([], [m('calls', 10, 'calls', 'lower')]);
  assert.deepEqual([appeared[0].change, appeared[0].delta], ['unknown', undefined], 'a measure that appeared is never read as a regression from zero');
  assert.deepEqual(compareMeasures([], []), []);
  assert.deepEqual([by.unit.change, by.unit.delta], ['incomparable', undefined]);
  assert.equal(by.free.change, 'changed', 'no declared direction, no better or worse');
  assert.equal(by.hi.change, 'better'); assert.equal(by.hi2.change, 'worse');
  for (const [from, to] of [['lower', 'higher'], ['higher', 'lower'], ['lower', undefined], [undefined, 'lower']]) {
    const r = compareMeasures([m('d', 10, 'calls', from)], [m('d', 4, 'calls', to)])[0];
    assert.deepEqual([r.change, r.why, r.delta], ['incomparable', 'direction', undefined], `a direction changed from ${from} to ${to} is never judged by the newer direction`);
  }
  const unit = compareMeasures([m('u', 1, 'ms')], [m('u', 1, 'calls')])[0];
  assert.deepEqual([unit.change, unit.why], ['incomparable', 'unit']);
  assert.throws(() => compareMeasures([{ name: 'a' }], []), /measure/, 'invalid input is never compared');
  assert.throws(() => compareMeasures([], 'x'), /measure/);
}
