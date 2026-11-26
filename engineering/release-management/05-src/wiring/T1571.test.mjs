// Case release/T1571 tests: release/C153 check 1. The plain pull_request source supplies the same facts as the pull_request_target workflow, binds the fetched head to the revision of the triggering event,
// refuses a mismatch, and judges the properties of the existing checker the same way whichever way the head arrives. Established in the PLAN; the DO satisfies it without changing it.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SH = join(repo, 'engineering/github/change-isolation.sh');
export const id = 'release/T1571';
export const tests = ['release/C153'];
export const title = 'Change Isolation on plain pull_request supplies the same resolved facts as the pull_request_target workflow, reads the head as Git data bound to the event revision and refuses a mismatch, and judges every property of the existing checker as the old workflow does';

const code = (text) => text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
const source = () => code(readFileSync(join(repo, 'engineering/release-management/05-src/wiring/workflows/change-isolation-plain.yml'), 'utf8'));
const old = () => code(readFileSync(join(repo, '.github/workflows/change-isolation.yml'), 'utf8'));
const git = (cwd, ...a) => { const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };

// One step of a workflow: its env expressions resolved against an event, and its run block.
const step = (w, name) => {
  const m = new RegExp(`- name: ${name}\\n([\\s\\S]*?)(?=\\n      - |$)`).exec(w);
  assert.ok(m, `no step "${name}"`);
  const env = Object.fromEntries([...(/env:\n((?:\s{10}.*\n?)+)/.exec(m[1])?.[1] ?? '').matchAll(/^\s+(\w+): (.*)$/gm)].map((x) => [x[1], x[2].trim()]));
  const run = /run: \|\n([\s\S]*)$/.exec(m[1])?.[1].replace(/^ {10}/gm, '') ?? /run: (.*)$/m.exec(m[1])?.[1];
  return { env, run };
};
const resolve = (value, event) => value.replace(/\$\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => path.split('.').reduce((o, k) => o?.[k], { github: { event } }));

// A scratch origin with a default branch, a pull request ref and a clone of the default branch, where a workflow's steps run.
function world(paths, { target = 'main', checker = true } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 't1571-'));
  const origin = join(dir, 'origin.git');
  git(dir, 'init', '-q', '--bare', '-b', 'main', origin);
  const work = join(dir, 'work');
  git(dir, 'clone', '-q', origin, work);
  const put = (f, body) => { const p = join(work, f); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, body); };
  if (checker) put('engineering/change-isolation/check.mjs', readFileSync(join(repo, 'engineering/change-isolation/check.mjs')));
  put('base.txt', 'b\n'); put('.github/old.yml', 'a\n');
  git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'base'); git(work, 'push', '-q', 'origin', 'HEAD:main');
  if (target !== 'main') git(work, 'push', '-q', 'origin', `HEAD:refs/heads/${target}`);
  const base = git(work, 'rev-parse', 'HEAD');
  git(work, 'checkout', '-q', '-b', 'cand');
  for (const [f, body] of paths) { if (body === null) git(work, 'rm', '-q', f); else put(f, body); }
  git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'cand');
  const head = git(work, 'rev-parse', 'HEAD');
  git(work, 'push', '-q', 'origin', 'HEAD:refs/pull/1/head');
  git(work, 'checkout', '-q', '-B', 'main', base);
  return { dir, work, base, head, done: () => rmSync(dir, { recursive: true, force: true }) };
}

