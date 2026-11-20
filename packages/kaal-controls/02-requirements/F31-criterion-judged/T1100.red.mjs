// Case controls/T1100 tests: controls/F31
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const base = { control: 'demo/CTL1', reason: 'It does.', by: 'reviewer', ref: 'abc' };

export const id = 'controls/T1100';
export const tests = ['controls/F31'];
export const title = 'the latest judgement is shown beside the result, stale when the control or its Cases changed, and never changes the verdict';
export async function run() {
  const m = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  assert.equal(typeof m.digestOf, 'function', 'digestOf is not exported');
  const d1 = m.digestOf(['control text', 'case text']);
  assert.equal(d1, m.digestOf(['control text', 'case text']), 'the digest is not stable');
  assert.notEqual(d1, m.digestOf(['control text', 'case text changed']), 'a changed Case kept its digest');
  const ctl = { id: 'demo/CTL1' };
  assert.equal(m.judgementOf(ctl, [], d1).verdict, 'none', 'no judgement was not shown as none');
  const j = [{ ...base, verdict: 'not-covered', of: 'old', at: 1 }, { ...base, verdict: 'covered', of: d1, at: 2 }];
  const now = m.judgementOf(ctl, j, d1);
  assert.deepEqual([now.verdict, now.stale], ['covered', false], 'the latest judgement was not shown as current');
  const old = m.judgementOf(ctl, j, m.digestOf(['control text changed', 'case text']));
  assert.equal(old.stale, true, 'a changed control did not make its judgement stale');
  const other = m.judgementOf({ id: 'demo/CTL2' }, j, d1);
  assert.equal(other.verdict, 'none', 'a judgement of another control was shown');
  const v = m.judgeEvidence({ id: 'demo/CTL1', evidence: [{ kind: 'fixture', runs: 1, fail: false }], tests: [{ id: 'demo/T1' }] }, []);
  assert.equal(v.verdict, 'UNKNOWN', 'a verdict changed');
}
