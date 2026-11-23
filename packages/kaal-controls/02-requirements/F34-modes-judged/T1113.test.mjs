// Case controls/T1113 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const PKG = join(repo, 'packages/kaal-controls');
const S = join(PKG, 'skills/kaal-controls/scripts');
const judge = async (o) => { const f = join(S, 'judge-mode.mjs'); assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent'); const { judgeMode } = await import(pathToFileURL(f).href); return judgeMode(o); };

export const id = 'controls/T1113';
export const tests = ['controls/F34'];
export const title = 'a ratchet that cannot show or compare its reference is unknown and blocks, never a pass';
export async function run() {
  const none = await judge({ mode: 'ratchet', findings: [], baseline: [] });
  assert.deepEqual([none.verdict, none.blocked, none.reason], ['UNKNOWN', true, 'no-reference'], 'a missing reference passed');
  for (const bad of ['a', { a: 1 }, ['a', 'a'], ['a', 1], ['']]) {
    const r = await judge({ mode: 'ratchet', findings: ['a'], baseline: ['a'], previous: bad });
    assert.deepEqual([r.verdict, r.blocked, r.reason], ['UNKNOWN', true, 'incompatible-reference'], 'an incompatible reference ' + JSON.stringify(bad) + ' was judged');
  }
  const nb = await judge({ mode: 'ratchet', findings: ['a'], baseline: undefined, previous: ['a'] });
  assert.deepEqual([nb.verdict, nb.blocked, nb.reason], ['UNKNOWN', true, 'incompatible-reference'], 'a missing baseline passed');
  const nf = await judge({ mode: 'ratchet', findings: undefined, baseline: ['a'], previous: ['a'] });
  assert.deepEqual([nf.verdict, nf.blocked, nf.reason], ['UNKNOWN', true, 'could-not-judge'], 'a check that could not judge passed');
}
