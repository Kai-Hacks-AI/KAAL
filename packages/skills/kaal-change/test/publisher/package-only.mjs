// Publisher integration probe. The caller packs once and supplies its manifest.
// Local file overrides substitute reviewed artifacts for registry transport only;
// npm still resolves Change's real production dependency declarations itself.
import assert from 'node:assert/strict';
import { join, isAbsolute } from 'node:path';
import { readFile, initialize, execute, kind } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { verification } from '../../../../../engineering/release/release.mjs';

const [manifestPath, host] = process.argv.slice(2);
assert.ok(manifestPath && host && isAbsolute(manifestPath) && isAbsolute(host),
  'usage: node package-only.mjs <absolute packed-manifest.json> <absolute fresh consumer directory>');
assert.equal(await kind(host), 'missing', 'consumer must be fresh');
const packed = JSON.parse(await readFile(manifestPath));
const name = '@kaihacksai/kaal-change';
const providers = ['@kaihacksai/kaal-foundation', 'kaal-graph', 'kaal-hosting'];
for (const p of [name, ...providers]) {
  assert.ok(packed[p]?.tarball && packed[p]?.sha256 && packed[p]?.integrity, p + ' needs a caller-packed artifact');
  assert.equal(sha256(await readFile(packed[p].tarball)), packed[p].sha256, p + ' artifact differs from the manifest');
}
const overrides = Object.fromEntries(providers.map(p => [p, 'file:' + packed[p].tarball.replaceAll('\\', '/')]));
await initialize(host, { 'package.json': Buffer.from(JSON.stringify({ name: 'change-package-only-consumer',
  version: '1.0.0', private: true, overrides }, null, 2) + '\n') });
const inherited = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^npm_config_cache$/i.test(k)));
const env = { ...inherited, npm_config_cache: join(host, '.cache'), npm_config_audit: 'false',
  npm_config_fund: 'false', npm_config_update_notifier: 'false' };
const args = ['install', '--omit=dev', packed[name].tarball];
const installed = await execute('npm', args, { cwd: host, env });
assert.equal(installed.status, 0, installed.stdout + installed.stderr);
const candidate = join(host, 'node_modules', ...name.split('/'));
const declared = JSON.parse(await readFile(join(candidate, 'test/verify.json'))).cases;
const observed = await execute('npm', ['explore', name, '--', 'npm', 'test'], { cwd: host, env });
const result = verification(observed.stdout, name, { status: observed.status, declared });
console.log(JSON.stringify({ case: 'change/T56', scope: 'controlled-local-artifact-transport', host,
  requested: [name], npmArgs: args, initiallyEmptyCache: true, verification: result,
  limits: ['Registry publication, registry availability and publisher provenance are not established.'] }, null, 2));
assert.equal(result.result, 'verified', 'package-only installed verification: ' + (result.cause ?? observed.stdout + observed.stderr));
const held = JSON.parse(await readFile(join(host, 'node_modules/.package-lock.json'))).packages;
for (const p of [name, ...providers]) {
  assert.equal(held['node_modules/' + p]?.integrity, packed[p].integrity, p + ' must be the caller-packed artifact');
}
for (const p of ['kaal-core', 'kaal-testing', 'kaal-engineer-skill'])
  assert.equal(held['node_modules/' + p], undefined, 'production verification must not require development provider ' + p);
