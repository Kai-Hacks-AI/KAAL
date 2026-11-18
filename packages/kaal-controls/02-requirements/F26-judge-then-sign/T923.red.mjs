// Case controls/T923 tests: controls/F26
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

export const id = 'controls/T923';
export const tests = ['controls/F26'];
export const title = 'the judge command runs the judge.mjs of the base, with a timeout, and never that of the candidate';
export async function run() {

  const f = join(S, 'judge.mjs');
  assert.ok(existsSync(f), 'judge.mjs is absent');
  const j = (v) => `console.log(JSON.stringify(${v}));`;
  const d = mkrepo({
    'c/CTL1-p/CTL1.md': item({ id: 'demo/CTL1', title: 'p', stations: '[Integrating:preventive]' }), 'c/CTL1-p/judge.mjs': j('{ verdict: "PASS", detail: process.env.KAAL_HEAD }'),
    'c/CTL2-n/CTL2.md': item({ id: 'demo/CTL2', title: 'n', stations: '[Integrating:preventive]' }),
    'c/CTL3-g/CTL3.md': item({ id: 'demo/CTL3', title: 'g', stations: '[Integrating:preventive]' }), 'c/CTL3-g/judge.mjs': 'console.log("garbage");',
    'c/CTL4-h/CTL4.md': item({ id: 'demo/CTL4', title: 'h', stations: '[Integrating:preventive]' }), 'c/CTL4-h/judge.mjs': 'setInterval(() => {}, 1000);',
    'c/CTL5-f/CTL5.md': item({ id: 'demo/CTL5', title: 'f', stations: '[Integrating:preventive]' }), 'c/CTL5-f/judge.mjs': j('{ verdict: "FAIL", detail: "no" }'),
  });
  const base = git(d, 'rev-parse', 'HEAD');
  git(d, 'checkout', '-q', '-b', 'pr');
  put(d, { 'c/CTL5-f/judge.mjs': j('{ verdict: "PASS" }'), 'c/CTL2-n/judge.mjs': j('{ verdict: "PASS" }') });
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'pr');
  const head = git(d, 'rev-parse', 'HEAD');
  const out = join(mkdtempSync(join(tmpdir(), 'c14o-')), 'verdicts.json');
  execFileSync(process.execPath, [f, '--repo', d, '--base', base, '--head', head, '--station', 'Integrating', '--out', out, '--timeout', '1500'], { encoding: 'utf8' });
  const v = Object.fromEntries(JSON.parse(readFileSync(out, 'utf8')).map((x) => [x.control, x]));
  assert.equal(v['demo/CTL1'].verdict, 'PASS');
  assert.equal(v['demo/CTL1'].detail, head, 'the control was not told the head');
  assert.equal(v['demo/CTL2'].verdict, 'UNKNOWN', 'a control with no judge.mjs in the base answered');
  assert.equal(v['demo/CTL3'].verdict, 'UNKNOWN');
  assert.equal(v['demo/CTL4'].verdict, 'UNKNOWN', 'a hanging control did not time out');
  assert.equal(v['demo/CTL5'].verdict, 'FAIL', 'the judge.mjs of the candidate replaced that of the base');
}
