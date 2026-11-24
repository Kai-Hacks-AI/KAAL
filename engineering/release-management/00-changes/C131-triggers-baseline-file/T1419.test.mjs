// Case release/T1419 tests: release/C131
import assert from 'node:assert/strict';
import { findingsOf, judge } from '../../05-src/triggers/verify-triggers.mjs';
import { judgeMode } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs';
import { honest } from './fixtures.mjs';
export const id = 'release/T1419';
export const tests = ['release/C131'];
export const title = 'enforcement is the same on both sides of the change: for a new use, a removed use, an unchanged tree, a second use in one workflow and a workflow only on the base, the baseline file gives the verdict and the next baseline the derived baseline gave';
export async function run() {
  const f = (n) => `.github/workflows/${n}.yml`;
  const pr = 'on:\n  pull_request:\n'; const prt = 'on:\n  pull_request_target:\n'; const both = 'on:\n  pull_request:\n  pull_request_target:\n';
  // the way verify Triggers answered before the baseline file: the base derives the baseline
  const derived = ({ base, head }) => {
    const previous = findingsOf(base); const findings = findingsOf(head);
    const r = judgeMode({ mode: 'ratchet', findings, previous, baseline: previous.filter((x) => findings.includes(x)) });
    return { verdict: r.verdict, next: r.next };
  };
  const base = { [f('a')]: pr, [f('b')]: prt, [f('d')]: prt };
  const pairs = {
    'a new use': { base, head: { ...base, [f('c')]: prt } },
    'a use given to a workflow': { base, head: { ...base, [f('a')]: prt } },
    'a removed use': { base, head: { ...base, [f('b')]: pr } },
    'an unchanged tree': { base, head: base },
    'a second use in one workflow': { base, head: { ...base, [f('b')]: both } },
    'a workflow only on the base': { base, head: { [f('a')]: pr, [f('b')]: prt } },
    'a swap': { base, head: { [f('a')]: pr, [f('b')]: prt, [f('c')]: prt } },
  };
  for (const [name, sides] of Object.entries(pairs)) {
    const was = derived(sides);
    const now = judge(honest(sides));
    assert.equal(now.verdict, was.verdict, `${name}: the verdict changed`);
    assert.deepEqual(now.next, was.next, `${name}: the next baseline changed`);
  }
}
