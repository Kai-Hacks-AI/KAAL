// Case release/T188 tests: F17
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const judge = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const id = 'release/T188';
export const tests = ['release/F17'];
export const title = 'a HOTFIX must come from a head under hotfix/ and its base is reported as not judged; the result names its verdict, and a result that left something unjudged is UNKNOWN, never PASS';
export async function run() {
  const { verifyEnvelope } = await import(pathToFileURL(judge).href);
  const registry = { PLAN: ['Change', 'From', 'To', 'Because'], HOTFIX: ['Change', 'Defect', 'Urgency', 'Approach'] };
  const hotfixBody = '## Change\n\nrelease/C99 sample\n\n## Defect\n\nIt fails.\n\n## Urgency\n\nNow.\n\n## Approach\n\nFix it.\n';
  const hotfix = { title: 'HOTFIX: Restore a sample', body: hotfixBody, base: 'main', head: 'hotfix/restore-sample' };

  // the head
  const good = verifyEnvelope(hotfix, registry);
  assert.equal(good.ok, true, 'a HOTFIX from a head under hotfix/ is rejected');
  assert.equal(verifyEnvelope({ ...hotfix, head: 'claude/x' }, registry).ok, false, 'a HOTFIX from a head outside hotfix/ is accepted');
  assert.equal(verifyEnvelope({ ...hotfix, head: 'kaal/release/sample' }, registry).ok, false, 'a HOTFIX from a collector is accepted');
  assert.equal(verifyEnvelope({ ...hotfix, head: 'hotfix' }, registry).ok, false, 'a head named hotfix without a path is accepted');

  // the base is never judged, and the result says so
  for (const base of ['main', 'kaal/release/sample', 'kaal/hotfix']) {
    const result = verifyEnvelope({ ...hotfix, base }, registry);
    assert.equal(result.ok, true, `a HOTFIX into ${base} is rejected on its base`);
    assert.ok(result.notJudged.some((n) => /base/i.test(n) && /HOTFIX/.test(n)), `the unjudged base of a HOTFIX into ${base} is not reported`);
    assert.equal(result.complete, false, 'a HOTFIX is reported as completely judged');
  }

  // the verdict
  assert.equal(good.verdict, 'UNKNOWN', 'a HOTFIX that left its base unjudged does not read UNKNOWN');
  // ok is local validation only: ok true with UNKNOWN must never be mistaken for a pass
  assert.equal(good.ok, true, 'the local validation of a valid HOTFIX head is not ok');
  assert.notEqual(good.verdict, 'PASS', 'ok true with unjudged parts reads PASS');
  assert.equal(verifyEnvelope({ ...hotfix, head: 'claude/x' }, registry).verdict, 'FAIL', 'a HOTFIX with a finding does not read FAIL');
  const planBody = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const plan = { title: 'PLAN: Create a sample', body: planBody, base: 'kaal/release/sample', head: 'claude/x', commits: [{ subject: 'x', message: 'x\n\nDriven-by: release/C99\n' }] };
  assert.equal(verifyEnvelope(plan, registry).verdict, 'PASS', 'a fully judged clean envelope does not read PASS');
  assert.equal(verifyEnvelope({ ...plan, title: 'REVERT: Undo a sample' }, registry).verdict, 'UNKNOWN', 'an unsupported TYPE does not read UNKNOWN');
  assert.equal(verifyEnvelope({ ...plan, commits: undefined }, registry).verdict, 'UNKNOWN', 'missing commit evidence does not read UNKNOWN');
  assert.equal(verifyEnvelope({ ...plan, title: 'Create a sample' }, registry).verdict, 'FAIL', 'a wrong title does not read FAIL');
  const fail = verifyEnvelope({ ...hotfix, head: 'claude/x' }, registry);
  const pass = verifyEnvelope(plan, registry);
  assert.deepEqual([good, fail, pass].map((r) => [r.ok, r.verdict]), [[true, 'UNKNOWN'], [false, 'FAIL'], [true, 'PASS']], 'ok and verdict are not told apart: only PASS may authorize');
}
