// Case testing/T426 tests: testing/F176
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');

const LIB = 'export const add = (a, b) => a + b;\nexport const unused = (x) => x * 2;\n';
const CASE1 = "import assert from 'node:assert/strict';\nimport { add } from './src/lib.mjs';\nexport const id = 'x/T1';\nexport const tests = ['x/F1'];\nexport async function run() { assert.equal(add(1, 2), 3); }\n";
const mutant = (id, find, replace, cases = ['T1.test.mjs'], file = 'src/lib.mjs') => ({ id, file, find, replace, cases });
const spec = (mutants) => ({ schema: 'kaal-testing/mutants@1', mutants });

export const id = 'testing/T426';
export const tests = ['testing/F176'];
export const title = 'testing/F176 the command mutate with --strict exits 1 after writing the same record when a patch does not apply, a weakening survives or a mutant says nothing, exits 0 only when every mutant is killed, and changes nothing without the flag';

export async function run() {
  assert.ok(existsSync(join(pkg, 'lib/mutate.mjs')), 'lib/mutate.mjs is absent');
  const root = mkdtempSync(join(tmpdir(), 'kaal-c83-strict-'));
  try {
    mkdirSync(join(root, 'src'));
    writeFileSync(join(root, 'src/lib.mjs'), LIB);
    writeFileSync(join(root, 'T1.test.mjs'), CASE1);
    const call = (name, mutants, ...extra) => {
      const specFile = join(root, `${name}.json`);
      writeFileSync(specFile, JSON.stringify(spec(mutants)));
      const out = join(root, `out-${name}-${extra.join('') || 'plain'}`);
      const r = spawnSync(process.execPath, [join(pkg, 'bin/kaal-testing.mjs'), 'mutate', '--root', root, '--spec', specFile, '--out', out, '--timeout', '4000', ...extra], { encoding: 'utf8' });
      const rec = existsSync(join(out, 'mutation-report.json')) ? JSON.parse(readFileSync(join(out, 'mutation-report.json'), 'utf8')) : undefined;
      return { status: r.status, rec, stderr: r.stderr };
    };

    const killed = [mutant('K', 'a + b', 'a - b')];
    const ok = call('killed', killed, '--strict');
    assert.equal(ok.status, 0, `every mutant killed: ${ok.stderr}`);
    assert.equal(ok.rec.complete, true);

    const weak = [mutant('K', 'a + b', 'a - b'), mutant('S', 'x * 2', 'x * 3')];
    const survived = call('weak', weak, '--strict');
    assert.equal(survived.status, 1, 'a weakening that no Case catches fails under --strict');
    assert.deepEqual(survived.rec.survivors, ['S'], 'the record is written and names it');

    const missing = call('absent', [mutant('M', 'a * b', 'a / b')], '--strict');
    assert.equal(missing.status, 1, 'a patch that does not apply fails under --strict');
    assert.equal(missing.rec.mutants[0].outcome, 'invalid', 'and the record says invalid, not survived');

    const unresolved = call('unresolved', [mutant('U', 'export const add', 'export const add = ;')], '--strict');
    assert.equal(unresolved.status, 1, 'a mutant that says nothing fails under --strict');
    assert.equal(unresolved.rec.mutants[0].outcome, 'unresolved');

    for (const [name, mutants] of [['weak', weak], ['absent', [mutant('M', 'a * b', 'a / b')]], ['unresolved', [mutant('U', 'export const add', 'export const add = ;')]]]) {
      const plain = call(name, mutants);
      assert.equal(plain.status, 0, `without --strict the exit stays 0: ${name}`);
      const strict = call(name, mutants, '--strict');
      assert.deepEqual(plain.rec, strict.rec, `--strict changes only the exit code, not the record: ${name}`);
    }

    writeFileSync(join(root, 'T1.test.mjs'), CASE1.replace('add(1, 2), 3', 'add(1, 2), 4'));
    const badBase = call('badbase', killed, '--strict');
    assert.equal(badBase.status, 1, 'a baseline that is not ok fails under --strict');
    assert.equal(badBase.rec.baseline.ok, false);
    writeFileSync(join(root, 'T1.test.mjs'), CASE1);

    const bad = join(root, 'bad.json');
    writeFileSync(bad, JSON.stringify({ schema: 'kaal-testing/mutants@1', mutants: [] }));
    const none = join(root, 'none');
    const inv = spawnSync(process.execPath, [join(pkg, 'bin/kaal-testing.mjs'), 'mutate', '--root', root, '--spec', bad, '--out', none, '--strict'], { encoding: 'utf8' });
    assert.equal(inv.status, 2, 'an invalid spec is still 2 under --strict');
    assert.equal(existsSync(join(none, 'mutation-report.json')), false, 'and writes nothing');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
