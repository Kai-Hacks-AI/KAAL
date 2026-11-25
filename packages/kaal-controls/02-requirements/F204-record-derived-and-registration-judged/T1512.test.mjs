// Case controls/T1512 tests: controls/F204
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs');
const load = async () => { assert.ok(existsSync(lib), 'scripts/adapter.mjs is absent'); return import(pathToFileURL(lib).href); };
const B = { x: 'real', run: 'r1', sha: 'abc' };
export const id = 'controls/T1512';
export const tests = ['controls/F204'];
export const title = 'the registration check lists a control that does not run through the adapter, a delivered path no control declares, a lagging record and an overclaim, and says UNKNOWN when it cannot read its input';
const ctl = (id, over = {}) => ({ id, status: 'running', stations: ['S:preventive'], path: `p/${id}.md`, evidence: 'UNKNOWN', ...over });
const rec = (control, over = {}) => ({ control, x: 'real', run: 'r', sha: 's', verdict: 'PASS', by: 'adapter', ...over });
export async function run() {
  const { judgeRegistration } = await load();
  const j = (o) => judgeRegistration({ controls: [], delivered: [], adapted: [], records: [], ...o });
  const clean = j({ controls: [ctl('c/CTL1')], delivered: ['c/CTL1'], adapted: ['c/CTL1'], records: [rec('c/CTL1')] });
  assert.deepEqual(clean, { verdict: 'PASS', findings: [] });
  const r = j({
    controls: [ctl('c/CTL1', { status: 'designed' }), ctl('c/CTL2', { status: 'designed' }), ctl('c/CTL3'), ctl('c/CTL4', { status: 'designed', stations: [] })],
    delivered: ['c/CTL1', 'c/CTL2', 'c/CTL3', 'c/CTL4', 'x/orphan.yml'],
    adapted: ['c/CTL2', 'c/CTL3'],
    records: [rec('c/CTL2')],
  });
  assert.equal(r.verdict, 'REPORT');
  assert.deepEqual(r.findings, ['overclaims:c/CTL3', 'record-lags:c/CTL2', 'unadapted:c/CTL1', 'unadapted:c/CTL4', 'unrecorded:x/orphan.yml'], 'findings: ' + JSON.stringify(r.findings));
  assert.equal(j({ controls: [ctl('c/CTL5')], adapted: [] }).findings.includes('unadapted:c/CTL5'), true, 'a control with a station that does not run through the adapter was not found');
  for (const bad of [{ controls: null }, { delivered: 'x' }, { adapted: undefined }, { records: {} }]) assert.equal(judgeRegistration({ controls: [], delivered: [], adapted: [], records: [], ...bad }).verdict, 'UNKNOWN', 'bad input was not UNKNOWN');
}
