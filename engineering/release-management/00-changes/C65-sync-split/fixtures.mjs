// Shared scaffolding of the C65 Cases: a real Git repository with a pure SYNC, and GitHub stood in for.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const SRC = join(repo, 'engineering/release-management/05-src/sync-review');
export const load = (f) => import(pathToFileURL(join(SRC, f)).href);
const BODY = '## Change\n\nrelease/C1 x\n\n## Reason\n\nto unblock development\n';
export function pureSync() {
  const dir = mkdtempSync(join(tmpdir(), 'kaal-c65-'));
  const git = (args) => { const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' }); return { status: r.status ?? 2, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }; };
  const must = (args) => { const r = git(args); assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
  const put = (file, text) => writeFileSync(join(dir, file), text);
  const commit = (m) => { must(['add', '-A']); must(['commit', '-q', '-m', m]); return must(['rev-parse', 'HEAD']); };
  must(['init', '-q', '-b', 'main']);
  must(['config', 'user.name', 't']); must(['config', 'user.email', 't@example.com']); must(['config', 'commit.gpgsign', 'false']);
  put('a.txt', 'a\n'); commit('main 1');
  must(['branch', 'collector']);
  put('m.txt', 'm\n'); const mainTip = commit('main 2');
  must(['checkout', '-q', 'collector']);
  put('own.txt', 'own\n'); commit('collector change');
  must(['checkout', '-q', '-b', 'sync', 'collector']);
  must(['merge', '--no-ff', '-q', '-m', 'SYNC', mainTip]);
  const head = must(['rev-parse', 'HEAD']);
  must(['update-ref', 'refs/kaal/base', must(['rev-parse', 'collector'])]);
  must(['update-ref', 'refs/remotes/origin/main', must(['rev-parse', 'main'])]);
  must(['update-ref', 'refs/kaal/pr', head]);
  const state = { head, baseTip: must(['rev-parse', 'collector']), author: 'author', requested: [], codeowners: '* @kaihacksai\n', body: BODY, labels: [], comments: [] };
  const calls = [], outs = {}, logs = [], errors = [];
  let failOn = null;
  const api = (args) => {
    const a = args.join(' ');
    calls.push(a);
    if (failOn && failOn.re.test(a)) throw new Error(failOn.message);
    if (/-X (POST|DELETE)/.test(a)) return '{}';
    if (/pulls\/7\/reviews/.test(a)) return '';
    if (/git\/ref\/heads\/kaal\/release\/x$/.test(a)) return JSON.stringify({ object: { sha: state.baseTip } });
    if (/pulls\/7$/.test(a)) return JSON.stringify({ head: { sha: state.head }, base: { ref: 'kaal/release/x' }, title: 'SYNC: x', body: state.body, user: { login: state.author }, requested_reviewers: state.requested.map((login) => ({ login })) });
    if (/issues\/7\/labels/.test(a)) return JSON.stringify(state.labels.map((name) => ({ name })));
    return '';
  };
  // release/C65: approve and review run where a token can write and read no commit of the candidate, so `git` is a tripwire there.
  const noGit = () => { throw new Error('git was called where the candidate must not be read'); };
  const deps = (over = {}) => ({ git, api, codeowners: () => state.codeowners, out: (n, v) => { outs[n] = v; }, summary() {}, log: (l) => logs.push(l), error: (t, l) => errors.push(`${t}: ${l}`), ...over });
  const env = (extra = {}) => ({ KAAL_REPO: 'o/r', KAAL_PR: '7', KAAL_BASE: 'kaal/release/x', KAAL_HEAD: head, KAAL_BODY: BODY, KAAL_DEFAULT: 'main', ...extra });
  return {
    head, noGit, state, calls, outs, logs, errors, deps, env,
    failOn: (re, message) => { failOn = { re, message }; },
    clearFail: () => { failOn = null; },
    posted: (re) => calls.filter((c) => /-X POST/.test(c) && re.test(c)),
    reset: () => { calls.length = 0; logs.length = 0; errors.length = 0; for (const k of Object.keys(outs)) delete outs[k]; },
    done: () => rmSync(dir, { recursive: true, force: true }),
  };
}
