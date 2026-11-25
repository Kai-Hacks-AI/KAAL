// Case controls/T1530 tests: controls/F211
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/ratchet.mjs');
export const id = 'controls/T1530';
export const tests = ['controls/F211'];
export const title = 'the adoption line of a ratchet is judged by the library: the first line, its Change and its time, and nothing else is accepted';
const window = { from: '2026-11-25T08:00Z', to: '2026-11-25T12:00Z' };
const line = { at: '2026-11-25T09:00Z', change: 'rel/C134', from: null, to: 2, removed: [] };
const names = ['a', 'b'];
const ok = () => ({ base: { baseline: [], history: [] }, head: { baseline: names, history: [line] }, change: { id: 'rel/C134', exists: true }, window });
export async function run() {
  assert.ok(existsSync(lib), 'scripts/ratchet.mjs is absent');
  const { judgeAdoption, judgeProgress } = await import(pathToFileURL(lib).href);
  assert.equal(typeof judgeAdoption, 'function', 'judgeAdoption is not exported');
  assert.equal(judgeAdoption(ok()).verdict, 'PASS', 'a plain adoption was refused');
  const withBase = ok(); withBase.base.baseline = ['a', 'b', 'c'];
  assert.equal(judgeAdoption(withBase).verdict, 'PASS', 'an adoption over an existing baseline file was refused');
  const zero = ok(); zero.head.baseline = []; zero.head.history = [{ ...line, to: 0 }];
  assert.equal(judgeAdoption(zero).verdict, 'PASS', 'an adoption at zero was refused');
  const c = (mut) => { const x = ok(); mut(x); return judgeAdoption(x); };
  const fails = [
    ['already-adopted', (x) => { x.base.history = [{ ...line, to: 1 }]; }],
    ['line-mismatch', (x) => { x.head.history = []; }],
    ['line-mismatch', (x) => { x.head.history = [line, { ...line, from: 2, to: 1, removed: ['b'] }]; }],
    ['line-mismatch', (x) => { x.head.history = [{ ...line, from: 0 }]; }],
    ['line-mismatch', (x) => { x.head.history = [{ ...line, to: 5 }]; }],
    ['line-mismatch', (x) => { x.head.history = [{ ...line, removed: ['a'] }]; }],
    ['change-mismatch', (x) => { x.change = { id: 'rel/C999', exists: true }; }],
    ['change-unknown', (x) => { x.change = { id: 'rel/C134', exists: false }; }],
    ['time-out-of-window', (x) => { x.head.history = [{ ...line, at: '2026-11-25T07:00Z' }]; }],
    ['time-out-of-window', (x) => { x.head.history = [{ ...line, at: '2026-11-25T13:00Z' }]; }],
    ['baseline-grew', (x) => { x.base.baseline = ['a']; }],
  ];
  for (const [reason, mut] of fails) { const r = c(mut); assert.equal(r.verdict, 'FAIL', `${reason} did not fail`); assert.equal(r.reason, reason, `wrong reason ${r.reason} for ${reason}`); }
  for (const mut of [(x) => { delete x.base; }, (x) => { delete x.head; }, (x) => { delete x.change; }, (x) => { delete x.window; }, (x) => { x.head.baseline = ['a', 'a']; }, (x) => { x.head.history = [{ ...line, at: 'not a time' }]; }]) assert.equal(c(mut).verdict, 'UNKNOWN', 'a malformed input was not UNKNOWN');
  // judgeProgress is unchanged: it still does not accept an adoption line.
  assert.notEqual(judgeProgress({ base: { baseline: names, history: [] }, head: { baseline: names, history: [line] }, change: { id: 'rel/C134', exists: true }, window }).verdict, 'PASS', 'judgeProgress changed');
}
