// The shared set-up of the Cases of engineering/F104: run the Branching audit's script against a local
// repository with a recording stand-in for `gh`, and read which GitHub calls it made.
import { join } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
export const root = new URL(import.meta.url).pathname.split('/packages/')[0];
export const script = join(root, 'engineering/github/branching-audit.sh');
export const lineage = join(root, 'engineering/github/lineage.ts');
const git = (cwd, ...a) => spawnSync('git', a, { cwd, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });

/** Runs the audit script for one event and returns the GitHub calls it made (each call's arguments, one string). */
export function audit({ event = 'push', ref = 'kaal/x', created = 'false', deleted = 'false', answers = () => [], commits = 0, before = null, ghFail = false } = {}) {
  const w = mkdtempSync(join(tmpdir(), 'f104-'));
  const repo = join(w, 'srv/o/r');
  mkdirSync(join(repo, 'engineering/github'), { recursive: true });
  git(repo, 'init', '-q', '-b', 'main');
  writeFileSync(join(repo, 'engineering/github/holds.json'), '[]\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-q', '-m', 'main');
  const first = git(repo, 'rev-parse', 'HEAD').stdout.trim();
  const shas = [first];
  // `commits` landings on the collector, one commit each, after main's commit
  git(repo, 'checkout', '-q', '-b', 'kaal/x');
  for (let i = 1; i <= commits; i++) { writeFileSync(join(repo, `f${i}`), 'x'); git(repo, 'add', '-A'); git(repo, 'commit', '-q', '-m', `c${i}`); shas.push(git(repo, 'rev-parse', 'HEAD').stdout.trim()); }
  git(repo, 'checkout', '-q', 'main');
  const tip = shas[shas.length - 1];
  mkdirSync(join(w, 'bin'));
  const log = join(w, 'gh.log');
  // The stand-in answers like `gh api`: the canned response whose pattern matches the endpoint, through --jq if one is given.
  mkdirSync(join(w, 'resp'));
  answers(tip, shas).forEach((a, i) => { writeFileSync(join(w, `resp/${i}.match`), `${a.match}\n`); writeFileSync(join(w, `resp/${i}.json`), JSON.stringify(a.body)); });
  writeFileSync(join(w, 'bin/gh'), [
    '#!/bin/sh', 'echo "$*" >> "$GH_LOG"', ghFail ? 'exit 1' : '', 'f=""; p=""; u=""',
    'for a in "$@"; do [ "$p" = --jq ] && f=$a; p=$a; case $a in repos/*) u=$a;; esac; done',
    'for m in "$GH_RESP"/*.match; do [ -e "$m" ] || exit 0; if echo "$u" | grep -Eq "$(cat "$m")"; then j=${m%.match}.json; if [ -n "$f" ]; then jq -c "$f" "$j"; else cat "$j"; fi; exit 0; fi; done', ''].join('\n'));
  chmodSync(join(w, 'bin/gh'), 0o755);
  const r = spawnSync('bash', [script, lineage], {
    cwd: w, encoding: 'utf8',
    env: { ...process.env, PATH: `${join(w, 'bin')}:${process.env.PATH}`, GH_LOG: log, GH_RESP: join(w, 'resp'), GH_TOKEN: 'x',
      KAAL_SERVER: join(w, 'srv'), KAAL_REPO: 'o/r', KAAL_DEFAULT: 'main', KAAL_EVENT: event, KAAL_REF: ref,
      KAAL_CREATED: created, KAAL_DELETED: deleted, KAAL_BEFORE: before ?? first, KAAL_AFTER: tip },
  });
  const calls = existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean) : [];
  return { calls, status: r.status, out: `${r.stdout}${r.stderr}`, tip, shas };
}

/** A merged pull request into `base` whose merge commit is `sha`, as GitHub lists it. */
export const merged = (number, sha, base = 'kaal/x') => ({ number, state: 'closed', merged_at: '2026-01-01T00:00:00Z', merge_commit_sha: sha, base: { ref: base }, head: { ref: `claude/${number}`, sha: 'a'.repeat(40), repo: { full_name: 'o/r' } } });
/** A merge record of `ref`, as the repository activity lists it. */
export const record = (ref, after, n = 0) => ({ ref: `refs/heads/${ref}`, before: 'b'.repeat(40), after, timestamp: `2026-01-01T00:00:${String(n % 60).padStart(2, '0')}Z`, activity_type: 'pr_merge' });
export const filler = (ref, n) => Array.from({ length: n }, (_, i) => record(ref, String(i + 1).padStart(40, '0'), i));
