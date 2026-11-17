// Case controls/T771 tests: controls/F19
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
const STATUSES = ['designed', 'implemented', 'running', 'tested'];
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
export const id = 'controls/T771';
export const tests = ['controls/F19'];
export const title = 'a missing, empty or other status stays listed, fails validation and the problem names the status with a recovery';
export async function run() {
  const find = await finder();
  for (const [bad, declared] of [[undefined, undefined], ['""', '""'], ['Running', 'Running'], ['defined', 'defined'], ['enforced', 'enforced'], ['proven', 'proven'], ['running, tested', 'running, tested']]) {
    const r = find([file('x/CTL1.md', item({ status: bad }))]);
    assert.equal(r.controls.length, 1, `status ${bad} dropped the control from the inventory`);
    const c = r.controls[0];
    assert.equal(c.id, 'demo/CTL1');
    assert.equal(c.title, 'verify Stages (Developing)', 'the listed control lost its other fields');
    assert.equal(c.valid, false, `status ${bad} passed validation`);
    assert.ok(!c.status || c.status === declared, 'the listing invents a status');
    assert.equal(c.rank ?? null, null, 'an invalid status has a rank');
    assert.equal(c.problems.length, 1);
    const p = c.problems[0];
    assert.equal(p.field, 'status');
    assert.match(p.reason, /status/);
    for (const s of STATUSES) assert.ok(p.recovery.includes(s), `the recovery does not name ${s}`);
    // A control that only lacks a status line is listed and invalid, but not refused: its declaration predates the status.
    assert.equal(r.refused.length, bad === undefined ? 0 : 1, bad === undefined ? 'a control that only lacks a status is refused' : 'the control is not among those that fail validation');
  }
}
