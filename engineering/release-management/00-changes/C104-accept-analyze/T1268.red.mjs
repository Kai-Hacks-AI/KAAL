// Case release/T1268 tests: release/C104
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, load, NOW, run, checks } from './fixtures.mjs';
export const id = 'release/T1268';
export const tests = ['release/C104'];
export const title = 'the acceptance judge says PASS only for a reported check of the expected integration in a recent merge-queue run into main, FAIL when it is not reported, and UNKNOWN when nothing current can be judged';
export async function run_() {
  assert.ok(existsSync(join(SRC, 'acceptance.mjs')), 'the acceptance judge is absent');
  const { judgeAcceptance, INTEGRATION_ID, CONTEXT } = await load('acceptance.mjs');
  assert.equal(INTEGRATION_ID, 15368);
  assert.equal(CONTEXT, 'analyze Vulnerabilities (Promoting)');
  const judge = (facts) => judgeAcceptance(facts, { now: NOW });
  const pass = judge({ run, checks });
  assert.equal(pass.outcome, 'PASS');
  assert.equal(pass.passes, true);
  assert.equal(judge({ run, checks: [{ ...checks[1], conclusion: 'failure' }] }).outcome, 'PASS', 'a reported failure still shows the check is reported');
  for (const [name, facts] of [
    ['the check is not reported', { run, checks: [checks[0]] }],
    ['another integration reported it', { run, checks: [{ ...checks[1], appId: 1 }] }],
    ['the check has no verdict', { run, checks: [{ ...checks[1], conclusion: 'skipped' }] }],
  ]) {
    const r = judge(facts);
    assert.equal(r.outcome, 'FAIL', name);
    assert.equal(r.passes, false);
  }
  for (const [name, facts] of [
    ['no facts', undefined],
    ['no run', { run: null, checks: [] }],
    ['an old run', { run: { ...run, created_at: '2026-11-01T00:00:00Z' }, checks }],
    ['an unreadable time', { run: { ...run, created_at: 'soon' }, checks }],
    ['not a queue run', { run: { ...run, event: 'pull_request' }, checks }],
    ['a queue run into another branch', { run: { ...run, head_branch: 'gh-readonly-queue/kaal/release/x/pr-1-abc' }, checks }],
    ['unreadable checks', { run, checks: undefined }],
  ]) {
    const r = judge(facts);
    assert.equal(r.outcome, 'UNKNOWN', name);
    assert.equal(r.passes, false);
  }
}
export { run_ as run };
