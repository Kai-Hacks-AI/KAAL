// Case controls/T921 tests: controls/F25
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

export const id = 'controls/T921';
export const tests = ['controls/F25'];
export const title = 'the registry of a station is read from the base ref only, never from the working tree';
export async function run() {

  const f = join(S, 'registry.mjs');
  assert.ok(existsSync(f), 'registry.mjs is absent');
  const d = mkrepo({ 'c/CTL1-a/CTL1.md': item({ id: 'demo/CTL1', title: 'verify A', stations: '[Integrating:preventive]' }), 'c/CTL2-b/CTL2.md': item({ id: 'demo/CTL2', title: 'verify B', stations: '[Collecting:detective]' }), 'c/CTL4-d/CTL4.md': item({ id: 'demo/CTL4', title: 'verify D' }) });
  const base = git(d, 'rev-parse', 'HEAD');
  git(d, 'checkout', '-q', '-b', 'pr');
  put(d, { 'c/CTL1-a/CTL1.md': item({ id: 'demo/CTL1', title: 'verify A' }), 'c/CTL3-c/CTL3.md': item({ id: 'demo/CTL3', title: 'verify C', stations: '[Integrating:preventive]' }) });
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'pr');
  const run = (ref, station) => JSON.parse(execFileSync(process.execPath, [f, '--repo', d, '--base', ref, '--station', station, '--stations', 'Integrating,Collecting,Wiring'], { encoding: 'utf8' }));
  const at = run(base, 'Integrating');
  assert.deepEqual(at.map((c) => [c.id, c.title, c.mode, c.status]), [['demo/CTL1', 'verify A', 'preventive', 'designed']], 'the registry is not the registry of the base');
  assert.deepEqual(run(base, 'Collecting').map((c) => c.id), ['demo/CTL2']);
  assert.deepEqual(run(base, 'Wiring'), []);
  assert.deepEqual(run('pr', 'Integrating').map((c) => c.id), ['demo/CTL3'], 'a ref other than the base is not read as given');
  const bad = spawnSync(process.execPath, [f, '--repo', d, '--base', 'no-such-ref', '--station', 'Integrating', '--stations', 'Integrating,Collecting,Wiring'], { encoding: 'utf8' });
  assert.notEqual(bad.status, 0, 'an unreadable base ref gives a registry');
}
