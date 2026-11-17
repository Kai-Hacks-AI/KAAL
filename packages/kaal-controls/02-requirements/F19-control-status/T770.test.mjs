// Case controls/T770 tests: controls/F19
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
export const id = 'controls/T770';
export const tests = ['controls/F19'];
export const title = 'each of the four statuses is listed on a valid control with its rank, and a tested control is also running';
export async function run() {
  const find = await finder();
  const ranks = [];
  for (const s of STATUSES) {
    const r = find([file('x/CTL1.md', item({ status: s }))]);
    assert.equal(r.controls.length, 1, `a ${s} control was not listed`);
    const c = r.controls[0];
    assert.equal(c.status, s);
    assert.equal(c.valid, true, `a ${s} control was not valid`);
    assert.deepEqual(c.problems, []);
    ranks.push(c.rank);
  }
  assert.deepEqual(ranks, [1, 2, 3, 4], 'the ranks do not follow designed, implemented, running, tested');
  assert.ok(ranks[3] >= ranks[2], 'a tested control does not rank as running');
}
