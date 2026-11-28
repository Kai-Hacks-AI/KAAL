// Case release/T1599 tests: release/C159. A verdict that does not apply is never verification evidence. Each entry of the Promotion Source replacement answers `not-applicable` and writes no kaal-control record for a pull request it does not judge, and still writes its record for one it does, so the Case is not vacuous. Facts that cannot be judged are UNKNOWN.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const DIR = join(repo, 'engineering/release-management/05-src/promotion-source');
export const id = 'release/T1599';
export const tests = ['release/C159'];
export const title = 'a Promotion Source verdict that does not apply answers not-applicable and writes no record; one that applies writes its record';
export async function run() {
  const boundary = { x: 'real', run: '1', sha: 'a'.repeat(40) };
  const head = '0123456789abcdef0123456789abcdef01234567';
  const promo = { repo: 'o/r', defaultBranch: 'main', baseRef: 'main', headRepo: 'o/r', headRef: 'kaal/release/x', head };
  const green = { required: [{ context: 'Engineering' }], runs: [{ id: 1, name: 'Engineering', status: 'completed', conclusion: 'success', headSha: head }] };
  const origin = await import(pathToFileURL(join(DIR, 'judge-origin.mjs')).href);
  const evidence = await import(pathToFileURL(join(DIR, 'judge-head-evidence.mjs')).href);
  // Not a promotion: both entries say so and write nothing.
  for (const m of [origin, evidence]) {
    const na = await m.check({ ...promo, baseRef: 'kaal/release/y', headRef: 'feature/x' }, { boundary });
    assert.equal(na.kind, 'not-applicable', 'a pull request into a lineage is not a promotion');
    assert.equal(na.record, null, 'a verdict that does not apply writes no record');
    assert.notEqual(na.verdict, 'PASS', 'a verdict that does not apply is not a PASS');
  }
  // A head the origin refuses is not the head evidence's to judge: not applicable there, a finding in origin.
  const fork = { ...promo, headRepo: 'f/r' };
  assert.equal((await evidence.check({ ...fork, checks: green }, { boundary })).kind, 'not-applicable', 'a fork head is the origin entry\'s to refuse');
  assert.equal((await evidence.check({ ...fork, checks: green }, { boundary })).record, null);
  assert.equal((await origin.check(fork, { boundary })).kind, 'fail', 'the origin entry refuses a fork head');
  // A verdict that applies writes its record.
  const passed = await origin.check(promo, { boundary });
  assert.equal(passed.kind, 'pass');
  assert.equal(passed.record?.verdict, 'PASS', 'a verdict that applies writes its record');
  const evidenced = await evidence.check({ ...promo, checks: green }, { boundary });
  assert.equal(evidenced.kind, 'pass');
  assert.equal(evidenced.record?.control, 'release/CTL41');
  // No check evidence for a promotion head is UNKNOWN, with no PASS record.
  const none = await evidence.check(promo, { boundary });
  assert.equal(none.kind, 'unknown', 'absent check evidence is UNKNOWN');
  assert.notEqual(none.record?.verdict, 'PASS', 'absent check evidence writes no PASS record');
}
