// Case controls/T1117 tests: controls/F36
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const f = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs');

export const id = 'controls/T1117';
export const tests = ['controls/F36'];
export const title = 'the accepted baseline advances only after an accepted run, only shrinks across runs, and a rejected run advances nothing';
export async function run() {
  assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent');
  const { judgeMode } = await import(pathToFileURL(f).href);
  let accepted = ['a', 'b', 'c'];                       // adoption: the findings present, and the reference is that baseline itself
  const chain = [accepted];
  const runOnce = (findings, baseline) => judgeMode({ mode: 'ratchet', findings, baseline, previous: accepted });
  const accept = (what, r) => { assert.equal(r.verdict, 'PASS', what + ' was not accepted'); assert.deepEqual(r.next, r.next.filter((x) => accepted.includes(x)), what + ' advanced to a superset'); accepted = r.next; chain.push(accepted); };
  const reject = (what, r) => { assert.equal(r.blocked, true, what + ' was not rejected'); assert.equal('next' in r, false, what + ' carried a next baseline although it did not pass'); };

  accept('adoption', runOnce(['a', 'b', 'c'], ['a', 'b', 'c']));
  assert.deepEqual(accepted, ['a', 'b', 'c']);
  reject('a new finding', runOnce(['a', 'b', 'c', 'd'], ['a', 'b', 'c']));
  assert.deepEqual(accepted, ['a', 'b', 'c'], 'a rejected run advanced the accepted baseline');
  accept('an improvement', runOnce(['a', 'b'], ['a', 'b']));
  assert.deepEqual(accepted, ['a', 'b'], 'the accepted baseline did not advance after an improvement');
  reject('a stale allowance', runOnce(['a'], ['a', 'b']));
  reject('a returned finding', runOnce(['a', 'b', 'c'], ['a', 'b']));
  reject('its allowance put back', runOnce(['a', 'b', 'c'], ['a', 'b', 'c']));
  assert.deepEqual(accepted, ['a', 'b'], 'a rollback attempt changed the accepted baseline');
  reject('a missing reference', judgeMode({ mode: 'ratchet', findings: ['a'], baseline: ['a'] }));
  accept('a further improvement', runOnce(['a'], ['a']));
  const end = runOnce([], []);
  accept('the end', end);
  assert.deepEqual([end.spent, end.then], [true, 'preventive'], 'an empty accepted baseline was not spent');
  for (let i = 1; i < chain.length; i++) assert.ok(chain[i].every((x) => chain[i - 1].includes(x)), 'the accepted baseline grew between accepted runs');
  assert.deepEqual(accepted, []);
}
