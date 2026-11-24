// Case controls/T1122 tests: controls/F40
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const ready = (scan) => ({ property: { holds: true }, provoked: { seeded: { found: true }, removed: { cleared: true } }, scan: { findings: scan } });
export const id = 'controls/T1122';
export const tests = ['controls/F40'];
export const title = 'qualification is the evidence of the property, a provoked RED and the whole-tree scan, with the findings listed for Review and no response chosen';
export async function run() {
  const lib = join(S, 'scope.mjs');
  assert.ok(existsSync(lib), 'scripts/scope.mjs is absent');
  const { qualify } = await import(pathToFileURL(lib).href);
  const zero = qualify(ready([]));
  assert.equal(zero.verdict, 'QUALIFIED', 'a clean scan was not qualified');
  assert.deepEqual(zero.findings, [], 'a clean scan listed findings');
  assert.equal(zero.needs, 'owner-go', 'the Owner go was not required');
  const n = qualify(ready(['b', 'a', 'c']));
  assert.equal(n.verdict, 'QUALIFIED');
  assert.deepEqual(n.findings, ['a', 'b', 'c'], 'the findings were not listed sorted');
  assert.equal(n.needs, 'review', 'findings did not need Review');
  for (const k of ['as', 'baseline', 'history']) assert.equal(n[k], undefined, 'qualification proposed a response: ' + k);
  const x = (mut) => { const r = ready(['a']); mut(r); return qualify(r); };
  assert.equal(x((r) => { r.property.holds = false; }).reason, 'property-fails', 'a failing property was not named');
  assert.equal(x((r) => { r.provoked.seeded.found = false; }).reason, 'not-provoked', 'a seed that was not found passed');
  assert.equal(x((r) => { r.provoked.removed.cleared = false; }).reason, 'not-provoked', 'a finding that did not clear passed');
  assert.equal(x((r) => { r.scan.findings = ['a', 'a']; }).reason, 'unstable-findings', 'a name twice passed');
  for (const mut of [(r) => { delete r.scan; }, (r) => { delete r.provoked; }, (r) => { delete r.property; }]) assert.equal(x(mut).verdict, 'UNKNOWN', 'a missing input was not UNKNOWN');
}
