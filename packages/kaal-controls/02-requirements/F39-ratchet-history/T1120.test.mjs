// Case controls/T1120 tests: controls/F39
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const L0 = { at: '2026-11-20T08:00Z', change: 'demo/C1', from: null, to: 3, removed: [] };
const L1 = { at: '2026-11-24T09:00Z', change: 'demo/C9', from: 3, to: 2, removed: ['c'] };
const ok = () => ({ base: { baseline: ['a', 'b', 'c'], history: [L0] }, head: { baseline: ['a', 'b'], history: [L0, L1] }, change: { id: 'demo/C9', exists: true }, window: { from: '2026-11-24T08:00Z', to: '2026-11-24T10:00Z' } });
export const id = 'controls/T1120';
export const tests = ['controls/F39'];
export const title = 'a pull request that shrinks a ratchet records one exact history line with its time and its Change';
export async function run() {
  const lib = join(S, 'ratchet.mjs');
  assert.ok(existsSync(lib), 'scripts/ratchet.mjs is absent');
  const { judgeProgress } = await import(pathToFileURL(lib).href);
  const pass = judgeProgress(ok());
  assert.equal(pass.verdict, 'PASS', 'an exact line was not accepted: ' + pass.reason);
  const c = (mut) => { const x = ok(); mut(x); return judgeProgress(x); };
  const fails = [
    ['history-missing', (x) => { x.head.history = [L0]; }],
    ['history-without-change', (x) => { x.head.baseline = ['a', 'b', 'c']; }],
    ['line-mismatch', (x) => { x.head.history = [L0, { ...L1, removed: ['b'] }]; }],
    ['line-mismatch', (x) => { x.head.history = [L0, { ...L1, from: 4 }]; }],
    ['history-rewritten', (x) => { x.head.history = [{ ...L0, to: 9 }, L1]; }],
    ['change-mismatch', (x) => { x.change.id = 'demo/C8'; }],
    ['change-unknown', (x) => { x.change.exists = false; }],
    ['time-before-previous', (x) => { x.head.history = [L0, { ...L1, at: '2026-11-19T08:00Z' }]; x.window.from = '2026-11-01T00:00Z'; }],
    ['time-out-of-window', (x) => { x.head.history = [L0, { ...L1, at: '2026-11-24T11:00Z' }]; }],
    ['baseline-grew', (x) => { x.head.baseline = ['a', 'b', 'n']; }],
  ];
  for (const [reason, mut] of fails) { const r = c(mut); assert.equal(r.verdict, 'FAIL', reason + ' did not fail'); assert.equal(r.reason, reason, 'wrong reason: ' + r.reason + ' for ' + reason); }
  for (const mut of [(x) => { delete x.base.history; }, (x) => { delete x.head.baseline; }, (x) => { delete x.window; }, (x) => { delete x.change; }]) assert.equal(c(mut).verdict, 'UNKNOWN', 'a missing input was not UNKNOWN');
}
