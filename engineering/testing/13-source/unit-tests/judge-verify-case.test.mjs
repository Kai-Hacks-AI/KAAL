import test from 'node:test';
import assert from 'node:assert/strict';
import { FORM_SCHEMA, EXEMPTIBLE_KINDS, judgeVerifyCase } from '../scripts/judge-verify-case.mjs';

const completeReport = (files, findings = [], extra = {}) => ({
  schema: FORM_SCHEMA,
  files,
  catalog: { complete: true },
  targets: { checked: true },
  findings,
  ...extra,
});

test('PASS sets applies correctly when catalog.complete and targets.checked are strictly true', () => {
  const empty = judgeVerifyCase({ formReport: completeReport([]) });
  assert.equal(empty.verdict, 'PASS');
  assert.equal(empty.applies, false);

  const nonEmpty = judgeVerifyCase({ formReport: completeReport(['testing/10-intent/test-cases/T397.test.mjs']) });
  assert.equal(nonEmpty.verdict, 'PASS');
  assert.equal(nonEmpty.applies, true);
  assert.deepEqual(nonEmpty.findings, []);
  assert.deepEqual(nonEmpty.uncertain, []);
});

test('fails closed with UNKNOWN when completeness, target checking, or report structure is missing/invalid', () => {
  const incompleteInputs = [
    { schema: FORM_SCHEMA, files: ['T1.test.mjs'], findings: [] },
    { schema: FORM_SCHEMA, files: ['T1.test.mjs'], catalog: { complete: false }, targets: { checked: true }, findings: [] },
    { schema: FORM_SCHEMA, files: ['T1.test.mjs'], catalog: { complete: 'true' }, targets: { checked: true }, findings: [] },
    { schema: FORM_SCHEMA, files: ['T1.test.mjs'], catalog: { complete: true }, targets: { checked: false }, findings: [] },
    { schema: FORM_SCHEMA, files: ['T1.test.mjs'], catalog: { complete: true }, targets: { checked: 'true' }, findings: [] },
    { schema: 'wrong/schema', files: [], catalog: { complete: true }, targets: { checked: true }, findings: [] },
  ];
  for (const formReport of incompleteInputs) {
    const res = judgeVerifyCase({ formReport });
    assert.equal(res.verdict, 'UNKNOWN');
    assert.equal(res.applies, true);
  }
});

test('preserves authoritative FAIL findings verbatim and lets FAIL outrank UNKNOWN', () => {
  const fFail = { file: 'a/T1.test.mjs', kind: 'non-callable-run', detail: 'run is number' };
  const fUnknown = { file: 'b/T2.test.mjs', kind: 'unverified-target', target: 'release/C35' };

  const onlyUnknown = judgeVerifyCase({ formReport: completeReport(['b/T2.test.mjs'], [fUnknown]) });
  assert.equal(onlyUnknown.verdict, 'UNKNOWN');
  assert.deepEqual(onlyUnknown.uncertain, [fUnknown]);

  const mixed = judgeVerifyCase({ formReport: completeReport(['a/T1.test.mjs', 'b/T2.test.mjs'], [fFail, fUnknown]) });
  assert.equal(mixed.verdict, 'FAIL');
  assert.deepEqual(mixed.findings, [fFail]);
  assert.deepEqual(mixed.uncertain, [fUnknown]);
});

test('rejects invalid or non-exemptible subjectPolicy rules and retains valid stale-header exemptions', () => {
  assert.deepEqual([...EXEMPTIBLE_KINDS], ['stale-header', 'first-line']);
  const stale = { file: 'old/T134.test.mjs', kind: 'stale-header', target: 'G38' };

  for (const subjectPolicy of [
    { exempt: [{}] },
    { exempt: [{ typo: 'legacy' }] },
    { exempt: [{ kind: 'missing-run', file: 'a.test.mjs', reason: 'skip' }] },
    { exempt: [{ kind: 'unverified-target', file: 'a.test.mjs', reason: 'skip' }] },
  ]) {
    const res = judgeVerifyCase({ formReport: completeReport(['old/T134.test.mjs'], [stale]), subjectPolicy });
    assert.equal(res.verdict, 'UNKNOWN');
    assert.equal(res.uncertain[0].kind, 'invalid-policy');
  }

  const exemption = { kind: 'stale-header', file: 'old/T134.test.mjs', reason: 'legacy unqualified Goal header' };
  const pass = judgeVerifyCase({
    formReport: completeReport(['old/T134.test.mjs'], [stale]),
    subjectPolicy: { exempt: [exemption] },
  });
  assert.equal(pass.verdict, 'PASS');
  assert.deepEqual(pass.policyExempt, [{ finding: stale, exemption }]);
});

test('falls closed to UNKNOWN on unestablished kinds, malformed findings, and non-object inputs', () => {
  for (const kind of ['case-id', 'id-differs', 'target-missing', 'first-line', 'unestablished-kind']) {
    const finding = { file: `${kind}.test.mjs`, kind, target: 'release/G38' };
    const res = judgeVerifyCase({ formReport: completeReport([finding.file], [finding]) });
    assert.equal(res.verdict, 'UNKNOWN');
    assert.equal(res.applies, true);
    assert.deepEqual(res.findings, []);
    assert.deepEqual(res.uncertain, [finding]);
  }

  for (const badInput of [null, undefined, 'bad']) {
    const res = judgeVerifyCase(badInput);
    assert.equal(res.verdict, 'UNKNOWN');
    assert.equal(res.applies, true);
    assert.equal(res.uncertain[0].kind, 'unreadable');
  }

  for (const badFinding of [null, {}]) {
    const res = judgeVerifyCase({ formReport: completeReport(['a/T1.test.mjs'], [badFinding]) });
    assert.equal(res.verdict, 'UNKNOWN');
    assert.equal(res.applies, true);
    assert.equal(res.uncertain[0].kind, 'unreadable');
  }
});

test('applies first-line exemption and does not apply mismatched file or target exemptions', () => {
  const firstLine = { file: 'old/T134.test.mjs', kind: 'first-line', target: 'G38' };
  const firstLineExemption = { kind: 'first-line', file: 'old/T134.test.mjs', reason: 'legacy first-line annotation' };
  const firstLinePass = judgeVerifyCase({
    formReport: completeReport(['old/T134.test.mjs'], [firstLine]),
    subjectPolicy: { exempt: [firstLineExemption] },
  });
  assert.equal(firstLinePass.verdict, 'PASS');
  assert.deepEqual(firstLinePass.policyExempt, [{ finding: firstLine, exemption: firstLineExemption }]);

  const stale = { file: 'old/T134.test.mjs', kind: 'stale-header', target: 'G38' };
  const wrongFile = judgeVerifyCase({
    formReport: completeReport(['old/T134.test.mjs'], [stale]),
    subjectPolicy: { exempt: [{ kind: 'stale-header', file: 'other/T1.test.mjs', target: 'G38', reason: 'wrong file' }] },
  });
  assert.equal(wrongFile.verdict, 'FAIL');
  assert.deepEqual(wrongFile.findings, [stale]);
  assert.deepEqual(wrongFile.policyExempt, []);

  const wrongTarget = judgeVerifyCase({
    formReport: completeReport(['old/T134.test.mjs'], [stale]),
    subjectPolicy: { exempt: [{ kind: 'stale-header', file: 'old/T134.test.mjs', target: 'G39', reason: 'wrong target' }] },
  });
  assert.equal(wrongTarget.verdict, 'FAIL');
  assert.deepEqual(wrongTarget.findings, [stale]);
  assert.deepEqual(wrongTarget.policyExempt, []);
});
