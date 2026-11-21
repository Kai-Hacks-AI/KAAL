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
export const title = 'testing/A59 addresses testing/F173 and judgeVerifyCase catches missing-id, invalid-id, unattributed-case, unknown-subject, stale-header, duplicate-id, missing-run, and UNKNOWN';

export async function run() {
  const arch = join(ET, '12-architecture/A59-judge-verify-case/A59.md');
  assert.ok(existsSync(arch), 'A59.md is absent');
  assert.equal(norm(readFileSync(arch, 'utf8')), `${draft('A59.md')}\n`, 'A59.md differs from the draft');

  const src = join(ET, '13-source/scripts/judge-verify-case.mjs');
  assert.ok(existsSync(src), 'judge-verify-case.mjs is absent');
  assert.equal(norm(readFileSync(src, 'utf8')), `${draft('judge-verify-case.mjs')}\n`, 'judge-verify-case.mjs differs from the draft');

  const { judgeVerifyCase } = await import(pathToFileURL(src).href);

  // PASS cases: empty (applies: false) and valid single/double-quoted Cases (applies: true)
  const empty = judgeVerifyCase({ cases: [], knownIds: ['x/F1'] });
  assert.equal(empty.verdict, 'PASS');
  assert.equal(empty.applies, false);

  const validSingle = `// Case x/T1 tests: x/F1\nexport const id = 'x/T1';\nexport const tests = ['x/F1'];\nexport async function run() {}\n`;
  const validDouble = `export const id = "x/T2";\nexport const tests = ["x/F1"];\nexport const run = () => {};\n`;
  const passRes = judgeVerifyCase({ cases: [{ path: 'T1.test.mjs', text: validSingle }, { path: 'T2.test.mjs', text: validDouble }], knownIds: ['x/F1'] });
  assert.equal(passRes.verdict, 'PASS');
  assert.equal(passRes.applies, true);
  assert.deepEqual(passRes.findings, []);

  // FAIL rules
  const cases = [
    ['missing-id', "export const tests = ['x/F1'];\nexport function run() {}\n"],
    ['invalid-id', "export const id = 'bad-id';\nexport const tests = ['x/F1'];\nexport function run() {}\n"],
    ['unattributed-case', "export const id = 'x/T3';\nexport const tests = [];\nexport function run() {}\n"],
    ['unknown-subject(x/F99)', "export const id = 'x/T4';\nexport const tests = ['x/F99'];\nexport function run() {}\n"],
    ['stale-header', "// Case x/T99 tests: x/F1\nexport const id = 'x/T5';\nexport const tests = ['x/F1'];\nexport function run() {}\n"],
    ['missing-run', "export const id = 'x/T6';\nexport const tests = ['x/F1'];\n"],
  ];
  for (const [rule, text] of cases) {
    const r = judgeVerifyCase({ cases: [{ path: `${rule}.test.mjs`, text }], knownIds: ['x/F1'] });
    assert.equal(r.verdict, 'FAIL', `${rule} must FAIL`);
    assert.equal(r.applies, true);
    assert.ok(r.findings[0].rules.includes(rule), `expected rule ${rule}, got ${JSON.stringify(r.findings)}`);
  }

  // duplicate-id
  const dup = judgeVerifyCase({
    cases: [{ path: 'a/T1.test.mjs', text: validSingle }, { path: 'b/T1.test.mjs', text: validSingle }],
    knownIds: ['x/F1'],
  });
  assert.equal(dup.verdict, 'FAIL');
  assert.ok(dup.findings.some((f) => f.path === 'b/T1.test.mjs' && f.rules.includes('duplicate-id')));

  // UNKNOWN & FAIL outranking UNKNOWN
  for (const bad of [null, undefined, {}, { cases: 'nope' }, { cases: [{ path: '', text: '' }] }, { cases: [{ path: 'a.mjs', text: null }] }]) {
    const u = judgeVerifyCase(bad);
    assert.equal(u.verdict, 'UNKNOWN', `unusable input must be UNKNOWN: ${JSON.stringify(bad)}`);
    assert.equal(u.applies, true);
  }
  const mixed = judgeVerifyCase({
    cases: [{ path: 'bad-entry.mjs', text: null }, { path: 'unattributed.test.mjs', text: "export const id = 'x/T9';\nexport const tests = [];\nexport function run() {}\n" }],
    knownIds: ['x/F1'],
  });
  assert.equal(mixed.verdict, 'FAIL', 'FAIL must outrank UNKNOWN');
}
