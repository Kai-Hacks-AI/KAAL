// The shared edges of the three entries of the plain pull_request replacement of Branching (release/C158): the answer an entry gives and the command line that runs it.
// The judgment is the adapter's and each rule is the checker's (engineering/github/lineage.ts); nothing here judges.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const KIND = { PASS: 'pass', FAIL: 'fail', REPORT: 'fail', UNKNOWN: 'unknown' };

// The checker's pure verdict as the check the adapter runs: a fail is one finding, the checker's own message. What the verdict said is kept in `seen`, so a verdict that does not apply can be told from a pass.
// Facts that are missing or cannot be judged make the checker throw, which the adapter answers UNKNOWN: never a pass.
export const checking = (verdict, seen) => (facts) => { seen.verdict = verdict(facts); return seen.verdict.kind === 'fail' ? [seen.verdict.message] : []; };

// The answer of an entry: `kind` is pass, fail, not-applicable or unknown; a detective finding is a fail of the rule, however little it gates.
export const report = (r, seen) => ({
  kind: r.verdict === 'PASS' && seen.verdict?.kind === 'not-applicable' ? 'not-applicable' : (KIND[r.verdict] ?? 'unknown'),
  verdict: r.verdict, mode: r.mode, blocked: r.blocked, findings: r.findings ?? [], message: seen.verdict?.message ?? null, record: r.record, log: r.log,
});

const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });
export const rev = (cwd, ref) => {
  const r = git(cwd, 'rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`);
  if (r.status !== 0) throw new Error(`${ref} cannot be read`);
  return r.stdout.trim();
};

const at = (argv, k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };

// The command line of an entry: `--head <sha> --base-ref <name>`, and the facts of the job in KAAL_DEFAULT (the default branch), KAAL_HEAD_REF (the source branch), KAAL_AUTO_MERGE (the method auto-merge is enabled with, empty when off), KAAL_RULES (the trusted rules of the base).
// `applies(ctx)` says whether the verdict is of this pull request at all; `read(ctx)` reads its facts from Git, and may throw: facts that cannot be read are UNKNOWN.
export async function cli({ label, check, applies, read, argv = process.argv.slice(2), env = process.env, cwd = process.cwd(), out = console.log }) {
  const ctx = { head: at(argv, '--head'), baseRef: at(argv, '--base-ref'), defaultBranch: env.KAAL_DEFAULT, headRef: env.KAAL_HEAD_REF, enabled: env.KAAL_AUTO_MERGE || null, rules: env.KAAL_RULES || undefined, cwd };
  const known = env.GITHUB_RUN_ID && env.GITHUB_SHA;
  const boundary = known ? { x: 'real', run: String(env.GITHUB_RUN_ID), sha: String(env.GITHUB_SHA) } : undefined;
  let facts;
  try {
    if (!ctx.head || !ctx.baseRef || !ctx.defaultBranch) throw new Error('the job supplied no head, target or default branch');
    const n = applies(ctx);
    if (n !== true) { out(`${label}: does not apply (${n})`); return 0; }
    facts = read(ctx);
  } catch (e) { out(`${label}: the facts cannot be read (${e.message})`); facts = undefined; }
  const a = await check(facts, { boundary });
  out(`${label}: ${a.verdict}${a.kind === 'not-applicable' ? ` (not applicable: ${a.message})` : ''}`);
  for (const f of a.findings) out(`  ${f}`);
  if (a.record) out(`kaal-control ${JSON.stringify(a.record)}`);
  return a.blocked ? 1 : a.verdict === 'UNKNOWN' ? 2 : 0;
}

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
