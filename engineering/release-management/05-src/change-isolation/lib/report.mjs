// The shared edges of the two entries of the plain pull_request replacement of Change Isolation (release/C160): the answer an entry gives and the command line that runs it.
// The judgment is the adapter's and the rule is the checker's (engineering/change-isolation/check.mjs); nothing here judges.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fromEnv, withFlag, exitOf } from '../../lib/entry-flag.mjs';

const KIND = { PASS: 'pass', FAIL: 'fail', REPORT: 'fail', UNKNOWN: 'unknown' };

// The answer of an entry: `kind` is pass, fail or unknown; a detective finding is a fail of the rule, however little it gates. UNKNOWN is never a pass.
export const report = (r) => ({ kind: KIND[r.verdict] ?? 'unknown', verdict: r.verdict, mode: r.mode, applied: r.applied ?? null, blocked: r.blocked, findings: r.findings ?? [], record: r.record, log: r.log });

const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8' });

// The paths to judge for a head, as the old workflow judged them (engineering/github/change-isolation.sh), or why there are none:
//   { paths }            the complete change of the head against the target's tip, both sides of every rename, or, for a verified synchronization of a collector, its own explicit
//                        resolutions only (none when it has none: nothing of its own to judge);
//   null                 Git or the lineage verdict cannot say, which is UNKNOWN.
// The verdict of a synchronization is the default branch's own (engineering/github/lineage.ts as origin/<default> holds it), never the candidate's.
export function changedPaths({ base, head, baseRef, defaultBranch, cwd }) {
  if (!base || !head) return null;
  if (defaultBranch) {
  }
  let range = `${base}...${head}`;
  if (baseRef?.startsWith('kaal/')) {
    if (!defaultBranch) return null;
    const dir = mkdtempSync(join(tmpdir(), 'isolation-'));
    try {
      const lineage = git(cwd, 'show', `origin/${defaultBranch}:engineering/github/lineage.ts`);
      if (lineage.status !== 0) return null;
      writeFileSync(join(dir, 'lineage.ts'), lineage.stdout);
      const resolved = join(dir, 'resolved');
      const v = spawnSync(process.execPath, [join(dir, 'lineage.ts'), 'synchronization', defaultBranch, baseRef, `origin/${defaultBranch}`, base, head, '--resolutions', resolved], { cwd, encoding: 'utf8' });
      if (v.status === 0) {
        // A verified synchronization: only its explicit resolutions are its own. Without any, there is nothing of its own to judge.
        const own = existsSync(resolved) ? readFileSync(resolved, 'utf8') : '';
        return { paths: own.split(own.includes('\0') ? '\0' : '\n').filter(Boolean), synchronization: true };
      }
      if (v.status !== 1 && v.status !== 3) return null;
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  const r = git(cwd, 'diff', '--no-ext-diff', '--no-relative', '--no-renames', '--name-only', '-z', '--end-of-options', range);
  if (r.status !== 0 || r.error) return null;
  return { paths: r.stdout.split('\0').filter(Boolean) };
}

const at = (argv, k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };

// The command line of an entry: `--head <sha> --base <sha> --base-ref <name>`, the three facts the workflow supplies, and KAAL_DEFAULT, the default branch. Prints what the judge saw, and the record as one `kaal-control` line when the run is known.
export async function cli({ check, label, id, argv = process.argv.slice(2), env = process.env, cwd = process.cwd(), out = console.log }) {
  const head = at(argv, '--head');
  const base = at(argv, '--base');
  const found = head && base ? changedPaths({ base, head, baseRef: at(argv, '--base-ref'), defaultBranch: env.KAAL_DEFAULT, cwd }) : null;
  // The record names the head judged (release/C165), never GITHUB_SHA, which on pull_request is the test merge commit of the run.
  const known = env.GITHUB_RUN_ID && head;
  const boundary = known ? { x: 'real', run: String(env.GITHUB_RUN_ID), sha: String(head) } : undefined;
  const entry = id ? fromEnv({ id, env }) : undefined;
  if (entry?.stop) { for (const l of entry.lines) out(l); return entry.exit; }
  const answer = await check({ paths: found?.paths, ...(entry ? { mode: entry.mode, boundary: withFlag(boundary, entry.flag) } : { boundary }) });
  out(`${label}: ${answer.verdict}${!found ? ' (the changed paths cannot be read)' : found.synchronization ? ` (a verified synchronization: ${found.paths.length} paths of its own)` : ` (${found.paths.length} changed paths)`}`);
  for (const f of answer.findings) out(`  ${f}`);
  if (answer.record) out(`kaal-control ${JSON.stringify(answer.record)}`);
  if (entry) return exitOf({ id, station: env.KAAL_STATION, answer });
  return answer.blocked ? 1 : answer.verdict === 'UNKNOWN' ? 2 : 0;
}
