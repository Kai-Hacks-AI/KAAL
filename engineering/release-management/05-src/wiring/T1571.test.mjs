// Case release/T1571 tests: release/C153 check 1. The plain pull_request source judges Change Isolation as the old workflow does:
// the same checker through the same guard check with the same facts, from a plain trigger that reads the head as Git data.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1571';
export const tests = ['release/C153'];
export const title = 'Change Isolation on plain pull_request judges as the pull_request_target workflow does: same checker, same guard check, same facts, head read from refs/pull';

const code = (text) => text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
const readSrc = () => code(readFileSync(join(repo, 'engineering/release-management/05-src/wiring/workflows/change-isolation-plain.yml'), 'utf8'));
const readOld = () => code(readFileSync(join(repo, '.github/workflows/change-isolation.yml'), 'utf8'));

// The guard command and its facts, as the judge step of a workflow supplies them.
export const judgeStep = (w) => {
  const m = /- name: Judge the complete change against the target\n([\s\S]*?)$/.exec(w);
  assert.ok(m, 'no judge step');
  return { env: [...m[1].matchAll(/^\s+(KAAL_\w+|BASE_REF|HEAD): (.*)$/gm)].map((x) => x[1]).filter((k) => k !== 'HEAD').sort(), cmd: /run: (npx .*)$/m.exec(m[1])?.[1] };
};

const git = (cwd, ...a) => { const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };

// change-isolation.sh against a scratch origin: the head read from a pull ref gives the same exit code as the head named by its sha.
function judge(paths) {
  const dir = mkdtempSync(join(tmpdir(), 't1571-'));
  try {
    const origin = join(dir, 'origin.git');
    git(dir, 'init', '-q', '--bare', '-b', 'main', origin);
    const work = join(dir, 'work');
    git(dir, 'clone', '-q', origin, work);
    for (const f of ['engineering/change-isolation/check.mjs']) {
      const p = join(work, f); spawnSync('mkdir', ['-p', join(p, '..')]);
      writeFileSync(p, readFileSync(join(repo, f)));
    }
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'base'); git(work, 'push', '-q', 'origin', 'HEAD:main');
    const base = git(work, 'rev-parse', 'HEAD');
    git(work, 'checkout', '-q', '-b', 'cand');
    for (const f of paths) { const p = join(work, f); spawnSync('mkdir', ['-p', join(p, '..')]); writeFileSync(p, 'x\n'); }
    git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'cand');
    const head = git(work, 'rev-parse', 'HEAD');
    git(work, 'push', '-q', 'origin', 'HEAD:refs/pull/1/head');
    git(work, 'checkout', '-q', 'main');
    const env = { ...process.env, GUARD_HEAD: head, GUARD_BASE: base, GUARD_BASE_REF: 'main', KAAL_DEFAULT: 'main', KAAL_ATTESTATION: 'deferred' };
    delete env.KAAL_ATTESTED;
    const bySha = spawnSync('bash', [join(repo, 'engineering/github/change-isolation.sh')], { cwd: work, env, encoding: 'utf8' });
    git(work, 'fetch', '-q', '--no-tags', 'origin', '+refs/pull/1/head:refs/remotes/pull/head');
    const viaRef = spawnSync('bash', [join(repo, 'engineering/github/change-isolation.sh')], { cwd: work, env: { ...env, GUARD_HEAD: git(work, 'rev-parse', 'refs/remotes/pull/head^{commit}') }, encoding: 'utf8' });
    return { bySha: bySha.status, viaRef: viaRef.status };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

export function run() {
  const w = readSrc(); const old = readOld();
  assert.doesNotMatch(w, /pull_request_target/, 'the replacement must not use pull_request_target');
  assert.match(w, /^on:\n  pull_request:/m);
  assert.match(w, /permissions:\n  contents: read/);
  assert.doesNotMatch(w, /secrets\.|GITHUB_TOKEN/, 'no secret or token');
  assert.match(w, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'the default branch is the trusted judge');
  assert.doesNotMatch(w, /ref: \$\{\{ github\.event\.pull_request\.head/, 'the head must never be checked out');
  assert.doesNotMatch(w, /github\.head_ref|pull_request\.head\.(ref|sha)/, 'the head is read by its pull request ref only');
  assert.match(w, /persist-credentials: false/);
  assert.match(w, /git fetch --no-tags origin "\+refs\/pull\/\$\{PR_NUMBER\}\/head:refs\/remotes\/pull\/head"/);
  assert.match(w, /name: Change Isolation \(plain pull_request\)/, 'detective: its own job name');
  assert.doesNotMatch(w, /name: Change Isolation\n/, 'it must not take the required context before the swap');
  // Same checker, same guard check, same facts as the old workflow.
  const a = judgeStep(w); const b = judgeStep(old);
  assert.equal(a.cmd, b.cmd, 'the guard command differs');
  assert.deepEqual(a.env, b.env, 'the facts supplied differ');
  assert.match(a.cmd, /--check Change-Isolation /);
  // Each test can fail: a Change travelling with .github fails both ways and agrees; a lone Change passes both ways and agrees.
  const lone = judge(['docs/a.md']);
  assert.equal(lone.bySha, 0); assert.equal(lone.viaRef, lone.bySha);
  const mixed = judge(['.github/workflows/x.yml', 'docs/a.md']);
  assert.notEqual(mixed.bySha, 0); assert.equal(mixed.viaRef, mixed.bySha);
}
