// Case controls/T1511 tests: controls/F204
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const B = { x: 'real', run: 'r1', sha: 'abc' };
export const id = 'controls/T1511';
export const tests = ['controls/F204'];
export const title = 'the status the evidence shows is derived, and a claim that lags it or overclaims it is a finding';
const rec = (over = {}) => ({ control: 'c/CTL1', x: 'real', run: 'r1', sha: 'abc', verdict: 'PASS', by: 'adapter', ...over });
export async function run() {
  const { deriveStatus } = await load();
  const d = (declared, records, evidence = 'UNKNOWN') => deriveStatus({ id: 'c/CTL1', declared, records, evidence });
  assert.deepEqual(d('designed', [rec()]), { claimed: 'designed', derived: 'running', finding: 'record-lags' }, 'a record that lags was not found');
  assert.deepEqual(d('running', [rec()]), { claimed: 'running', derived: 'running', finding: null });
  assert.deepEqual(d('running', []), { claimed: 'running', derived: 'designed', finding: 'overclaims' }, 'a running claim with no run was accepted');
  assert.equal(d('tested', [rec()], 'UNKNOWN').finding, 'overclaims', 'a tested claim without the evidence was accepted');
  assert.deepEqual(d('designed', [rec()], 'PASS'), { claimed: 'designed', derived: 'tested', finding: 'record-lags' });
  assert.equal(d('implemented', []).finding, null, 'implemented is never a finding by itself');
  assert.equal(d('designed', []).finding, null);
  for (const nothing of [rec({ verdict: 'UNKNOWN' }), rec({ control: 'c/CTL2' }), rec({ by: '' }), rec({ x: 'fixture' })]) assert.equal(d('designed', [nothing]).derived, 'designed', 'a record that counts for nothing counted: ' + JSON.stringify(nothing));
}
