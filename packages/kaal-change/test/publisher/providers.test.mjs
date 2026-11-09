import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from '@kaihacksai/kaal-hosting';
import { fileURLToPath } from 'node:url';
import { readiness } from '../../../../engineering/release/release.mjs';

test('change/T55 [change/F49]: a production installation declares every provider needed by the shipped verifier', async () => {
  const pkg = JSON.parse(await readFile(fileURLToPath(new URL('../../package.json', import.meta.url))));
  for (const provider of ['@kaihacksai/kaal-foundation', '@kaihacksai/kaal-hosting']) {
    assert.equal(pkg.dependencies?.[provider], '0.0.1', provider + ' must be installed as a production dependency');
    assert.equal(pkg.peerDependenciesMeta?.[provider]?.optional, undefined, provider + ' cannot be optional for installed verification');
  }
});

test('change/T59 [change/F19, change/F49]: Graph is an optional peer at one exact version, not a production dependency', async () => {
  const pkg = JSON.parse(await readFile(fileURLToPath(new URL('../../package.json', import.meta.url))));
  assert.equal(pkg.dependencies?.['kaal-graph'], undefined, 'Graph must not be a production dependency');
  assert.equal(pkg.peerDependencies?.['kaal-graph'], '0.0.1', 'Graph is declared as a peer at one exact version');
  assert.equal(pkg.peerDependenciesMeta?.['kaal-graph']?.optional, true, 'and the peer is optional');
  assert.equal(pkg.devDependencies?.['kaal-graph'], '0.0.1', 'Graph stays available to this package\'s own tests');
});

test('change/T57 [change/F49, change/N13]: the existing Release gate names an unavailable required verification provider before packing', async () => {
  const pkg = JSON.parse(await readFile(fileURLToPath(new URL('../../package.json', import.meta.url))));
  // Controlled registry observations, not claims of actual publication.
  const registry = { [pkg.name]: null, '@kaihacksai/kaal-foundation': ['0.0.1'],
    'kaal-graph': null, '@kaihacksai/kaal-hosting': ['0.0.1'] };
  const input = { manifest: pkg, directory: 'packages/kaal-change', registry };
  assert.deepEqual(readiness(input).findings, []);
  // Graph is an optional peer, so its absence from the registry does not block Change's release.
  const r = readiness({ ...input, registry: { ...registry, '@kaihacksai/kaal-hosting': null } });
  assert.ok(r.findings.includes('dependency @kaihacksai/kaal-hosting@0.0.1 is not on the registry; release it first'));
});
