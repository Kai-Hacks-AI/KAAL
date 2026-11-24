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
export const title = 'a ratchet passes what is known, blocks what is new, and advances the baseline as findings are resolved';
export async function run() {
  const prev = ['a', 'b'];
  const known = await judge({ mode: 'ratchet', findings: ['a', 'b'], baseline: ['a', 'b'], previous: prev });
  assert.deepEqual([known.verdict, known.blocked], ['PASS', false], 'known findings blocked');
  assert.deepEqual(known.known, ['a', 'b']);
  assert.equal(known.spent, false);
  const fresh = await judge({ mode: 'ratchet', findings: ['a', 'b', 'c'], baseline: ['a', 'b'], previous: prev });
  assert.deepEqual([fresh.verdict, fresh.blocked], ['FAIL', true], 'a new finding did not block');
  assert.deepEqual(fresh.new, ['c'], 'the new finding was not named');
  const better = await judge({ mode: 'ratchet', findings: ['a'], baseline: ['a'], previous: prev });
  assert.deepEqual([better.verdict, better.blocked], ['PASS', false], 'legitimate progress was refused');
  assert.deepEqual(better.next, ['a'], 'the next baseline was not the reference without what was resolved');
  const last = await judge({ mode: 'ratchet', findings: [], baseline: [], previous: ['a'] });
  assert.deepEqual([last.verdict, last.spent, last.then], ['PASS', true, 'preventive'], 'an empty baseline was not spent');
  const sharp = await judge({ mode: 'ratchet', findings: ['z'], baseline: [], previous: [] });
  assert.equal(sharp.blocked, true, 'a spent ratchet did not block like preventive');
}
