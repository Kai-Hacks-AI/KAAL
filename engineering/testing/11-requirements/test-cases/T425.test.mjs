// Case testing/T425 tests: testing/F177
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/revision.mjs')), 'lib/revision.mjs is absent');
const HEAD = 'd836d936'.padEnd(40, '1');
const MERGE = 'd4751363'.padEnd(40, '2');
const call = (args) => spawnSync(process.execPath, [join(pkg, 'bin/kaal-testing.mjs'), 'observe-at', ...args], { encoding: 'utf8' });

export const id = 'testing/T425';
export const tests = ['testing/F177'];
export const title = 'testing/F177 the command observe-at takes --trigger-revision, names the trigger when it was recorded, and exits 2 writing nothing for a value that is not a revision';

export async function run() {
  need();
  const root = mkdtempSync(join(tmpdir(), 'kaal-c84-cli-'));
  try {
    writeFileSync(join(root, 'T1.test.mjs'), "export const id = 'x/T1';\nexport const tests = ['x/F1'];\nexport async function run() {}\n");
    const common = ['--root', root, '--run-id', 'r1', '--produced-by', 'test'];

    const ok = join(root, 'ok');
    const good = call([...common, '--revision', HEAD, '--expect-revision', HEAD, '--trigger-revision', MERGE, '--out', ok, 'T1.test.mjs']);
    assert.equal(good.status, 0, good.stderr);
    const rec = JSON.parse(readFileSync(join(ok, 'observation.json'), 'utf8'));
    assert.deepEqual(rec.observed, { 'x/T1': 'GREEN' });
    assert.deepEqual(rec.evidence.integrity, []);

    const d20 = join(root, 'd20');
    const bad = call([...common, '--revision', MERGE, '--expect-revision', HEAD, '--trigger-revision', MERGE, '--out', d20, 'T1.test.mjs']);
    assert.equal(bad.status, 0, 'a record that names the trigger is a result, not an error');
    const r2 = JSON.parse(readFileSync(join(d20, 'observation.json'), 'utf8'));
    assert.deepEqual(r2.observed, { 'x/T1': 'UNKNOWN' });
    assert.deepEqual(r2.evidence.integrity.map((f) => f.kind), ['recorded-is-trigger']);

    const none = join(root, 'none');
    mkdirSync(none);
    const inv = call([...common, '--revision', HEAD, '--expect-revision', HEAD, '--trigger-revision', 'd4751', '--out', none, 'T1.test.mjs']);
    assert.equal(inv.status, 2, 'an abbreviation as --trigger-revision is invalid input');
    assert.equal(existsSync(join(none, 'observation.json')), false, 'invalid input writes nothing');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
