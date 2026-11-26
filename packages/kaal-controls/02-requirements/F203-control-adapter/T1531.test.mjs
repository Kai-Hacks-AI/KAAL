// Case controls/T1531 tests: controls/F203
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const B = { x: 'real', run: 'r1', sha: 'abc' };
export const id = 'controls/T1531';
export const tests = ['controls/F203'];
export const title = 'a check that cannot judge everything keeps the discrepancies it confirmed beside UNKNOWN, and UNKNOWN still never passes';
export async function run() {
  const { runControl } = await load();
  const unknownWith = (confirmed) => () => { throw Object.assign(new Error('unknown'), { name: 'UnknownEvidence', confirmed, unknown: ['tested:c/CTL2'] }); };
  for (const mode of ['detective', 'preventive', 'ratchet']) {
    const r = await runControl({ id: 'c/CTL3', mode, check: unknownWith(['running:lags:c/CTL1', 'implemented:overclaims:c/CTL2']), input: {}, baseline: ['running:lags:c/CTL1', 'implemented:overclaims:c/CTL2'], previous: ['running:lags:c/CTL1', 'implemented:overclaims:c/CTL2'], boundary: B });
    assert.equal(r.verdict, 'UNKNOWN', `${mode}: unknown passed or was filtered by an allowance`);
    assert.equal(r.blocked, mode !== 'detective', `${mode}: unknown did not fail closed as its mode requires`);
    assert.deepEqual(r.confirmed, ['running:lags:c/CTL1', 'implemented:overclaims:c/CTL2'], `${mode}: confirmed discrepancies were dropped beside unknown`);
    assert.equal(r.log.confirmed, 2, `${mode}: the log does not carry the number of confirmed discrepancies`);
    assert.equal(r.record.verdict, 'UNKNOWN', `${mode}: the record does not say unknown`);
  }
  for (const bad of ['x', [1], [null], undefined, {}]) {
    const r = await runControl({ id: 'c/CTL3', mode: 'preventive', check: unknownWith(bad), input: {}, boundary: B });
    assert.equal(r.verdict, 'UNKNOWN', 'a malformed confirmed changed the verdict');
    assert.equal(r.confirmed, undefined, 'a malformed confirmed was carried: ' + JSON.stringify(bad));
  }
  const plain = await runControl({ id: 'c/CTL3', mode: 'preventive', check: () => { throw new Error('x'); }, input: {}, boundary: B });
  assert.equal(plain.confirmed, undefined, 'a plain throw carried confirmed');
  const ok = await runControl({ id: 'c/CTL3', mode: 'preventive', check: () => ['a'], input: {}, boundary: B });
  assert.equal(ok.confirmed, undefined, 'a judged run carried confirmed');
}
