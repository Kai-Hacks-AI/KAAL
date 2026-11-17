// Case release/T722 tests: release/CTL4
import assert from 'node:assert/strict';
import { declaration, directory, run as record, judge } from './fixtures.mjs';
export const id = 'release/T722';
export const tests = ['release/CTL4'];
export const title = 'a run of the declared command in the package directory that exited 0 is verified, and a wrong command, a wrong directory or a non-zero exit each give their own named finding, in a fixed order, without changing the input';
const WRONG = {
  'source-command': { command: 'npm run build' },
  'source-directory': { cwd: 'packages/other' },
  'source-failed': { status: 1 },
};
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  assert.deepEqual(mod.judgeSource({ directory, run: record() }, declaration), { result: 'verified', findings: [] });
  for (const [rule, change] of Object.entries(WRONG)) {
    const r = record(change);
    const before = JSON.stringify(r);
    const out = mod.judgeSource({ directory, run: r }, declaration);
    assert.equal(out.result, 'failed', `${rule}: not failed`);
    assert.deepEqual(out.findings.map((f) => f.rule), [rule], `${rule}: the finding is not the one rule`);
    assert.equal(out.findings[0].kind, 'failed');
    assert.equal(before, JSON.stringify(r), `${rule}: the input changed`);
  }
  const all = mod.judgeSource({ directory, run: record({ command: 'x', cwd: 'y', status: 2 }) }, declaration);
  assert.deepEqual(all.findings.map((f) => f.rule), ['source-command', 'source-directory', 'source-failed'], 'the order is not fixed');
}
