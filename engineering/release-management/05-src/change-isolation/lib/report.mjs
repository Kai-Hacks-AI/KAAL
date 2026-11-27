// The shared edges of the two entries of the plain pull_request replacement of Change Isolation (release/C160): the answer an entry gives and the command line that runs it.
// The judgment is the adapter's and the rule is the checker's (engineering/change-isolation/check.mjs); nothing here judges.
import { spawnSync } from 'node:child_process';

const KIND = { PASS: 'pass', FAIL: 'fail', REPORT: 'fail', UNKNOWN: 'unknown' };

// The answer of an entry: `kind` is pass, fail or unknown; a detective finding is a fail of the rule, however little it gates. UNKNOWN is never a pass.
export const report = (r) => ({ kind: KIND[r.verdict] ?? 'unknown', verdict: r.verdict, mode: r.mode, blocked: r.blocked, findings: r.findings ?? [], record: r.record, log: r.log });

// The complete change of a head against the target's tip, both sides of every rename, or null when Git cannot say.
export function changedPaths({ base, head, cwd }) {
  const r = spawnSync('git', ['diff', '--no-ext-diff', '--no-relative', '--no-renames', '--name-only', '-z', '--end-of-options', `${base}...${head}`], { cwd, encoding: 'utf8' });
  if (r.status !== 0 || r.error) return null;
  return r.stdout.split('\0').filter(Boolean);
}

const at = (argv, k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };

// The command line of an entry: `--head <sha> --base <sha> --base-ref <name>`, the three facts the workflow supplies. The base ref is carried and not used: the
// judgment of a synchronization is not part of this check (release/C160). Prints what the judge saw, and the record as one `kaal-control` line when the run is known.
export async function cli({ check, label, argv = process.argv.slice(2), env = process.env, cwd = process.cwd(), out = console.log }) {
  const head = at(argv, '--head');
  const base = at(argv, '--base');
  const paths = head && base ? changedPaths({ base, head, cwd }) : null;
  const known = env.GITHUB_RUN_ID && env.GITHUB_SHA;
  const boundary = known ? { x: 'real', run: String(env.GITHUB_RUN_ID), sha: String(env.GITHUB_SHA) } : undefined;
  const answer = await check({ paths: paths ?? undefined, boundary });
  out(`${label}: ${answer.verdict}${paths === null ? ' (the changed paths cannot be read)' : ` (${paths.length} changed paths)`}`);
  for (const f of answer.findings) out(`  ${f}`);
  if (answer.record) out(`kaal-control ${JSON.stringify(answer.record)}`);
  return answer.blocked ? 1 : answer.verdict === 'UNKNOWN' ? 2 : 0;
}
