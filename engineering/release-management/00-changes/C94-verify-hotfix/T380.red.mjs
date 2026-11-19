// Case release/T380 tests: release/G66 (judge of release/CTL21)
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T380';
export const tests = ['release/G66'];
export const title = 'the HOTFIX trace judge separates a valid Defect trace from revision-bound correction evidence (RED at the baseline, GREEN at the head), reads missing or stale evidence as UNKNOWN, and never answers PASS';

export async function run() {
  const mod = join(repo, 'engineering/release-management/05-src/hotfix/verify-hotfix.mjs');
  assert.ok(existsSync(mod), 'the verify Hotfix judge is absent');
  const { judgeHotfixTrace } = await import(pathToFileURL(mod).href);
  const ev = (b, h, br = 'B1', hr = 'H1') => ({ baseline: b && { rev: br, result: b }, head: h && { rev: hr, result: h } });
  const base = {
    defects: ['hosting/D10'],
    paths: ['packages/kaal-hosting/src/read.mjs'],
    baseRev: 'B1',
    headRev: 'H1',
    lookupDefect: (d) => (d === 'hosting/D10' ? { cases: ['hosting/T12'] } : d === 'hosting/D11' ? { cases: [] } : undefined),
    caseExists: (c) => c === 'hosting/T12',
    caseEvidence: () => ev('RED', 'GREEN'),
  };
  const j = (over) => judgeHotfixTrace({ ...base, ...over });
  const unjudged = (r, re) => r.notJudged.some((s) => re.test(s));

  // RED at the baseline and GREEN at the head: the trace is valid and the correction verified, yet never PASS.
  // The Case is not in the diff: an unchanged Case may reproduce the defect.
  const good = j({});
  assert.equal(good.trace, 'VALID');
  assert.equal(good.correction, 'VERIFIED');
  assert.equal(good.verdict, 'UNKNOWN', 'a verified correction must still not be PASS');
  assert.deepEqual(good.findings, []);
  assert.deepEqual(good.attention, [], 'one root needs no attention');
  for (const re of [/minimal/, /unrelated work/, /corresponds to the Defect/]) {
    assert.ok(unjudged(good, re), `not judged is missing ${re}`);
  }
  // Several roots are listed for justification and never change the verdict.
  const wide = j({ paths: [...base.paths, 'engineering/guard/check.mjs'] });
  assert.equal(wide.verdict, 'UNKNOWN');
  assert.deepEqual(wide.findings, []);
  assert.ok(wide.attention.some((s) => /capability root/.test(s)), 'several roots are not flagged for justification');

  // Each broken link of the trace is a finding.
  const broken = [
    [{ defects: [] }, /Defect/, 'no Defect'],
    [{ defects: ['hosting/D10', 'hosting/D11'] }, /one Defect/, 'two Defects'],
    [{ defects: ['hosting/D99'] }, /not recorded/, 'an unrecorded Defect'],
    [{ defects: ['hosting/D11'] }, /reproducing Case/, 'a Defect without a Case'],
    [{ caseExists: () => false }, /does not exist/, 'a missing Case'],
    [{ paths: [] }, /empty/, 'an empty diff'],
  ];
  for (const [over, re, what] of broken) {
    const r = j(over);
    assert.equal(r.verdict, 'FAIL', `${what} is accepted`);
    assert.equal(r.trace, 'BROKEN', `${what} leaves the trace valid`);
    assert.ok(r.findings.some((s) => re.test(s)), `${what} gives no matching finding`);
  }

  // Correction evidence. RED at the baseline is expected and is no finding.
  assert.deepEqual(good.findings, [], 'RED at the baseline is reported as a finding');
  const stillRed = j({ caseEvidence: () => ev('RED', 'RED') });
  assert.equal(stillRed.verdict, 'FAIL', 'a Case still RED on the corrected head is accepted');
  assert.equal(stillRed.correction, 'NOT VERIFIED');
  assert.equal(stillRed.trace, 'VALID', 'a RED head must not break the trace');
  const notReproducing = j({ caseEvidence: () => ev('GREEN', 'GREEN') });
  assert.equal(notReproducing.verdict, 'FAIL', 'a Case GREEN at the baseline is taken as reproducing the defect');
  assert.equal(notReproducing.correction, 'NOT VERIFIED');
  // GREEN at the head alone, an absent part, or evidence bound to another revision is UNKNOWN, never verified.
  for (const [e, what] of [
    [ev(undefined, 'GREEN'), 'GREEN at the head alone'],
    [ev('RED', undefined), 'a missing head result'],
    [undefined, 'no evidence'],
    [ev('RED', 'GREEN', 'B0', 'H1'), 'a baseline result bound to another revision'],
    [ev('RED', 'GREEN', 'B1', 'H0'), 'a head result bound to another revision'],
  ]) {
    const r = j({ caseEvidence: () => e });
    assert.equal(r.correction, 'UNKNOWN', `${what} is taken as a verified correction`);
    assert.equal(r.verdict, 'UNKNOWN', `${what} changes the verdict`);
    assert.deepEqual(r.findings, [], `${what} is a finding, not a gap in evidence`);
    assert.ok(unjudged(r, /evidence/), `${what} is not listed as not judged`);
  }

  // A Defect may record several reproducing Cases and every one is read: one verified Case does not verify the correction.
  const two = { lookupDefect: () => ({ cases: ['hosting/T12', 'hosting/T13'] }), caseExists: () => true };
  const per = (m) => ({ caseEvidence: (c) => m[c] });
  const both = j({ ...two, ...per({ 'hosting/T12': ev('RED', 'GREEN'), 'hosting/T13': ev('RED', 'GREEN') }) });
  assert.equal(both.correction, 'VERIFIED');
  assert.deepEqual(both.cases.map((c) => c.correction), ['VERIFIED', 'VERIFIED']);
  const oneRed = j({ ...two, ...per({ 'hosting/T12': ev('RED', 'GREEN'), 'hosting/T13': ev('RED', 'RED') }) });
  assert.equal(oneRed.verdict, 'FAIL', 'a second Case still RED is hidden by the first');
  assert.equal(oneRed.correction, 'NOT VERIFIED');
  assert.ok(oneRed.findings.some((s) => /hosting\/T13/.test(s) && /still RED/.test(s)), 'the finding does not name the failing Case');
  const oneMissing = j({ ...two, ...per({ 'hosting/T12': ev('RED', 'GREEN') }) });
  assert.equal(oneMissing.correction, 'UNKNOWN', 'a Case without evidence is taken as verified');
  assert.equal(oneMissing.verdict, 'UNKNOWN');
  assert.deepEqual(oneMissing.findings, []);
  assert.ok(oneMissing.notJudged.some((s) => /hosting\/T13/.test(s)), 'the missing Case is not named');
  const notReproducing2 = j({ ...two, ...per({ 'hosting/T12': ev('RED', 'GREEN'), 'hosting/T13': ev('GREEN', 'GREEN') }) });
  assert.equal(notReproducing2.verdict, 'FAIL');
  assert.equal(notReproducing2.cases[1].correction, 'NOT VERIFIED');
}
