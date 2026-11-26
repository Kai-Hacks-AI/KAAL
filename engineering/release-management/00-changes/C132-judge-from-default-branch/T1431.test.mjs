// Case release/T1431 tests: release/C132
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const id = 'release/T1431';
export const tests = ['release/C132'];
export const title = "the workflow's own steps, run as written on a pull request into a stale collector: the judge of the default branch runs although the base has none, a SYNC passes with the default branch's baseline, a new use fails, a head that carries its own judge does not run it, and a default branch without the judge is UNKNOWN";
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const RM = join(repo, 'engineering/release-management');
  const wf = readFileSync(join(RM, '05-src/wiring/workflows/verify-triggers.yml'), 'utf8');
  const step = (name) => {
    const at = wf.indexOf(`- name: ${name}`); assert.ok(at >= 0, `step ${name} is absent`);
    const rest = wf.slice(at + 1); const cut = rest.indexOf('\n      - name:');
    const m = (cut < 0 ? rest : rest.slice(0, cut)).match(/run: \|\n((?: {10}.*\n?)+)/); assert.ok(m, `step ${name} has no run block`);
    return m[1].replace(/^ {10}/gm, '');
  };
  const FETCH = step('Fetch the base and the proposed head as Git data');
  const JUDGE = step('Judge');
  const sh = (cwd, cmd, env = {}) => { try { return { code: 0, out: execFileSync('bash', ['-ec', cmd], { cwd, env: { ...process.env, ...env }, stdio: 'pipe', encoding: 'utf8' }) }; } catch (e) { return { code: e.status, out: String(e.stdout) }; } };
  const g = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8', stdio: 'pipe' }).trim();
  const tmp = mkdtempSync(join(tmpdir(), 't1431-'));
  try {
    const WF = '.github/workflows';
    const J = 'engineering/release-management/05-src/triggers/verify-triggers.mjs';
    const BL = 'engineering/release-management/04-controls/CTL20-gate-verify-triggers/baseline.json';
    const JM = 'packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs';
    const RA = 'packages/kaal-controls/skills/kaal-controls/scripts/ratchet.mjs';
    const real = (p) => { try { return readFileSync(join(repo, p), 'utf8'); } catch { return null; } };
    const put = (dir, files) => { for (const [p, c] of Object.entries(files)) { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), c); } };
    const pr = 'on:\n  pull_request:\n'; const prt = 'on:\n  pull_request_target:\n';
    const origin = join(tmp, 'origin.git'); g(tmp, 'init', '-q', '--bare', '-b', 'main', origin);
    const seed = join(tmp, 'seed'); g(tmp, 'init', '-q', '-b', 'main', seed);
    const judgeFiles = { [J]: real(J), [JM]: real(JM), ...(real(RA) ? { [RA]: real(RA) } : {}) };
    // the collector is stale: it has the workflows and no judge, no baseline file
    put(seed, { [`${WF}/a.yml`]: pr, [`${WF}/b.yml`]: prt });
    g(seed, 'add', '-A'); g(seed, 'commit', '-q', '-m', 'collector'); const stale = g(seed, 'rev-parse', 'HEAD');
    g(seed, 'push', '-q', origin, 'HEAD:refs/heads/collector');
    // main has the judge and the baseline file
    put(seed, { ...judgeFiles, [BL]: JSON.stringify([`${WF}/b.yml`]) });
    g(seed, 'add', '-A'); g(seed, 'commit', '-q', '-m', 'main');
    g(seed, 'push', '-q', origin, 'HEAD:refs/heads/main');
    const main = g(seed, 'rev-parse', 'HEAD');
    const prRef = (n, from, files) => { g(seed, 'checkout', '-q', '--detach', from); put(seed, files); g(seed, 'add', '-A'); g(seed, 'commit', '-q', '--allow-empty', '-m', `pr ${n}`); g(seed, 'push', '-q', origin, `HEAD:refs/pull/${n}/head`); };
    prRef(1, main, {});                                                               // a SYNC: the collector plus main
    prRef(2, main, { [`${WF}/c.yml`]: prt, [BL]: JSON.stringify([`${WF}/b.yml`]) });  // a new use
    prRef(3, main, { [J]: 'process.exit(0);\n', [`${WF}/c.yml`]: prt, [BL]: JSON.stringify([`${WF}/b.yml`]) }); // its own judge
    const run = (n, branch = 'main', env = {}) => {
      const dir = mkdtempSync(join(tmp, 'run-')); g(tmp, 'clone', '-q', origin, dir); g(dir, 'checkout', '-q', '--detach', `origin/${branch}`);
      const e = { BASE_SHA: stale, PR_NUMBER: String(n), ...env };
      const f = sh(dir, FETCH, e); return { dir, fetch: f.code, judge: f.code === 0 ? sh(dir, JUDGE, e) : null };
    };
    const sync = run(1);
    assert.equal(sync.fetch, 0); assert.equal(sync.judge.code, 0, 'a SYNC into a stale collector must pass');
    assert.match(sync.judge.out, /default branch's/, 'the answer says whose baseline it used');
    assert.equal(run(2).judge.code, 1, 'a new use into a stale collector must fail');
    assert.equal(run(3).judge.code, 1, "the pull request's own judge must not be run");
    // a default branch without the judge is UNKNOWN, never a pass
    const noJudge = run(1); g(noJudge.dir, 'rm', '-q', '-r', '--cached', J); rmSync(join(noJudge.dir, J));
    assert.equal(sh(noJudge.dir, JUDGE, { BASE_SHA: stale }).code, 2);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
