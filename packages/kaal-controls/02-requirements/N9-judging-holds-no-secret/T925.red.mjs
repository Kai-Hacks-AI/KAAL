// Case controls/T925 tests: controls/N9
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

export const id = 'controls/T925';
export const tests = ['controls/N9'];
export const title = 'the workflow template judges with no secret and signs without running the candidate';
export async function run() {

  const p = join(pkg, 'enforcement/workflow.yml');
  assert.ok(existsSync(p), 'the workflow template is absent');
  const y = readFileSync(p, 'utf8');
  assert.match(y, /^on:\s*\n\s+pull_request_target:/m, 'the template does not run from the base');
  assert.match(y, /^permissions: \{\}\s*$/m);
  const cut = (a, b) => { const i = y.search(new RegExp(`^  ${a}:`, 'm')); assert.ok(i >= 0, `no ${a} job`); const rest = y.slice(i + 1); const j = b ? rest.search(new RegExp(`^  ${b}:`, 'm')) : -1; return j >= 0 ? rest.slice(0, j) : rest; };
  const judge = cut('judge', 'sign'); const sign = cut('sign');
  assert.match(judge, /permissions: \{\}/, 'the judge job holds a permission');
  assert.ok(!/secrets\./.test(judge) && !/github\.token|GH_TOKEN/.test(judge), 'the judge job reaches a secret or a token');
  assert.match(judge, /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/, 'the judge job does not check out the base');
  assert.match(sign, /needs: judge/);
  assert.match(sign, /secrets\./, 'the sign job does not read the key');
  assert.ok(!/actions\/checkout/.test(sign), 'the sign job checks out code');
  assert.ok(!/ref: .*pull_request\.head/.test(y), 'a job checks out the candidate');
  for (const m of y.matchAll(/^\s*(?:- )?run: ([\s\S]*?)(?=^\s*(?:- )?(?:name|uses|run|env|with):|^\s{0,4}\w)/gm)) assert.ok(!/\$\{\{/.test(m[1]), 'an expression is interpolated into a command');
  for (const m of y.matchAll(/uses: (\S+)/g)) assert.match(m[1], /@[0-9a-f]{40}$/, `${m[1]} is not pinned to a commit`);
}
