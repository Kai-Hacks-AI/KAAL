// Case controls/T1100 tests: controls/F31
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const base = { control: 'demo/CTL1', about: 'verification', reason: 'It does.', by: 'reviewer', ref: 'abc' };

export const id = 'controls/T1100';
export const tests = ['controls/F31'];
export const title = 'the latest judgement is shown beside the result for verification and validation, stale when the control or its Cases changed, and never changes the verdict';
export async function run() {
  const m = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  assert.equal(typeof m.digestOf, 'function', 'digestOf is not exported');
  const d1 = m.digestOf(['control text', 'case text']);
  assert.equal(d1, m.digestOf(['control text', 'case text']), 'the digest is not stable');
  assert.notEqual(d1, m.digestOf(['control text', 'case text changed']), 'a changed Case kept its digest');
  const ctl = { id: 'demo/CTL1' };
  const none = m.judgementOf(ctl, [], d1);
  assert.deepEqual([none.verification.verdict, none.validation.verdict], ['none', 'none'], 'no judgement was not shown as none for both');
  const j = [{ ...base, verdict: 'not-covered', of: 'old', at: 1 }, { ...base, verdict: 'covered', of: d1, at: 2 }, { ...base, about: 'validation', verdict: 'serves', of: 'old', at: 3 }];
  const now = m.judgementOf(ctl, j, d1);
  assert.deepEqual([now.verification.verdict, now.verification.stale], ['covered', false], 'the latest verification judgement was not shown as current');
  assert.deepEqual([now.validation.verdict, now.validation.stale], ['serves', true], 'a validation judgement of another digest was not shown as stale');
  const old = m.judgementOf(ctl, j, m.digestOf(['control text changed', 'case text']));
  assert.equal(old.verification.stale, true, 'a changed control did not make its judgement stale');
  assert.equal(m.judgementOf({ id: 'demo/CTL2' }, j, d1).verification.verdict, 'none', 'a judgement of another control was shown');
  const v = m.judgeEvidence({ id: 'demo/CTL1', evidence: [{ kind: 'fixture', runs: 1, fail: false }], tests: [{ id: 'demo/T1' }] }, []);
  assert.equal(v.verdict, 'UNKNOWN', 'a verdict changed');
}
