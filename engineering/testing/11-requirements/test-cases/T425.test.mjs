// Case testing/T425 tests: testing/F177
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/identity.mjs')), 'lib/identity.mjs is absent');
const call = (args) => spawnSync(process.execPath, [join(pkg, 'bin/kaal-testing.mjs'), 'observe-at', ...args], { encoding: 'utf8' });

export const id = 'testing/T425';
export const tests = ['testing/F177'];
export const title = 'testing/F177 the command observe-at takes identities that are not Git ids, names a recorded identity that is not the examined one, and exits 2 writing nothing when one is missing';

export async function run() {
  need();
  const root = mkdtempSync(join(tmpdir(), 'kaal-c84-cli-'));
  try {
    writeFileSync(join(root, 'T1.test.mjs'), "export const id = 'x/T1';\nexport const tests = ['x/F1'];\nexport async function run() {}\n");
    const common = ['--root', root, '--run-id', 'r1', '--produced-by', 'test'];

    const same = join(root, 'same');
    const good = call([...common, '--revision', 'tree:9f2c', '--expect-revision', 'tree:9f2c', '--out', same, 'T1.test.mjs']);
    assert.equal(good.status, 0, good.stderr);
    const rec = JSON.parse(readFileSync(join(same, 'observation.json'), 'utf8'));
    assert.deepEqual(rec.observed, { 'x/T1': 'GREEN' }, 'an identity that is not a Git id works');
    assert.deepEqual(rec.evidence.integrity, []);

    const diff = join(root, 'diff');
    const bad = call([...common, '--revision', 'build-2026.11.26', '--expect-revision', 'build-2026.11.27', '--out', diff, 'T1.test.mjs']);
    assert.equal(bad.status, 0, 'a record of other content is a result, not an error');
    const r2 = JSON.parse(readFileSync(join(diff, 'observation.json'), 'utf8'));
    assert.deepEqual(r2.observed, { 'x/T1': 'UNKNOWN' });
    assert.deepEqual(r2.evidence.integrity.map((f) => f.kind), ['recorded-not-examined']);

    const none = join(root, 'none');
    mkdirSync(none);
    assert.equal(call([...common, '--expect-revision', 'tree:9f2c', '--out', none, 'T1.test.mjs']).status, 2, 'a missing --revision is invalid input');
    assert.equal(call([...common, '--revision', 'tree:9f2c', '--out', none, 'T1.test.mjs']).status, 2, 'a missing --expect-revision is invalid input');
    assert.equal(existsSync(join(none, 'observation.json')), false, 'invalid input writes nothing');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
