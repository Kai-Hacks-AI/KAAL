// verify CodeQL analysis (release/CTL34, Intent release/I68): does every expected configuration have an analysis of the merge-result sha without an error?
//   node judge-codeql-analysis.mjs --out <findings.json>
// It writes the findings as a JSON list of names (`missing:<category>`, `errored:<category>`) and no verdict; kaal-controls' judge-mode gives it. It exits 2 and writes no file when it cannot tell.
// Environment: GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_REF, GITHUB_TOKEN (security-events: read), CODEQL_EXPECTED, CODEQL_ANALYZE_RESULT; optional CODEQL_WAIT_SECONDS, CODEQL_POLL_SECONDS.
import { fileURLToPath } from 'node:url';
import { analysisFindings } from './lib/analysis.mjs';
import { fetchJsonOf } from './lib/read.mjs';
import { runCommand, realDeps, outOf } from './lib/command.mjs';

export const runAnalysisJudge = (deps) => runCommand({ ...deps, judge: async ({ where, expected, analyses }) => ({ findings: analysisFindings({ sha: where.sha, expected, analyses }) }) });

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = outOf(process.argv);
  const r = out ? await runAnalysisJudge({ ...realDeps(fetchJsonOf(process.env.GITHUB_TOKEN)), out }) : { code: 2, reason: 'no --out' };
  if (r.reason) console.error(`UNKNOWN: ${r.reason}`);
  process.exit(r.code);
}
