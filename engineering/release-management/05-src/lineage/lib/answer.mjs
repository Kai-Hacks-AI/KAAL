// The shared edges of the three entries of the plain pull_request replacement of Branching (release/C158): the answer an entry gives and the command line that runs it.
// The judgment is the adapter's and each rule is the checker's (engineering/github/lineage.ts); nothing here judges.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fromEnv, withFlag, exitOf } from '../../lib/entry-flag.mjs';

const KIND = { PASS: 'pass', FAIL: 'fail', REPORT: 'fail', UNKNOWN: 'unknown' };

// The checker's pure verdict as the check the adapter runs: a fail is one finding, the checker's own message. What the verdict said is kept in `seen`, so a verdict that does not apply can be told from a pass.
// Facts that are missing or cannot be judged make the checker throw, which the adapter answers UNKNOWN: never a pass.
export const checking = (verdict, seen) => (facts) => { seen.verdict = verdict(facts); return seen.verdict.kind === 'fail' ? [seen.verdict.message] : []; };

// The answer of an entry: `kind` is pass, fail, not-applicable or unknown; a detective finding is a fail of the rule, however little it gates.
// A verdict that does not apply is not a verification: the adapter sees no finding and says PASS, so the answer says so itself, as `not-applicable`, and carries no record, because a record is evidence of a verdict and none was given. It can never count as a positive run.
export const report = (r, seen) => {
  const applies = seen.verdict?.kind !== 'not-applicable';
  return {
    kind: r.verdict === 'PASS' && !applies ? 'not-applicable' : (KIND[r.verdict] ?? 'unknown'),
    verdict: applies ? r.verdict : 'NOT-APPLICABLE', mode: r.mode, applied: r.applied ?? null, blocked: r.blocked, findings: r.findings ?? [], message: seen.verdict?.message ?? null, record: applies ? r.record : null, log: applies ? r.log : null,
  };
};

const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });
export const rev = (cwd, ref) => {
  const r = git(cwd, 'rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`);
  if (r.status !== 0) throw new Error(`${ref} cannot be read`);
  return r.stdout.trim();
};

const at = (argv, k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };

// The command line of an entry: `--head <sha> --base-ref <name>`, and the facts of the job in KAAL_DEFAULT (the default branch), KAAL_HEAD_REF (the source branch), KAAL_AUTO_MERGE (the method auto-merge is enabled with, empty when off), KAAL_RULES (the trusted rules of the base).
// `applies(ctx)` says whether the verdict is of this pull request at all; `read(ctx)` reads its facts from Git, and may throw: facts that cannot be read are UNKNOWN.
export async function cli({ label, id, check, applies, read, argv = process.argv.slice(2), env = process.env, cwd = process.cwd(), out = console.log }) {
  const ctx = { head: at(argv, '--head'), baseRef: at(argv, '--base-ref'), defaultBranch: env.KAAL_DEFAULT, headRef: env.KAAL_HEAD_REF, enabled: env.KAAL_AUTO_MERGE || null, rules: env.KAAL_RULES || undefined, cwd };
  // The record names the head judged (release/C165), never GITHUB_SHA, which on pull_request is the test merge commit of the run.
  const known = env.GITHUB_RUN_ID && ctx.head;
  const boundary = known ? { x: 'real', run: String(env.GITHUB_RUN_ID), sha: String(ctx.head) } : undefined;
  // A job that has adopted the flag (release/C167): the declared mode and the flag go to the adapter, and the exit is the library's; one that has not runs as it did.
  // The flag is validated before applicability (T1633): a broken flag is a fact about the repository and fails every pull request, including one the control does not apply to.
  const entry = id ? fromEnv({ id, env, baseRef: ctx.baseRef }) : undefined;
  if (entry?.stop) { for (const l of entry.lines) out(l); return entry.exit; }
  let facts;
  try {
    if (!ctx.head || !ctx.baseRef || !ctx.defaultBranch) throw new Error('the job supplied no head, target or default branch');
    const n = applies(ctx);
    if (n !== true) { out(`${label}: does not apply (${n})`); return 0; }
    facts = read(ctx);
  } catch (e) { out(`${label}: the facts cannot be read (${e.message})`); facts = undefined; }
  const a = await check(facts, entry ? { mode: entry.mode, boundary: withFlag(boundary, entry.flag) } : { boundary });
  out(`${label}: ${a.verdict}${a.kind === 'not-applicable' ? ` (not applicable: ${a.message})` : ''}`);
  for (const f of a.findings) out(`  ${f}`);
  if (a.record) out(`kaal-control ${JSON.stringify(a.record)}`);
  if (entry) return exitOf({ id, station: entry.station, answer: a });
  return a.blocked ? 1 : a.verdict === 'UNKNOWN' ? 2 : 0;
}

export const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
