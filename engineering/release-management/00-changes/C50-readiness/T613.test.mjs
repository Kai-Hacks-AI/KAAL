// Case release/T613 tests: release/CTL3
import assert from 'node:assert/strict';
import { declaration, directory, manifest, registry, judge } from './fixtures.mjs';
export const id = 'release/T613';
export const tests = ['release/CTL3'];
export const title = 'the registry decides the version and the dependencies: a published version or an unpublished dependency fails, a name the registry was not asked about is unknown and never verified, and an unknown own name is the first path';
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  const judged = (m, r) => mod.judgePackage({ manifest: m, directory, registry: r }, declaration);
  const published = judged(manifest(), registry({ '@kaihacksai/kaal-example': ['0.0.1'] }));
  assert.equal(published.result, 'failed');
  assert.deepEqual(published.findings.map((f) => f.rule), ['own-version-published']);
  const missing = judged(manifest(), registry({ '@kaihacksai/kaal-foundation': ['0.0.0'] }));
  assert.deepEqual(missing.findings.map((f) => f.rule), ['dependency-not-published']);
  assert.match(missing.findings[0].message, /@kaihacksai\/kaal-foundation/, 'the dependency is not named');
  const ranged = judged(manifest({ dependencies: { '@kaihacksai/kaal-foundation': '^0.0.1' } }), registry());
  assert.deepEqual(ranged.findings.map((f) => f.rule), ['dependency-exact']);
  const first = judged(manifest(), registry({ '@kaihacksai/kaal-example': null }));
  assert.equal(first.result, 'verified');
  assert.equal(first.path, 'first');
  const unaskedOwn = judged(manifest(), { '@kaihacksai/kaal-foundation': ['0.0.1'] });
  assert.equal(unaskedOwn.result, 'unknown');
  assert.equal(unaskedOwn.findings[0].rule, 'registry-not-asked');
  assert.equal(unaskedOwn.path, undefined, 'a path is given without an answer');
  const unaskedDep = judged(manifest(), { '@kaihacksai/kaal-example': [] });
  assert.equal(unaskedDep.result, 'unknown', 'a dependency the registry was not asked about passed');
  const failedAndUnknown = judged(manifest({ license: undefined }), { '@kaihacksai/kaal-example': [] });
  assert.equal(failedAndUnknown.result, 'failed', 'a failed finding does not outrank unknown');
}
