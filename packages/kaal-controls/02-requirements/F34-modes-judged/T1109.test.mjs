// Case controls/T1109 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const PKG = join(repo, 'packages/kaal-controls');
const S = join(PKG, 'skills/kaal-controls/scripts');
const judge = async (o) => { const f = join(S, 'judge-mode.mjs'); assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent'); const { judgeMode } = await import(pathToFileURL(f).href); return judgeMode(o); };

export const id = 'controls/T1109';
export const tests = ['controls/F34'];
export const title = 'a ratchet blocks what is new, passes what is known, only shrinks, and is spent when its baseline is empty';
export async function run() {
  const base = ['a', 'b'];
  const known = await judge({ mode: 'ratchet', findings: ['a'], baseline: base });
  assert.deepEqual([known.verdict, known.blocked], ['PASS', false], 'a known finding blocked');
  assert.deepEqual(known.known, ['a']);
  assert.deepEqual(known.resolved, ['b'], 'a finding no longer found was not listed as resolved');
  assert.equal(known.spent, false);
  const fresh = await judge({ mode: 'ratchet', findings: ['a', 'c'], baseline: base });
  assert.deepEqual([fresh.verdict, fresh.blocked], ['FAIL', true], 'a new finding did not block');
  assert.deepEqual(fresh.new, ['c'], 'the new finding was not named');
  const grew = await judge({ mode: 'ratchet', findings: [], baseline: ['a', 'b'], previous: ['a'] });
  assert.deepEqual([grew.verdict, grew.blocked, grew.reason], ['FAIL', true, 'baseline-grew'], 'a baseline that grew was accepted');
  const shrank = await judge({ mode: 'ratchet', findings: ['a'], baseline: ['a'], previous: ['a', 'b'] });
  assert.equal(shrank.verdict, 'PASS', 'a baseline that shrank was refused');
  const back = await judge({ mode: 'ratchet', findings: ['b'], baseline: ['a'], previous: ['a', 'b'] });
  assert.deepEqual([back.verdict, back.new], ['FAIL', ['b']], 'a resolved finding that came back did not block');
  const spent = await judge({ mode: 'ratchet', findings: [], baseline: [] });
  assert.deepEqual([spent.verdict, spent.spent, spent.next], ['PASS', true, 'preventive'], 'an empty baseline was not spent');
  assert.equal((await judge({ mode: 'ratchet', findings: ['z'], baseline: [] })).blocked, true, 'a spent ratchet did not block like preventive');
}
