// Case controls/T920 tests: controls/F25
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const S = join(pkg, 'skills/kaal-controls/scripts');
const STATIONS = ['Developing', 'Collecting', 'Integrating', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing'];
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
function git(cwd, ...a) { return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }).trim(); }
function mkrepo(files) { const d = mkdtempSync(join(tmpdir(), 'c14-')); git(d, 'init', '-q', '-b', 'main'); put(d, files); git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'base'); return d; }
function put(d, files) { for (const [p, t] of Object.entries(files)) { if (t === null) { git(d, 'rm', '-q', '-f', p); continue; } mkdirSync(dirname(join(d, p)), { recursive: true }); writeFileSync(join(d, p), t); } }

export const id = 'controls/T920';
export const tests = ['controls/F25'];
export const title = 'a control declares stations; a bad entry stays listed, invalid, and names stations with a recovery';
export async function run() {

  const f = join(S, 'find-controls.mjs');
  assert.ok(existsSync(f), 'the finder is absent');
  const { findControls } = await import(pathToFileURL(f).href);
  const one = (text) => findControls([{ path: 'x/CTL1.md', text }], { stations: STATIONS }).controls[0];
  const ok = one(item({ stations: '[Integrating:preventive, Collecting:detective]' }));
  assert.equal(ok.valid, true, 'a valid stations list fails validation');
  assert.deepEqual(ok.stations, [{ station: 'Integrating', mode: 'preventive' }, { station: 'Collecting', mode: 'detective' }]);
  assert.deepEqual(one(item()).stations, [], 'no stations is not an empty list');
  assert.equal(one(item()).valid, true, 'a control without stations is invalid');
  assert.equal(one(item({ stations: '[]' })).valid, true);
  for (const bad of ['[Nowhere:preventive]', '[Integrating:blocking]', '[Integrating]', '[Integrating:preventive, Integrating:detective]', 'Integrating:preventive', '[integrating:preventive]']) {
    const r = findControls([{ path: 'x/CTL1.md', text: item({ stations: bad }) }], { stations: STATIONS });
    assert.equal(r.controls.length, 1, `stations ${bad} dropped the control`);
    const c = r.controls[0];
    assert.equal(c.valid, false, `stations ${bad} passed validation`);
    assert.equal(c.problems.length, 1);
    assert.equal(c.problems[0].field, 'stations');
    for (const w of [...STATIONS, 'detective', 'preventive']) assert.ok(c.problems[0].recovery.includes(w), `the recovery does not name ${w}`);
  }
}
