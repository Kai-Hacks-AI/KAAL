// Case testing/T399 tests: testing/A59, testing/F173
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C80-verify-case/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T399';
export const tests = ['testing/A59', 'testing/F173'];
export const title = 'testing/A59 addresses testing/F173 and judgeVerifyCase maps case-form@1 findings verbatim without collapsing absent vs malformed attribution or turning unverified targets into FAIL';

export async function run() {
  const arch = join(ET, '12-architecture/A59-judge-verify-case/A59.md');
  assert.ok(existsSync(arch), 'A59.md is absent');
  assert.equal(norm(readFileSync(arch, 'utf8')), `${draft('A59.md')}\n`, 'A59.md differs from the draft');

  const src = join(ET, '13-source/scripts/judge-verify-case.mjs');
  assert.ok(existsSync(src), 'judge-verify-case.mjs is absent');
  assert.equal(norm(readFileSync(src, 'utf8')), `${draft('judge-verify-case.mjs')}\n`, 'judge-verify-case.mjs differs from the draft');

  const { FORM_SCHEMA, judgeVerifyCase } = await import(pathToFileURL(src).href);

  const report = (files, findings = [], extra = {}) => ({
    schema: FORM_SCHEMA,
    files,
    targets: { checked: true },
    catalog: { complete: true },
    findings,
    ...extra,
  });

  // PASS: 0 files (applies: false) and clean files (applies: true)
  const empty = judgeVerifyCase({ formReport: report([]) });
  assert.equal(empty.verdict, 'PASS');
  assert.equal(empty.applies, false);

  const ok = judgeVerifyCase({ formReport: report(['a/T1.test.mjs']) });
  assert.equal(ok.verdict, 'PASS');
  assert.equal(ok.applies, true);
  assert.deepEqual(ok.findings, []);

  // FAIL: authoritative findings preserved verbatim, keeping absent vs malformed attribution and non-callable run distinct
  for (const kind of [
    'no-id',
    'missing-id',
    'invalid-id',
    'duplicate-id',
    'absent-attribution',
    'malformed-attribution',
    'missing-run',
    'non-callable-run',
    'unknown-subject',
    'stale-header',
  ]) {
    const f = { file: `${kind}.test.mjs`, kind, detail: `detected ${kind}` };
    const res = judgeVerifyCase({ formReport: report([f.file], [f]) });
    assert.equal(res.verdict, 'FAIL', `${kind} must FAIL`);
    assert.equal(res.applies, true);
    assert.deepEqual(res.findings, [f], `${kind} must preserve checker finding verbatim`);
  }

  // UNKNOWN: unverified-target (incomplete resolver), incomplete catalog, unchecked required targets, bad/missing formReport
  const unverified = judgeVerifyCase({
    formReport: report(['legacy/T1.test.mjs'], [{ file: 'legacy/T1.test.mjs', kind: 'unverified-target', target: 'release/C35' }]),
  });
  assert.equal(unverified.verdict, 'UNKNOWN', 'unverified-target must be UNKNOWN, never PASS or false FAIL');
  assert.equal(unverified.applies, true);
  assert.equal(unverified.uncertain[0].kind, 'unverified-target');

  const incomplete = judgeVerifyCase({ formReport: report(['a/T1.test.mjs'], [], { catalog: { complete: false } }) });
  assert.equal(incomplete.verdict, 'UNKNOWN');
  assert.equal(incomplete.applies, true);

  const uncheckedReq = judgeVerifyCase({
    formReport: report(['a/T1.test.mjs'], [], { targets: { checked: false } }),
    subjectPolicy: { requireCheckedTargets: true },
  });
  assert.equal(uncheckedReq.verdict, 'UNKNOWN');

  for (const bad of [null, {}, { formReport: null }, { formReport: { schema: 'other', files: [], findings: [] } }]) {
    const u = judgeVerifyCase(bad);
    assert.equal(u.verdict, 'UNKNOWN');
    assert.equal(u.applies, true);
  }

  // FAIL outranks UNKNOWN, and subjectPolicy.exempt retains exempted findings in policyExempt rather than hiding them
  const mixed = judgeVerifyCase({
    formReport: report(
      ['a.test.mjs', 'b.test.mjs'],
      [
        { file: 'a.test.mjs', kind: 'unverified-target', target: 'release/C35' },
        { file: 'b.test.mjs', kind: 'non-callable-run', detail: 'run is number' },
      ],
    ),
  });
  assert.equal(mixed.verdict, 'FAIL');
  assert.equal(mixed.uncertain.length, 1);

  const exemptFinding = { file: 'old/T134.test.mjs', kind: 'stale-header', target: 'G38' };
  const exempted = judgeVerifyCase({
    formReport: report(['old/T134.test.mjs'], [exemptFinding]),
    subjectPolicy: { exempt: [{ kind: 'stale-header', file: 'old/T134.test.mjs' }] },
  });
  assert.equal(exempted.verdict, 'PASS');
  assert.deepEqual(exempted.policyExempt, [exemptFinding]);
}
