// What the two commands of the CodeQL gate share: the environment of the job in, a findings file or nothing out.
// UNKNOWN is the absence of the file (exit 2): kaal-controls' judge-mode reads a missing findings file as UNKNOWN, so no code here decides a verdict.
import { rmSync, writeFileSync } from 'node:fs';
import { waitForAnalyses } from './analysis.mjs';
import { readAnalyses, readAlerts } from './read.mjs';

export const unknown = (out, reason) => { rmSync(out, { force: true }); return { code: 2, reason }; };

export async function runCommand({ env, out, fetchJson, sleep, now, judge }) {
  const need = ['GITHUB_REPOSITORY', 'GITHUB_SHA', 'GITHUB_REF', 'CODEQL_EXPECTED'].filter((k) => !env[k]);
  if (need.length) return unknown(out, `unset: ${need.join(', ')}`);
  const where = { repository: env.GITHUB_REPOSITORY, sha: env.GITHUB_SHA, ref: env.GITHUB_REF };
  const expected = env.CODEQL_EXPECTED.split(/\s+/).filter(Boolean);
  try {
    const waited = await waitForAnalyses({
      sha: where.sha, expected, analyzeResult: env.CODEQL_ANALYZE_RESULT,
      read: () => readAnalyses(fetchJson, where), sleep, now,
      intervalMs: 1000 * Number(env.CODEQL_POLL_SECONDS ?? 30), budgetMs: 1000 * Number(env.CODEQL_WAIT_SECONDS ?? 600),
    });
    if (!waited.ok) return unknown(out, waited.reason);
    const found = await judge({ where, expected, analyses: waited.analyses, env, fetchJson });
    if (found.reason) return unknown(out, found.reason);
    writeFileSync(out, JSON.stringify(found.findings));
    return { code: 0 };
  } catch (e) { return unknown(out, e.message); }
}

export const realDeps = (fetchJson) => ({ env: process.env, fetchJson, sleep: (ms) => new Promise((r) => setTimeout(r, ms)), now: () => Date.now() });
export const outOf = (argv) => { const i = argv.indexOf('--out'); return i < 0 ? undefined : argv[i + 1]; };
