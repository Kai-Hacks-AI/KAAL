// Case testing/T363 tests: testing/F138. Counts and the structural leaf rule.
import assert from 'node:assert/strict';
import { find, names, runFx, tail } from './lib.mjs';
export const id = 'testing/T363';
export const tests = ['testing/F138'];
export const title = 'the runner counts leaf tests as GREEN, RED or UNKNOWN: suites, passing parents and the file-level result are not counted, a failing parent is counted once as a parent';
export async function run() {
  const g = await runFx(['green']);
  assert.deepEqual(g.counts, { GREEN: 2, RED: 0, UNKNOWN: 0 }, 'a file of two passing tests counts two GREEN and nothing for the file itself');
  assert.equal(g.tests.length, 2);
  assert.ok(g.tests.every((t) => t.role === 'leaf' && t.actual === 'GREEN' && typeof t.id === 'string' && typeof t.file === 'string'));

  const m = await runFx(['mixed']);
  assert.deepEqual(m.counts, { GREEN: 1, RED: 2, UNKNOWN: 0 });
  assert.deepEqual(m.tests.map((t) => t.actual).sort(), ['GREEN', 'RED', 'RED']);

  const n = await runFx(['nested']);
  assert.deepEqual(n.counts, { GREEN: 3, RED: 2, UNKNOWN: 0 }, 'suites and the inner suite are not counted, only the five leaves');
  assert.equal(n.tests.length, 5);
  assert.ok(n.tests.every((t) => t.role === 'leaf'));

  const p = await runFx(['parent']);
  assert.deepEqual(p.counts, { GREEN: 4, RED: 2, UNKNOWN: 0 });
  const parents = p.tests.filter((t) => t.role === 'parent');
  assert.equal(parents.length, 1, 'only the parent whose own assertion failed is counted as a parent');
  assert.equal(tail(parents[0]), 'parent asserts after children pass');
  assert.equal(parents[0].actual, 'RED');
  assert.equal(find(p, 'parent', 'parent ok with children'), undefined, 'a passing parent is not counted');
  assert.equal(find(p, 'parent', 'parent with failing child'), undefined, 'a parent that fails only because a child failed is not counted again');
  assert.equal(find(p, 'parent', 'parent with failing child > bad').actual, 'RED', 'the failing child is');
  assert.equal(find(p, 'parent', 'childless leaf').role, 'leaf');

  const d = await runFx(['deep']);
  assert.deepEqual(d.counts, { GREEN: 5, RED: 1, UNKNOWN: 0 }, 'four nested describe levels and a three level test chain give only their leaves');
  assert.equal(d.tests.length, 6);
  assert.equal(find(d, 'deep', ['L1', 'L2', 'L3', 'L4', 'deep fails']).actual, 'RED');
  assert.equal(find(d, 'deep', ['P1', 'P2', 'P3', 'p-leaf']).actual, 'GREEN');

  const c = await runFx(['concurrent']);
  assert.deepEqual(c.counts, { GREEN: 3, RED: 0, UNKNOWN: 0 }, 'concurrent children report the same as sequential ones');
  assert.deepEqual(names(c), ['c > fast', 'c > slow', 'top']);
}
