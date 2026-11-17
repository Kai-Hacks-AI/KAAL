// Case release/T723 tests: release/CTL4
import assert from 'node:assert/strict';
import { declaration, directory, run as record, judge } from './fixtures.mjs';
export const id = 'release/T723';
export const tests = ['release/CTL4'];
export const title = 'a source test run that left no record or whose exit status is not a whole number is unknown and never verified, and no other rule is judged on it';
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  const none = mod.judgeSource({ directory, run: null }, declaration);
  assert.equal(none.result, 'unknown');
  assert.deepEqual(none.findings.map((f) => f.rule), ['source-not-run']);
  assert.equal(none.findings[0].kind, 'unknown');
  for (const status of [undefined, null, '0', 0.5, Number.NaN, 'killed']) {
    const out = mod.judgeSource({ directory, run: record({ status, command: 'x' }) }, declaration);
    assert.equal(out.result, 'unknown', `status ${String(status)} did not give unknown`);
    assert.deepEqual(out.findings.map((f) => f.rule), ['source-not-run'], `status ${String(status)}: another rule was judged`);
  }
}
