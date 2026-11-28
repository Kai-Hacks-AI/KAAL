// The command line the two entries of the plain pull_request replacement of Promotion Source share (release/C159): the facts of the job, the reads, the answer.
// The judgment is the adapter's and each rule is the checker's (engineering/github/lineage.ts); nothing here judges.
import { spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { fromEnv, withFlag, exitOf } from '../../lib/entry-flag.mjs';

// The facts of the old workflow, from the job: KAAL_REPO, KAAL_DEFAULT, KAAL_HEAD_REPO, KAAL_HEAD_REF, KAAL_HEAD_SHA, and the target in `--base-ref`.
export const jobFacts = (argv, env) => {
  const i = argv.indexOf('--base-ref');
  return { repo: env.KAAL_REPO, defaultBranch: env.KAAL_DEFAULT, baseRef: i < 0 ? undefined : argv[i + 1], headRepo: env.KAAL_HEAD_REPO, headRef: env.KAAL_HEAD_REF, head: env.KAAL_HEAD_SHA };
};

// `gh api --paginate`, one JSON value per line when a `--jq` is given. A response that cannot be read throws: the answer is UNKNOWN.
export function gh(args, { env = process.env } = {}) {
  const r = spawnSync(env.KAAL_GH || 'gh', ['api', '--paginate', ...args], { encoding: 'utf8' });
  if (r.error || r.status !== 0) throw new Error(`${args[0]} cannot be read`);
  return r.stdout.split('\n').filter((l) => l.trim() !== '').map((l) => JSON.parse(l));
}

// The waits between two reads, in seconds. Without an override the interval stretches (20, 20, 30, 30, 45, 45, then 60) and the total stays at least the ten minutes of 30 reads at 20 seconds (release/C190);
// KAAL_ATTEMPTS and KAAL_INTERVAL, either of them, give the old constant interval for that many reads.
export const SERIES = [20, 20, 30, 30, 45, 45];
export const WAIT_TOTAL = 600;
export const FAILED_READS = 3;
export function waitsFor(env) {
  if (env.KAAL_ATTEMPTS !== undefined || env.KAAL_INTERVAL !== undefined) {
    const reads = Number(env.KAAL_ATTEMPTS ?? 30);
    return Array.from({ length: Math.max(0, reads - 1) }, () => Number(env.KAAL_INTERVAL ?? 20));
  }
  const waits = [...SERIES];
  while (waits.reduce((a, b) => a + b, 0) < WAIT_TOTAL) waits.push(60);
  return waits;
}

// Runs an entry: reads its facts (which may throw: UNKNOWN), answers, prints the verdict, the findings and the record of a run that is known, and returns the exit status.
// `again(answer)` says whether the answer is one to wait for (a required check still running), as the old script waited for it. An entry that waits also retries a read that fails: the next tick reads again, and the verdict is UNKNOWN
// only when the third failure in a row happens or the wait ends; every failure is said in the output.
export async function run({ label, id, check, read, again, argv = process.argv.slice(2), env = process.env, out = console.log, wait = (s) => sleep(s * 1000) }) {
  // The record names the head judged (KAAL_HEAD_SHA), never GITHUB_SHA, which on pull_request is the test merge commit of the run.
  const head = jobFacts(argv, env).head;
  const known = env.GITHUB_RUN_ID && head;
  const boundary = known ? { x: 'real', run: String(env.GITHUB_RUN_ID), sha: String(head) } : undefined;
  // A job that has adopted the flag (release/C167): the declared mode and the flag go to the adapter, and the exit is the library's; one that has not runs as it did.
  const entry = id ? fromEnv({ id, env }) : undefined;
  if (entry?.stop) { for (const l of entry.lines) out(l); return entry.exit; }
  const retry = again !== undefined;
  const waiting = again ?? (() => false);
  const waits = waitsFor(env);
  let tick = 0;
  let failures = 0;
  for (;;) {
    let facts;
    let failed = false;
    const f = jobFacts(argv, env);
    if (!f.repo || !f.defaultBranch || !f.baseRef || !f.headRepo || !f.headRef) {
      out(`${label}: the facts cannot be read (the job supplied no repository, target, default branch or source)`);
    } else {
      try { facts = read(f); failures = 0; } catch (e) { failed = true; failures += 1; out(`${label}: the facts cannot be read (${e.message}); failed read ${failures} in a row`); }
    }
    if (failed && retry && failures < FAILED_READS && tick < waits.length) { await wait(waits[tick]); tick += 1; continue; }
    const a = await check(facts, entry ? { mode: entry.mode, boundary: withFlag(boundary, entry.flag) } : { boundary });
    if (tick < waits.length && waiting(a)) { await wait(waits[tick]); tick += 1; continue; }
    out(`${label}: ${a.verdict}${a.kind === 'not-applicable' ? ` (not applicable: ${a.message})` : ''}`);
    for (const f of a.findings) out(`  ${f}`);
    if (a.record) out(`kaal-control ${JSON.stringify(a.record)}`);
    if (entry) return exitOf({ id, station: env.KAAL_STATION, answer: a });
    return a.blocked ? 1 : a.verdict === 'UNKNOWN' ? 2 : 0;
  }
}
