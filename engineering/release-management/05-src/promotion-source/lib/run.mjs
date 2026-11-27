// The command line the two entries of the plain pull_request replacement of Promotion Source share (release/C159): the facts of the job, the reads, the answer.
// The judgment is the adapter's and each rule is the checker's (engineering/github/lineage.ts); nothing here judges.
import { spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

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

// Runs an entry: reads its facts (which may throw: UNKNOWN), answers, prints the verdict, the findings and the record of a run that is known, and returns the exit status.
// `again(answer)` says whether the answer is one to wait for (a required check still running), as the old script waited for it.
export async function run({ label, check, read, again = () => false, argv = process.argv.slice(2), env = process.env, out = console.log, wait = (s) => sleep(s * 1000) }) {
  const known = env.GITHUB_RUN_ID && env.GITHUB_SHA;
  const boundary = known ? { x: 'real', run: String(env.GITHUB_RUN_ID), sha: String(env.GITHUB_SHA) } : undefined;
  let attempts = Number(env.KAAL_ATTEMPTS ?? 30);
  const interval = Number(env.KAAL_INTERVAL ?? 20);
  for (;;) {
    let facts;
    try {
      const f = jobFacts(argv, env);
      if (!f.repo || !f.defaultBranch || !f.baseRef || !f.headRepo || !f.headRef) throw new Error('the job supplied no repository, target, default branch or source');
      facts = read(f);
    } catch (e) { out(`${label}: the facts cannot be read (${e.message})`); facts = undefined; }
    const a = await check(facts, { boundary });
    attempts -= 1;
    if (attempts > 0 && again(a)) { await wait(interval); continue; }
    out(`${label}: ${a.verdict}${a.kind === 'not-applicable' ? ` (not applicable: ${a.message})` : ''}`);
    for (const f of a.findings) out(`  ${f}`);
    if (a.record) out(`kaal-control ${JSON.stringify(a.record)}`);
    return a.blocked ? 1 : a.verdict === 'UNKNOWN' ? 2 : 0;
  }
}
