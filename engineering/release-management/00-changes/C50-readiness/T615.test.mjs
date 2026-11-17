// Case release/T615 tests: release/CTL3
import assert from 'node:assert/strict';
import { declaration, directory, manifest, registry, judge } from './fixtures.mjs';
export const id = 'release/T615';
export const tests = ['release/CTL3'];
export const title = 'the version rule is Semantic Versioning: no leading zeros, valid prerelease identifiers, no build suffix, for the package and for an exact dependency';
const VALID = ['0.0.1', '1.2.3', '10.20.30', '1.0.0-rc.1', '1.0.0-0', '1.0.0-alpha-1', '1.0.0-0a'];
const INVALID = ['01.2.3', '1.02.3', '1.2.03', '1.2', '1.2.3.4', '1.2.3-', '1.2.3-01', '1.2.3-a..b', '1.2.3-a.', '1.2.3+build', 'v1.2.3', ''];
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  const own = (v) => mod.judgePackage({ manifest: manifest({ version: v }), directory, registry: registry() }, declaration).findings.map((f) => f.rule);
  for (const v of VALID) assert.ok(!own(v).includes('version'), `${v} is refused as the version`);
  for (const v of INVALID) assert.ok(own(v).includes('version'), `${JSON.stringify(v)} is accepted as the version`);
  const dep = (v) => mod.judgePackage({ manifest: manifest({ dependencies: { '@kaihacksai/kaal-foundation': v } }), directory, registry: registry({ '@kaihacksai/kaal-foundation': [v] }) }, declaration).findings.map((f) => f.rule);
  for (const v of VALID) assert.ok(!dep(v).includes('dependency-exact'), `${v} is refused as an exact dependency`);
  for (const v of INVALID.filter((x) => x)) assert.ok(dep(v).includes('dependency-exact'), `${JSON.stringify(v)} is accepted as an exact dependency`);
}
