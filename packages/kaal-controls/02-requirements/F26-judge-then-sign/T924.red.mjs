// Case controls/T924 tests: controls/F26
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

export const id = 'controls/T924';
export const tests = ['controls/F26'];
export const title = 'verdicts become one check per registered control on the exact head; only PASS is success';
export async function run() {

  const f = join(S, 'sign.mjs');
  assert.ok(existsSync(f), 'sign.mjs is absent');
  const { signedChecks } = await import(pathToFileURL(f).href);
  assert.equal(typeof signedChecks, 'function', 'sign.mjs exports no signedChecks');
  const registry = [['A', 'approve Sync'], ['B', 'verify Sync'], ['C', 'review Sync'], ['D', 'lint'], ['E', 'other']].map(([k, t]) => ({ id: `demo/CTL${k}`, title: t, mode: 'preventive' }));
  const v = (k, verdict, head = 'h1', extra = {}) => ({ control: `demo/CTL${k}`, station: 'Integrating', head, verdict, ...extra });
  const checks = signedChecks({ app: 'Quality Control', station: 'Integrating', head: 'h1', registry, verdicts: [v('A', 'PASS'), v('B', 'FAIL', 'h1', { detail: 'x' }), v('C', 'UNKNOWN'), v('D', 'PASS', 'old-head'), v('Z', 'PASS'), { control: 'demo/CTLE', verdict: 'PASS' }] });
  const by = Object.fromEntries(checks.map((c) => [c.name, c]));
  assert.equal(checks.length, 5, 'not one check per registered control');
  assert.equal(by['Quality Control / approve Sync (Integrating)'].conclusion, 'success');
  assert.equal(by['Quality Control / verify Sync (Integrating)'].conclusion, 'failure');
  assert.equal(by['Quality Control / review Sync (Integrating)'].conclusion, 'failure');
  assert.equal(by['Quality Control / lint (Integrating)'].conclusion, 'failure', 'a verdict for another head passed');
  assert.equal(by['Quality Control / other (Integrating)'].conclusion, 'failure', 'a malformed verdict passed');
  assert.ok(!checks.some((c) => /Z/.test(c.name)), 'a control outside the registry got a check');
  for (const c of checks) { assert.equal(c.head_sha, 'h1'); assert.equal(c.status, 'completed'); assert.ok(c.output?.summary, 'a check says nothing'); }
  const none = signedChecks({ app: 'Quality Control', station: 'Integrating', head: 'h1', registry, verdicts: [] });
  assert.ok(none.length === 5 && none.every((c) => c.conclusion === 'failure'), 'a missing verdict is not a failure');
}
