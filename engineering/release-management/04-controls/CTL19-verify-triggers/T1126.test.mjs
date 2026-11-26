// Case release/T1126 tests: release/CTL19
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/triggers/verify-triggers.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C90-no-pull-request-target/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
export const id = 'release/T1126';
export const tests = ['release/CTL19'];
export const title = "the workflow's own fetch and judge steps, run as written on a fork-style pull request: add fails, remove and unchanged pass, a missing ref is never a pass, the pull request's judge is not run";
export async function run() {
  const wf = readFileSync(join(RM, '05-src/wiring/workflows/verify-triggers.yml'), 'utf8');
  const step = (name) => {
    const at = wf.indexOf(`- name: ${name}`);
    assert.ok(at >= 0, `step ${name} is absent`);
    const rest = wf.slice(at + 1);
    const seg = rest.slice(0, rest.indexOf('\n      - name:') < 0 ? undefined : rest.indexOf('\n      - name:'));
    const m = seg.match(/run: \|\n((?: {10}.*\n?)+)/);
    assert.ok(m, `step ${name} has no run block`);
    return m[1].replace(/^ {10}/gm, '');
  };
  const FETCH = step('Fetch the proposed head as Git data');
  const JUDGE = step('Judge');
  const sh = (cwd, cmd, env = {}) => { try { execFileSync('bash', ['-ec', cmd], { cwd, env: { ...process.env, ...env }, stdio: 'pipe' }); return 0; } catch (e) { return e.status; } };
  const g = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8', stdio: 'pipe' }).trim();
  const tmp = mkdtempSync(join(tmpdir(), 't1126-'));
  try {
    const WF = '.github/workflows';
    const J = 'engineering/release-management/05-src/triggers/verify-triggers.mjs';
    const mod = readFileSync(MOD, 'utf8');
    const put = (dir, files) => { for (const [p, c] of Object.entries(files)) { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), c); } };
    const origin = join(tmp, 'origin.git');
    g(tmp, 'init', '-q', '--bare', origin);
    const seed = join(tmp, 'seed');
    g(tmp, 'init', '-q', seed);
    put(seed, { [`${WF}/a.yml`]: 'on:\n  pull_request:\n', [`${WF}/b.yml`]: 'on:\n  pull_request_target:\n', [J]: mod });
    g(seed, 'add', '-A'); g(seed, 'commit', '-q', '-m', 'base');
    const base = g(seed, 'rev-parse', 'HEAD');
    g(seed, 'push', '-q', origin, 'HEAD:refs/heads/main');
    // a fork-style pull request: its head commit is on no branch, only on refs/pull/<n>/head
    const pr = (n, files, remove = []) => {
      g(seed, 'checkout', '-q', '--detach', base);
      put(seed, files);
      for (const r of remove) g(seed, 'rm', '-q', r);
      g(seed, 'add', '-A'); g(seed, 'commit', '-q', '--allow-empty', '-m', `pr ${n}`);
      g(seed, 'push', '-q', origin, `HEAD:refs/pull/${n}/head`);
    };
    pr(1, { [`${WF}/c.yml`]: 'on:\n  pull_request_target:\n' });
    pr(2, {}, [`${WF}/b.yml`]);
    pr(3, {});
    pr(4, { [J]: "process.exit(0);\n", [`${WF}/c.yml`]: 'on:\n  pull_request_target:\n' });
    const run = (n, cmdFetch = FETCH) => {
      const dir = mkdtempSync(join(tmp, 'run-'));
      g(tmp, 'clone', '-q', origin, dir);
      g(dir, 'checkout', '-q', '--detach', base);
      const env = { BASE_SHA: base, PR_NUMBER: String(n) };
      const f = sh(dir, cmdFetch, env);
      return { fetch: f, judge: f === 0 ? sh(dir, JUDGE, env) : null };
    };
    assert.deepEqual(run(1), { fetch: 0, judge: 1 }, 'a fork-style pull request that adds a use must fail');
    assert.deepEqual(run(2), { fetch: 0, judge: 0 }, 'one that removes a use must pass');
    assert.deepEqual(run(3), { fetch: 0, judge: 0 }, 'one that changes nothing must pass');
    assert.deepEqual(run(4), { fetch: 0, judge: 1 }, "the pull request's own judge must not be run");
    const missing = run(99);
    assert.notEqual(missing.fetch, 0, 'a pull request ref that does not exist must fail the fetch step');
    assert.equal(missing.judge, null, 'the judge must not run, and so must not pass, without its head');
    // a judge run with an unresolvable ref says UNKNOWN (exit 2), never PASS
    const dir = mkdtempSync(join(tmp, 'run-'));
    g(tmp, 'clone', '-q', origin, dir); g(dir, 'checkout', '-q', '--detach', base);
    assert.equal(sh(dir, `node ${J} --base ${base} --head refs/remotes/pull/head`), 2, 'an unresolvable head must be UNKNOWN');
    assert.equal(sh(dir, `node ${J} --base 0000000000000000000000000000000000000000 --head ${base}`), 2, 'an unresolvable base must be UNKNOWN');
    // the judge absent on the base is UNKNOWN too
    g(dir, 'rm', '-q', '-r', '--cached', J); rmSync(join(dir, J));
    assert.equal(sh(dir, JUDGE, { BASE_SHA: base }), 2, 'an absent judge must be UNKNOWN');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
