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
export const title = 'the judge-verify-case CLI exits 0 on valid trees (ignoring template strings), 1 on unattributed Cases or stale headers, and 2 when --root cannot be read';

export async function run() {
  assert.ok(existsSync(SRC), 'judge-verify-case.mjs is absent');
  const base = mkdtempSync(join(tmpdir(), 'c80-cli-'));
  try {
    const cli = (...args) => spawnSync(process.execPath, [SRC, ...args], { encoding: 'utf8' });

    // Valid tree, including a Case with an indented template string containing `export const tests = [...]` before the real export
    const good = join(base, 'good');
    mkdirSync(good, { recursive: true });
    writeFileSync(join(good, 'F1.md'), '---\nid: demo/F1\n---\n# F1\n');
    writeFileSync(
      join(good, 'T1.test.mjs'),
      "// Case demo/T1 tests: demo/F1\nconst tmpl = (ts) => `\n  export const tests = [${ts.join(',')}];\n`;\nexport const id = 'demo/T1';\nexport const tests = ['demo/F1'];\nexport async function run() { return tmpl([]); }\n",
    );
    const ok = cli('--root', good);
    assert.equal(ok.status, 0, ok.stdout + ok.stderr);
    assert.match(ok.stdout, /^PASS:/);

    // Unattributed Case (tests = []) -> exit 1
    const unattr = join(base, 'unattributed');
    mkdirSync(unattr, { recursive: true });
    writeFileSync(join(unattr, 'F1.md'), '---\nid: demo/F1\n---\n# F1\n');
    writeFileSync(join(unattr, 'T2.test.mjs'), "export const id = 'demo/T2';\nexport const tests = [];\nexport function run() {}\n");
    const rUnattr = cli('--root', unattr);
    assert.equal(rUnattr.status, 1, rUnattr.stdout + rUnattr.stderr);
    assert.match(rUnattr.stdout, /^FAIL:.*unattributed-case/);

    // Stale line-1 header -> exit 1
    const stale = join(base, 'stale');
    mkdirSync(stale, { recursive: true });
    writeFileSync(join(stale, 'F1.md'), '---\nid: demo/F1\n---\n# F1\n');
    writeFileSync(join(stale, 'T3.test.mjs'), "// Case demo/T99 tests: demo/F1\nexport const id = 'demo/T3';\nexport const tests = ['demo/F1'];\nexport function run() {}\n");
    const rStale = cli('--root', stale);
    assert.equal(rStale.status, 1, rStale.stdout + rStale.stderr);
    assert.match(rStale.stdout, /^FAIL:.*stale-header/);

    // Missing --root -> exit 2 (UNKNOWN)
    const missing = cli('--root', join(base, 'does-not-exist'));
    assert.equal(missing.status, 2, missing.stdout + missing.stderr);
    assert.match(missing.stdout, /^UNKNOWN:/);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}
