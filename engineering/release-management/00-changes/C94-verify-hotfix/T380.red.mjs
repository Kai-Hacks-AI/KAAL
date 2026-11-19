// Case release/T380 tests: release/G66, release/F71 (the judge of release/CTL21)
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T380';
export const tests = ['release/G66', 'release/F71'];
export const title = 'a Hotfix is valid when it names one Defect with at least one Case, and every Case is RED before and GREEN after: PASS; a broken link or a Case not RED then GREEN is FAIL; anything not observed is UNKNOWN';

export async function run() {
  const mod = join(repo, 'engineering/release-management/05-src/hotfix/verify-hotfix.mjs');
  assert.ok(existsSync(mod), 'the verify Hotfix judge is absent');
  const { judgeHotfix } = await import(pathToFileURL(mod).href);
  const base = {
    defects: ['hosting/D10'],
    lookupDefect: (d) => (d === 'hosting/D10' ? { cases: ['hosting/T12'] } : d === 'hosting/D11' ? { cases: [] } : undefined),
    caseExists: (c) => c === 'hosting/T12',
    caseEvidence: () => ({ before: 'RED', after: 'GREEN' }),
  };
  const j = (over) => judgeHotfix({ ...base, ...over });

  // One Defect, a Case, RED before and GREEN after: proven.
  const good = j({});
  assert.equal(good.verdict, 'PASS');
  assert.equal(good.trace, 'VALID');
  assert.equal(good.correction, 'VERIFIED');
  assert.deepEqual(good.findings, []);

  // Each broken link of the trace is a finding.
  const broken = [
    [{ defects: [] }, /names no Defect/, 'no Defect'],
    [{ defects: ['hosting/D10', 'hosting/D11'] }, /one Defect/, 'two Defects'],
    [{ defects: ['hosting/D99'] }, /no record/, 'a Defect without a record'],
    [{ defects: ['hosting/D11'] }, /names no Case/, 'a Defect without a Case'],
    [{ caseExists: () => false }, /does not exist/, 'a missing Case'],
  ];
  for (const [over, re, what] of broken) {
    const r = j(over);
    assert.equal(r.verdict, 'FAIL', `${what} is accepted`);
    assert.equal(r.trace, 'BROKEN', `${what} leaves the trace valid`);
    assert.ok(r.findings.some((s) => re.test(s)), `${what} gives no matching finding`);
  }

  // The proof: RED before and GREEN after. RED before is expected and no finding.
  const stillRed = j({ caseEvidence: () => ({ before: 'RED', after: 'RED' }) });
  assert.equal(stillRed.verdict, 'FAIL', 'a Case still RED after is accepted');
  assert.equal(stillRed.correction, 'NOT VERIFIED');
  assert.equal(stillRed.trace, 'VALID', 'a RED after must not break the trace');
  const noIssue = j({ caseEvidence: () => ({ before: 'GREEN', after: 'GREEN' }) });
  assert.equal(noIssue.verdict, 'FAIL', 'a Case GREEN before is taken as an issue');
  assert.equal(noIssue.correction, 'NOT VERIFIED');
  // Anything not observed is UNKNOWN, never a pass and never RED.
  for (const [e, what] of [
    [{ after: 'GREEN' }, 'GREEN after alone'],
    [{ before: 'RED' }, 'a missing after result'],
    [{}, 'no evidence'],
    [{ before: 'UNKNOWN', after: 'GREEN' }, 'an UNKNOWN before'],
  ]) {
    const r = j({ caseEvidence: () => e });
    assert.equal(r.verdict, 'UNKNOWN', `${what} is not UNKNOWN`);
    assert.equal(r.correction, 'UNKNOWN');
    assert.deepEqual(r.findings, [], `${what} is a finding`);
    assert.ok(r.unknown.length > 0, `${what} is not explained`);
  }

  // A Defect may record several Cases and every one is read.
  const two = { lookupDefect: () => ({ cases: ['hosting/T12', 'hosting/T13'] }), caseExists: () => true };
  const per = (m) => ({ caseEvidence: (c) => m[c] ?? {} });
  const ok = { before: 'RED', after: 'GREEN' };
  const both = j({ ...two, ...per({ 'hosting/T12': ok, 'hosting/T13': ok }) });
  assert.equal(both.verdict, 'PASS');
  assert.deepEqual(both.cases.map((c) => c.correction), ['VERIFIED', 'VERIFIED']);
  const oneRed = j({ ...two, ...per({ 'hosting/T12': ok, 'hosting/T13': { before: 'RED', after: 'RED' } }) });
  assert.equal(oneRed.verdict, 'FAIL', 'a second Case still RED is hidden by the first');
  assert.ok(oneRed.findings.some((s) => /hosting\/T13/.test(s)), 'the finding does not name the failing Case');
  const oneMissing = j({ ...two, ...per({ 'hosting/T12': ok }) });
  assert.equal(oneMissing.verdict, 'UNKNOWN', 'a Case without evidence is taken as verified');
  assert.ok(oneMissing.unknown.some((s) => /hosting\/T13/.test(s)), 'the missing Case is not named');
}
