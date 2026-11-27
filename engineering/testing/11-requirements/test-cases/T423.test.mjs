// Case testing/T423 tests: testing/F177
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const pkg = process.env.KAAL_TESTING_PKG ? resolve(process.env.KAAL_TESTING_PKG) : join(repo, 'packages/kaal-testing');
const need = () => assert.ok(existsSync(join(pkg, 'lib/identity.mjs')), 'lib/identity.mjs is absent');
const kinds = (r) => r.findings.map((f) => f.kind);

export const id = 'testing/T423';
export const tests = ['testing/F177'];
export const title = 'testing/F177 checkIdentity accepts equal identities of any form, names two different ones, and refuses a missing or blank identity';

export async function run() {
  need();
  const { checkIdentity } = await import(pathToFileURL(join(pkg, 'lib/identity.mjs')).href);

  for (const id of ['d836d936'.padEnd(40, '1'), 'sha256:9f2c4a', 'tree:9f2c', 'build-2026.11.27', 'v1.4.0+meta', 'a']) {
    const r = checkIdentity({ recorded: id, examined: id });
    assert.equal(r.ok, true, `equal identities are ok whatever they look like: ${id}`);
    assert.deepEqual(r.findings, []);
  }

  const other = checkIdentity({ recorded: 'd4751363'.padEnd(40, '2'), examined: 'd836d936'.padEnd(40, '1') });
  assert.equal(other.ok, false);
  assert.deepEqual(kinds(other), ['recorded-not-examined'], 'two different identities are named');
  assert.ok(other.findings.every((f) => typeof f.detail === 'string' && f.detail.includes('d4751363') && f.detail.includes('d836d936')), 'the finding shows both identities');

  assert.deepEqual(kinds(checkIdentity({ recorded: 'ABC', examined: 'abc' })), ['recorded-not-examined'], 'no change of case: Testing does not know the format');
  assert.deepEqual(kinds(checkIdentity({ recorded: 'abc ', examined: 'abc' })), ['recorded-not-examined'], 'no trimming either');

  assert.deepEqual(kinds(checkIdentity({ recorded: 'abc' })), ['examined-identity-missing']);
  assert.deepEqual(kinds(checkIdentity({ examined: 'abc' })), ['recorded-identity-missing']);
  assert.deepEqual(kinds(checkIdentity({})), ['examined-identity-missing', 'recorded-identity-missing'], 'both named, the examined one first');
  assert.deepEqual(kinds(checkIdentity()), ['examined-identity-missing', 'recorded-identity-missing'], 'no input at all');
  for (const bad of ['', '   ', '\t\n', 42, null, {}, ['abc']]) {
    assert.deepEqual(kinds(checkIdentity({ recorded: bad, examined: 'abc' })), ['recorded-identity-missing'], `${JSON.stringify(bad)} is not an identity`);
  }
  assert.equal(checkIdentity({ recorded: '  ', examined: '  ' }).ok, false, 'two equal blank strings are not evidence of content');

  const input = Object.freeze({ recorded: 'x1', examined: 'x2' });
  assert.doesNotThrow(() => checkIdentity(input), 'a frozen input is not written to');
}
