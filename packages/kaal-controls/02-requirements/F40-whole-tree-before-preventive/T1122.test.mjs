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
export const title = 'a control is proposed as plain preventive or as a ratchet from the property, a provoked RED and the whole-tree scan, and never switched';
export async function run() {
  const lib = join(S, 'scope.mjs');
  assert.ok(existsSync(lib), 'scripts/scope.mjs is absent');
  const { decideAdoption } = await import(pathToFileURL(lib).href);
  const zero = decideAdoption(ready([]));
  assert.equal(zero.verdict, 'READY', 'a clean scan was not ready');
  assert.equal(zero.as, 'preventive', 'a clean scan was not plain preventive');
  assert.equal(zero.needs, 'owner-go', 'the Owner go was not required');
  const n = decideAdoption(ready(['b', 'a', 'c']));
  assert.equal(n.verdict, 'READY');
  assert.equal(n.as, 'ratchet', 'findings were not a ratchet');
  assert.deepEqual(n.baseline, ['a', 'b', 'c'], 'the baseline was not the sorted findings');
  assert.deepEqual(n.history, { from: null, to: 3, removed: [] }, 'the first history line is wrong');
  assert.equal(n.needs, 'owner-go');
  const x = (mut) => { const r = ready(['a']); mut(r); return decideAdoption(r); };
  assert.equal(x((r) => { r.property.holds = false; }).reason, 'property-fails', 'a failing property was not named');
  assert.equal(x((r) => { r.provoked.seeded.found = false; }).reason, 'not-provoked', 'a seed that was not found passed');
  assert.equal(x((r) => { r.provoked.removed.cleared = false; }).reason, 'not-provoked', 'a finding that did not clear passed');
  assert.equal(x((r) => { r.scan.findings = ['a', 'a']; }).reason, 'unstable-findings', 'a name twice passed');
  for (const mut of [(r) => { delete r.scan; }, (r) => { delete r.provoked; }, (r) => { delete r.property; }]) assert.equal(x(mut).verdict, 'UNKNOWN', 'a missing input was not UNKNOWN');
}
