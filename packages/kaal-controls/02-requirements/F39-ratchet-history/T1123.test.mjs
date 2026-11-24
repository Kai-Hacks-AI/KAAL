// Case controls/T1123 tests: controls/F39
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const H = [{ at: '2026-11-20T08:00Z', change: 'demo/C1', from: null, to: 2, removed: [] }, { at: '2026-11-24T09:00Z', change: 'demo/C9', from: 2, to: 1, removed: ['b'] }, { at: '2026-11-25T09:00Z', change: 'demo/C10', from: 1, to: 0, removed: ['a'] }];
const ok = () => ({ base: { baseline: [], history: H }, head: { history: H } });
export const id = 'controls/T1123';
export const tests = ['controls/F39'];
export const title = 'the history of a completed ratchet is kept when the ratchet ends';
export async function run() {
  const lib = join(S, 'ratchet.mjs');
  assert.ok(existsSync(lib), 'scripts/ratchet.mjs is absent');
  const { judgeRetirement } = await import(pathToFileURL(lib).href);
  assert.equal(judgeRetirement(ok()).verdict, 'PASS', 'a retirement that keeps the history was refused');
  const c = (mut) => { const x = ok(); mut(x); return judgeRetirement(x); };
  const fails = [
    ['retired-early', (x) => { x.base.baseline = ['a']; }],
    ['history-removed', (x) => { x.head.history = undefined; }],
    ['history-removed', (x) => { x.head.history = H.slice(0, 2); }],
    ['history-removed', (x) => { x.head.history = [{ ...H[0], to: 9 }, H[1], H[2]]; }],
    ['history-incomplete', (x) => { x.base.history = H.slice(0, 2); x.head.history = H.slice(0, 2); }],
  ];
  for (const [reason, mut] of fails) { const r = c(mut); assert.equal(r.verdict, 'FAIL', reason + ' did not fail'); assert.equal(r.reason, reason, 'wrong reason: ' + r.reason + ' for ' + reason); }
  for (const mut of [(x) => { delete x.base; }, (x) => { delete x.base.baseline; }, (x) => { delete x.head; }]) assert.equal(c(mut).verdict, 'UNKNOWN', 'a missing input was not UNKNOWN');
}
