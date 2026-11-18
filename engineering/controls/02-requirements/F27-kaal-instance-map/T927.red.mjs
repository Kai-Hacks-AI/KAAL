// Case controls/T927 tests: controls/F27
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const pkg = join(repo, 'packages/kaal-controls');
const S = join(pkg, 'skills/kaal-controls/scripts');
const STATIONS = ['Developing', 'Collecting', 'Integrating', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing'];
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
function git(cwd, ...a) { return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }).trim(); }
function mkrepo(files) { const d = mkdtempSync(join(tmpdir(), 'c14-')); git(d, 'init', '-q', '-b', 'main'); put(d, files); git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'base'); return d; }
function put(d, files) { for (const [p, t] of Object.entries(files)) { if (t === null) { git(d, 'rm', '-q', '-f', p); continue; } mkdirSync(dirname(join(d, p)), { recursive: true }); writeFileSync(join(d, p), t); } }

export const id = 'controls/T927';
export const tests = ['controls/F27'];
export const title = 'the KAAL instance map names the App and keeps the stations equal to the ruleset sources';
export async function run() {
  const p = join(repo, 'engineering/controls/stations.json');
  assert.ok(existsSync(p), 'engineering/controls/stations.json is absent');
  const m = JSON.parse(readFileSync(p, 'utf8'));
  assert.equal(m.app?.name, 'KAAL Inspector');
  assert.ok(m.app.id === null || (Number.isInteger(m.app.id) && m.app.id > 0), 'the App ID is neither null nor a positive integer');
  assert.ok(!/key|secret|BEGIN/i.test(JSON.stringify(m)), 'the map holds a key or a secret');
  const keys = Object.keys(m.stations ?? {});
  assert.ok(keys.includes('Integrating'), 'Integrating is not mapped');
  for (const k of keys) assert.ok(STATIONS.includes(k), `${k} is not a station`);
  const rs = JSON.parse(readFileSync(join(repo, 'engineering/release-management/05-src/wiring/rulesets', `${m.stations.Integrating.ruleset}.json`), 'utf8'));
  const inc = rs.conditions.ref_name.include.map((r) => r.replace(/^refs\/heads\//, ''));
  assert.deepEqual([...m.stations.Integrating.branches].sort(), [...inc].sort(), 'the branches differ from the ruleset source');
  const { signedChecks } = await import(pathToFileURL(join(S, 'sign.mjs')).href);
  const [c] = signedChecks({ app: m.app.name, station: 'Integrating', head: 'h', registry: [{ id: 'release/CTL8', title: 'approve Sync', mode: 'preventive' }], verdicts: [{ control: 'release/CTL8', station: 'Integrating', head: 'h', verdict: 'PASS' }] });
  assert.equal(c.name, 'KAAL Inspector / approve Sync (Integrating)');
}
