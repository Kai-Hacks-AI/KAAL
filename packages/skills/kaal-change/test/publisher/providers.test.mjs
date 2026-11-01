import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'kaal-hosting';
import { fileURLToPath } from 'node:url';
import { readiness } from '../../../../../engineering/release/release.mjs';

test('change/T55 [change/F49]: a production installation declares every provider needed by the shipped verifier', async () => {
  const pkg = JSON.parse(await readFile(fileURLToPath(new URL('../../package.json', import.meta.url))));
  for (const provider of ['@kaihacksai/kaal-foundation', 'kaal-graph', 'kaal-hosting']) {
    assert.equal(pkg.dependencies?.[provider], '0.0.1', provider + ' must be installed as a production dependency');
    assert.equal(pkg.peerDependenciesMeta?.[provider]?.optional, undefined, provider + ' cannot be optional for installed verification');
  }
});

test('change/T57 [change/F49, change/N13]: the existing Release gate names an unavailable required verification provider before packing', async () => {
  const pkg = JSON.parse(await readFile(fileURLToPath(new URL('../../package.json', import.meta.url))));
  // Controlled registry observations, not claims of actual publication.
  const registry = { [pkg.name]: null, '@kaihacksai/kaal-foundation': ['0.0.1'],
    'kaal-graph': ['0.0.1'], 'kaal-hosting': ['0.0.1'] };
  const input = { manifest: pkg, directory: 'packages/skills/kaal-change', registry };
  assert.deepEqual(readiness(input).findings, []);
  for (const provider of ['kaal-graph', 'kaal-hosting']) {
    const r = readiness({ ...input, registry: { ...registry, [provider]: null } });
    assert.ok(r.findings.includes('dependency ' + provider + '@0.0.1 is not on the registry; release it first'));
  }
});