// Run a step the way the runner does, and read back what it exported to later steps.
function runStep(w, name, event, cwd, extra = {}) {
  const s = step(w, name);
  const envFile = join(cwd, '..', `env-${Math.random().toString(36).slice(2)}`);
  writeFileSync(envFile, '');
  const env = { ...process.env, ...Object.fromEntries(Object.entries(s.env).map(([k, v]) => [k, resolve(v, event)])), GITHUB_ENV: envFile, ...extra };
  const r = spawnSync('bash', ['-e', '-c', s.run], { cwd, env, encoding: 'utf8' });
  const exported = Object.fromEntries(readFileSync(envFile, 'utf8').split('\n').filter(Boolean).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
  return { code: r.status, exported, env: Object.fromEntries(Object.entries(s.env).map(([k, v]) => [k, resolve(v, event)])), out: r.stdout + r.stderr };
}

// The facts a workflow supplies to the checker, resolved: head, base, target, default branch, attestation, and the command that carries them.
function facts(w, name, fetchName, event, cwd) {
  const fetched = runStep(w, fetchName, event, cwd);
  const judge = step(w, name);
  const resolved = Object.fromEntries(Object.entries(judge.env).map(([k, v]) => [k, resolve(v, event)]));
  return { code: fetched.code, HEAD: fetched.exported.HEAD ?? event.pull_request.head.sha, BASE: fetched.exported.BASE, BASE_REF: resolved.BASE_REF ?? fetched.env.BASE_REF, KAAL_DEFAULT: resolved.KAAL_DEFAULT, KAAL_ATTESTATION: resolved.KAAL_ATTESTATION, cmd: judge.run };
}

// change-isolation.sh with the facts a world gives, the way the guard run supplies them.
const verdict = (w, f, extra = {}) => {
  const env = { ...process.env, GUARD_HEAD: f.HEAD, GUARD_BASE: f.BASE, GUARD_BASE_REF: f.BASE_REF, KAAL_DEFAULT: f.KAAL_DEFAULT, KAAL_ATTESTATION: f.KAAL_ATTESTATION, ...extra };
  delete env.KAAL_ATTESTED;
  return spawnSync('bash', [SH], { cwd: w.work, env, encoding: 'utf8' }).status;
};

const event = (w, over = {}) => ({ repository: { default_branch: 'main' }, pull_request: { number: 1, base: { ref: 'main' }, head: { sha: w.head }, ...over } });
const FETCH = 'Fetch the proposed head as Git data and read the target\'s current tip';
const OLD_FETCH = 'Read the target\'s current tip';
const JUDGE = 'Judge the complete change against the target';

export function run() {
  const w = source(); const o = old();
  // trust boundary of the source
  assert.doesNotMatch(w, /pull_request_target/);
  assert.match(w, /^on:\n  pull_request:/m);
  assert.match(w, /permissions:\n  contents: read/);
  assert.doesNotMatch(w, /secrets\.|GITHUB_TOKEN/);
  assert.match(w, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/, 'the default branch is the trusted judge');
  assert.doesNotMatch(w, /ref: \$\{\{ github\.event\.pull_request\.head/, 'the head must never be checked out');
  assert.doesNotMatch(w, /github\.head_ref/);
  assert.match(w, /persist-credentials: false/);
  assert.match(w, /name: Change Isolation \(plain pull_request\)/, 'detective: its own job name');
  assert.doesNotMatch(w, /^\s+name: Change Isolation$/m, 'it must not take the required context before the swap');

  // the head is the one the event was raised for: a match is judged, a mismatch and an unreadable ref are refused, not passed
  const a = world([['docs/a.md', 'x\n']]);
  try {
    const ok = runStep(w, FETCH, event(a), a.work);
    assert.equal(ok.code, 0, ok.out);
    assert.equal(ok.exported.HEAD, a.head, 'the head is not the event revision');
    assert.equal(ok.exported.BASE, a.base);
    const moved = runStep(w, FETCH, event(a, { head: { sha: a.base } }), a.work);
    assert.equal(moved.code, 2, 'a head that is not the event revision is not refused');
    assert.equal(moved.exported.HEAD, undefined, 'a refused head is exported');
    git(a.work, 'push', '-q', 'origin', ':refs/pull/1/head');
    const gone = runStep(w, FETCH, event(a), a.work);
    assert.equal(gone.code, 2, 'an unreadable pull request ref is not refused');
    assert.equal(gone.exported.HEAD, undefined);
  } finally { a.done(); }

  // the resolved facts, not their names, equal the old workflow's, and so does the command that carries them
  const b = world([['docs/a.md', 'x\n']]);
  try {
    const n = facts(w, JUDGE, FETCH, event(b), b.work);
    const p = facts(o, JUDGE, OLD_FETCH, event(b), b.work);
    for (const k of ['HEAD', 'BASE', 'BASE_REF', 'KAAL_DEFAULT', 'KAAL_ATTESTATION']) assert.equal(n[k], p[k], `the fact ${k} differs: ${n[k]} against ${p[k]}`);
    assert.equal(n.KAAL_ATTESTATION, 'deferred');
    assert.equal(n.BASE_REF, 'main');
    assert.equal(n.KAAL_DEFAULT, 'main');
    // release/C160: the command runs the delivered entry through the adapter, not kaal-guard, and carries the same three facts as the old command
    assert.match(n.cmd, /^node engineering\/release-management\/05-src\/change-isolation\/judge-change-isolation\.mjs --head /, 'the command does not run the entry');
    assert.equal(n.cmd.split(' --head ')[1], p.cmd.split(' --head ')[1], 'the facts the command carries differ');
  } finally { b.done(); }

  // every property of the existing checker, judged by the same script from the facts of each workflow: the same verdict whichever way the head arrives
  const cases = [
    ['a change outside .github passes', [['docs/a.md', 'x\n']], 0],
    ['a change inside .github alone passes', [['.github/new.yml', 'x\n']], 0],
    ['.github with another path fails', [['.github/new.yml', 'x\n'], ['docs/a.md', 'x\n']], 1],
    ['a deleted .github path with another change fails', [['.github/old.yml', null], ['docs/a.md', 'x\n']], 1],
    ['a rename out of .github fails on both sides of the rename', [['.github/old.yml', null], ['moved.yml', 'a\n']], 1],
  ];
  for (const [what, paths, expected] of cases) {
    const x = world(paths);
    try {
      const n = facts(w, JUDGE, FETCH, event(x), x.work); const p = facts(o, JUDGE, OLD_FETCH, event(x), x.work);
      assert.equal(verdict(x, n), expected, `${what}: the replacement does not give ${expected}`);
      assert.equal(verdict(x, n), verdict(x, p), `${what}: the verdicts of the two workflows differ`);
    } finally { x.done(); }
  }
  // a synchronization already admitted on the default branch does not apply; a target without the checker cannot be judged, never passed
  const s = world([['docs/a.md', 'x\n']]);
  try {
    git(s.work, 'push', '-q', 'origin', `${s.head}:refs/heads/main`);
    git(s.work, 'fetch', '-q', 'origin');
    const n = facts(w, JUDGE, FETCH, event(s), s.work);
    assert.equal(verdict(s, n), 3, 'a head already on the default branch is judged');
  } finally { s.done(); }
  const c = world([['docs/a.md', 'x\n']], { checker: false });
  try {
    const n = facts(w, JUDGE, FETCH, event(c), c.work);
    assert.equal(verdict(c, n), 2, 'a target without the checker is passed');
    assert.equal(verdict(c, n), verdict(c, facts(o, JUDGE, OLD_FETCH, event(c), c.work)));
  } finally { c.done(); }
  // facts missing: cannot judge
  const m = world([['docs/a.md', 'x\n']]);
  try {
    assert.equal(verdict(m, { ...facts(w, JUDGE, FETCH, event(m), m.work), BASE: '' }), 2, 'a missing base is judged');
  } finally { m.done(); }
}
