// Case controls/T922 tests: controls/F26
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

export const id = 'controls/T922';
export const tests = ['controls/F26'];
export const title = 'a verdict is PASS or FAIL only when the control says so exactly; everything else is UNKNOWN and the others still run';
export async function run() {

  const f = join(S, 'judge.mjs');
  assert.ok(existsSync(f), 'judge.mjs is absent');
  const { runControls } = await import(pathToFileURL(f).href);
  assert.equal(typeof runControls, 'function', 'judge.mjs exports no runControls');
  const registry = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((k) => ({ id: `demo/CTL${k}`, title: k, mode: 'preventive', path: `${k}/CTL.md` }));
  const answers = { a: { verdict: 'PASS' }, b: { verdict: 'FAIL', detail: 'not pure' }, c: { verdict: 'pass' }, d: 'PASS', e: undefined, f: { verdict: 'UNKNOWN' }, g: 'throw', h: { verdict: 'PASS' } };
  const out = await runControls({ registry, head: 'h1', station: 'Integrating', run: async (c) => { const a = answers[c.title]; if (a === 'throw') throw new Error('boom'); return a; } });
  assert.deepEqual(out.map((v) => v.verdict), ['PASS', 'FAIL', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'PASS']);
  assert.equal(out[1].detail, 'not pure');
  for (const v of out) { assert.equal(v.station, 'Integrating'); assert.equal(v.head, 'h1'); assert.equal(v.mode, 'preventive'); assert.match(v.control, /^demo\/CTL[a-h]$/); }
  assert.equal(out.length, 8, 'a failing control stopped the others');
}
