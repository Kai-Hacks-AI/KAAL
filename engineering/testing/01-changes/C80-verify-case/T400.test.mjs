// Case testing/T400 tests: testing/F173
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const SRC = join(ET, '13-source/scripts/judge-verify-case.mjs');

export const id = 'testing/T400';
export const tests = ['testing/F173'];
export const title = 'the judge-verify-case CLI reads case-form@1 reports and exits 0 on PASS, 1 on FAIL (malformed attribution or non-callable run), and 2 on UNKNOWN (unverified target or missing report)';

export async function run() {
  assert.ok(existsSync(SRC), 'judge-verify-case.mjs is absent');
  const base = mkdtempSync(join(tmpdir(), 'c80-cli-'));
  try {
    const cli = (...args) => spawnSync(process.execPath, [SRC, ...args], { encoding: 'utf8' });
    mkdirSync(base, { recursive: true });

    const write = (name, obj) => {
      const p = join(base, name);
      writeFileSync(p, JSON.stringify(obj));
      return p;
    };

    const okPath = write('ok.json', {
      schema: 'kaal-testing/case-form@1',
      files: ['a/T1.test.mjs'],
      targets: { checked: true },
      catalog: { complete: true },
      findings: [],
    });
    const rOk = cli('--report', okPath);
    assert.equal(rOk.status, 0, rOk.stdout + rOk.stderr);
    assert.match(rOk.stdout, /^PASS:/);

    const failPath = write('fail.json', {
      schema: 'kaal-testing/case-form@1',
      files: ['a/T2.test.mjs', 'a/T3.test.mjs'],
      targets: { checked: true },
      catalog: { complete: true },
      findings: [
        { file: 'a/T2.test.mjs', kind: 'malformed-attribution', detail: 'tests entry foo is not a literal' },
        { file: 'a/T3.test.mjs', kind: 'non-callable-run', detail: 'run is not a function' },
      ],
    });
    const rFail = cli('--report', failPath);
    assert.equal(rFail.status, 1, rFail.stdout + rFail.stderr);
    assert.match(rFail.stdout, /^FAIL:.*malformed-attribution.*non-callable-run/);

    const unknownPath = write('unknown.json', {
      schema: 'kaal-testing/case-form@1',
      files: ['a/T4.test.mjs'],
      targets: { checked: true },
      catalog: { complete: true },
      findings: [{ file: 'a/T4.test.mjs', kind: 'unverified-target', target: 'release/C35' }],
    });
    const rUnk = cli('--report', unknownPath);
    assert.equal(rUnk.status, 2, rUnk.stdout + rUnk.stderr);
    assert.match(rUnk.stdout, /^UNKNOWN:.*unverified-target/);

    const rMissing = cli('--report', join(base, 'absent.json'));
    assert.equal(rMissing.status, 2, rMissing.stdout + rMissing.stderr);
    assert.match(rMissing.stdout, /^UNKNOWN:/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}
