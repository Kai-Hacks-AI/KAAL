// Case release/T1134 tests: release/CTL20
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C91-gate-verify-triggers/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
export const id = 'release/T1134';
export const tests = ['release/CTL20'];
export const title = "the workflow reports in the merge queue too: it runs on merge_group, its fetch and judge steps run as written on a queue branch (add fails, unchanged passes, a missing queue ref is never a pass) and the pull request path is unchanged";
export async function run() {
  const wf = readFileSync(join(RM, '05-src/wiring/workflows/verify-triggers.yml'), 'utf8');
  assert.match(wf, /^ {2}merge_group:\n {4}types: \[checks_requested\]$/m, 'the workflow does not run on merge_group');
  assert.match(wf, /^ {2}pull_request:$/m);
  assert.doesNotMatch(wf, /pull_request_target:/);
  assert.match(wf, /BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.merge_group\.base_sha \}\}/);
  assert.match(wf, /MERGE_GROUP_HEAD_REF: \$\{\{ github\.event\.merge_group\.head_ref \}\}/);
  assert.equal(draft('verify-triggers.yml') + '\n', wf, 'the workflow source differs from the draft');
  const step = (name) => {
    const at = wf.indexOf(`- name: ${name}`);
    assert.ok(at >= 0, `step ${name} is absent`);
    const rest = wf.slice(at + 1);
    const cut = rest.indexOf('\n      - name:');
    const seg = cut < 0 ? rest : rest.slice(0, cut);
    const m = seg.match(/run: \|\n((?: {10}.*\n?)+)/);
    assert.ok(m, `step ${name} has no run block`);
    return m[1].replace(/^ {10}/gm, '');
  };
  const FETCH = step('Fetch the proposed head as Git data');
  const JUDGE = step('Judge');
  const sh = (cwd, cmd, env = {}) => { try { execFileSync('bash', ['-ec', cmd], { cwd, env: { ...process.env, ...env }, stdio: 'pipe' }); return 0; } catch (e) { return e.status; } };
  const g = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8', stdio: 'pipe' }).trim();
  const tmp = mkdtempSync(join(tmpdir(), 't1134-'));
  try {
    const WF = '.github/workflows';
    const J = 'engineering/release-management/05-src/triggers/verify-triggers.mjs';
    const JM = 'packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs'; // the shared judge the judge hands its findings to
    const mod = readFileSync(join(RM, '05-src/triggers/verify-triggers.mjs'), 'utf8');
    const put = (dir, files) => { for (const [p, c] of Object.entries(files)) { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), c); } };
    const origin = join(tmp, 'origin.git');
    g(tmp, 'init', '-q', '--bare', origin);
    const seed = join(tmp, 'seed');
    g(tmp, 'init', '-q', seed);
    put(seed, { [`${WF}/a.yml`]: 'on:\n  pull_request:\n', [`${WF}/b.yml`]: 'on:\n  pull_request_target:\n', [J]: mod, [JM]: readFileSync(join(repo, JM), 'utf8') });
    g(seed, 'add', '-A'); g(seed, 'commit', '-q', '-m', 'base');
    const base = g(seed, 'rev-parse', 'HEAD');
    g(seed, 'push', '-q', origin, 'HEAD:refs/heads/main');
    const queue = (name, files) => {
      g(seed, 'checkout', '-q', '--detach', base);
      put(seed, files);
      g(seed, 'add', '-A'); g(seed, 'commit', '-q', '--allow-empty', '-m', name);
      g(seed, 'push', '-q', origin, `HEAD:refs/heads/gh-readonly-queue/main/${name}`);
      return `refs/heads/gh-readonly-queue/main/${name}`;
    };
    const qAdd = queue('pr-1-add', { [`${WF}/c.yml`]: 'on:\n  pull_request_target:\n' });
    const qSame = queue('pr-2-same', {});
    g(seed, 'checkout', '-q', '--detach', base);
    put(seed, { [`${WF}/c.yml`]: 'on:\n  pull_request_target:\n' }); g(seed, 'add', '-A'); g(seed, 'commit', '-q', '-m', 'pr 9'); g(seed, 'push', '-q', origin, 'HEAD:refs/pull/9/head');
    const checkout = (n) => { const dir = join(tmp, `run-${n}`); g(tmp, 'clone', '-q', origin, dir); g(dir, 'checkout', '-q', '--detach', base); return dir; };
    let n = 0;
    const run = (env) => { const dir = checkout(++n); const f = sh(dir, FETCH, { BASE_SHA: base, ...env }); return { fetch: f, judge: f === 0 ? sh(dir, JUDGE, { BASE_SHA: base, ...env }) : null }; };
    assert.deepEqual(run({ MERGE_GROUP_HEAD_REF: qAdd, PR_NUMBER: '' }), { fetch: 0, judge: 1 }, 'a queue entry that adds the trigger is not refused');
    assert.deepEqual(run({ MERGE_GROUP_HEAD_REF: qSame, PR_NUMBER: '' }), { fetch: 0, judge: 0 }, 'an unchanged queue entry is refused');
    const gone = run({ MERGE_GROUP_HEAD_REF: 'refs/heads/gh-readonly-queue/main/pr-404-none', PR_NUMBER: '' });
    assert.notEqual(gone.fetch, 0, 'a missing queue ref is fetched');
    assert.equal(gone.judge, null, 'the judge ran after a failed fetch');
    assert.deepEqual(run({ MERGE_GROUP_HEAD_REF: '', PR_NUMBER: '9' }), { fetch: 0, judge: 1 }, 'the pull request path no longer refuses an added use');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
