// Case controls/T926 tests: controls/N9
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

export const id = 'controls/T926';
export const tests = ['controls/N9'];
export const title = 'the App manifest asks for Checks and Pull requests write only, no event, not public, and names no project';
export async function run() {

  const p = join(pkg, 'enforcement/app-manifest.json');
  assert.ok(existsSync(p), 'the App manifest is absent');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  assert.deepEqual(m.default_permissions, { checks: 'write', pull_requests: 'write' });
  assert.deepEqual(m.default_events ?? [], [], 'the App subscribes to an event');
  assert.equal(m.hook_attributes?.active, false, 'the App receives webhooks');
  assert.equal(m.public, false);
  assert.ok(!/kaal|Kai-Hacks/i.test(readFileSync(p, 'utf8')), 'the package names a project');
}
