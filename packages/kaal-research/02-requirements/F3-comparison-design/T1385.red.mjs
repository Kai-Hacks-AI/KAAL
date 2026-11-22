// Case research/T1385 tests: research/F3
import assert from 'node:assert/strict';
import { GOOD, judged, problems, swap } from '../fixture.mjs';
export const id = 'research/T1385';
export const tests = ['research/F3'];
export const title = 'a rehearsal is well-formed only if it states a true untreated arm, the run count of every arm, what fresh meant, whether scoring was blind, and a key fixed before the treatment';
export async function run() {
  const refused = async (rule, text) => assert.ok(problems(await judged(text)).includes(rule), `${rule}: not refused`);
  await refused('Design:no-untreated-arm', swap('untreated: none', 'untreated: older'));
  await refused('Design:arms', swap('arms: none, guided', 'arms: guided'));
  await refused('Runs:untreated-arm-exposed', swap('- run: r1\n  arm: none\n  exposure: none', '- run: r1\n  arm: none\n  exposure: delivered'));
  await refused('Runs:treated-arm-unexposed', swap('- run: r4\n  arm: guided\n  exposure: opened\n  excerpt: evidence/r2.excerpt.txt', '- run: r4\n  arm: guided\n  exposure: none'));
  await refused('Design:n', swap('n: none=2, guided=2', 'n: none=2'));
  await refused('Design:n-unequal', swap('n: none=2, guided=2', 'n: none=3, guided=2'));
  await refused('Runs:runs-differ-from-n', swap('n: none=2, guided=2', 'n: none=2, guided=3'));
  assert.equal((await judged(swap('n: none=2, guided=2', 'n: none=2, guided=2\nn-note: x'))).result, 'well-formed', 'a stated, equal n with a note is refused');
  for (const k of ['fresh-means', 'model', 'settings']) await refused(`Design:${k}`, swap(new RegExp(`${k}: .*\\n`).exec(GOOD)[0], ''));
  await refused('Design:isolation-checked', swap('isolation-checked: yes\n', ''));
  await refused('Design:blind', swap('blind: yes\n', ''));
  await refused('Design:blind-how', swap(/blind-how: .*\n/.exec(GOOD)[0], ''));
  await refused('Design:key-after-treatment', swap('key-frozen: 2026-11-20T10:00:00Z', 'key-frozen: 2026-11-20T12:00:00Z'));
  await refused('Design:key-times', swap('key-frozen: 2026-11-20T10:00:00Z\n', ''));
  assert.equal((await judged(swap('blind: yes', 'blind: no').replace(/blind-how: .*\n/, ''))).result, 'well-formed', 'an honest unblinded inconclusive record is refused');
}
