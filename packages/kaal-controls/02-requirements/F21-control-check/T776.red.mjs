// Case controls/T776 tests: controls/F21
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
const CHECK = join(dir, 'skills/kaal-controls/scripts/check-controls.mjs');
export const id = 'controls/T776';
export const tests = ['controls/F21'];
export const title = 'the check names the path, the id and the status of a declaration that fails, and tells how to recover without choosing a value';
export async function run() {
  assert.ok(existsSync(CHECK), 'the product check is absent');
  const { checkControls } = await import(pathToFileURL(CHECK).href);
  const ok = checkControls([file('x/CTL1.md', item())]);
  assert.equal(ok.ok, true, 'a valid control failed the check');
  assert.deepEqual(ok.problems, []);
  for (const bad of [undefined, 'Running', 'enforced']) {
    const r = checkControls([file('x/CTL1.md', item({ status: bad }))]);
    assert.equal(r.ok, false, `status ${bad} passed the check`);
    assert.equal(r.problems.length, 1);
    const p = r.problems[0];
    assert.equal(p.path, 'x/CTL1.md');
    assert.equal(p.id, 'demo/CTL1');
    assert.match(p.reason, /status/);
    for (const s of STATUSES) assert.ok(p.recovery.includes(s), `the recovery does not name ${s}`);
    assert.match(p.recovery, /declaring-controls\.md/, 'the recovery does not point at the reference');
  }
}
