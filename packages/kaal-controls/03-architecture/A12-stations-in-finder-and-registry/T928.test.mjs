// Case controls/T928 tests: controls/A12
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

export const id = 'controls/T928';
export const tests = ['controls/A12'];
export const title = 'the Skill points at the enforcing reference, stays within its cap, and the reference says what a station and its registry are';
export async function run() {
  const sk = join(pkg, 'skills/kaal-controls');
  const text = readFileSync(join(sk, 'SKILL.md'), 'utf8');
  assert.ok(text.split(/\s+/).filter(Boolean).length <= 600, 'SKILL.md is over its cap');
  assert.match(text, /enforcing-controls\.md/, 'SKILL.md does not point at the enforcing reference');
  const ref = join(sk, 'references/enforcing-controls.md');
  assert.ok(existsSync(ref), 'the enforcing reference is absent');
  const r = readFileSync(ref, 'utf8');
  for (const w of ['stations', 'registry', 'Merging', 'base', 'preventive', 'detective']) assert.ok(r.includes(w), `the reference does not say ${w}`);
  assert.ok(!/Kai-Hacks|engineering\//.test(r), 'the reference knows the repository');
}
