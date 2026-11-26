// verify CodeQL findings (release/CTL35, Intent release/I69): is an open alert on the merge ref at or above the threshold?
//   node judge-codeql-findings.mjs --out <findings.json>
// It writes the findings as a JSON list of names (`alert:<number>`) and no verdict; kaal-controls' judge-mode gives it. It exits 2 and writes no file when it cannot tell, an expected analysis that is not there included: an alert set it cannot trust is never clean.
// Environment: GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_REF, GITHUB_TOKEN (security-events: read), CODEQL_EXPECTED, CODEQL_ANALYZE_RESULT, CODEQL_SECURITY_ALERTS_THRESHOLD, CODEQL_ALERTS_THRESHOLD; optional CODEQL_WAIT_SECONDS, CODEQL_POLL_SECONDS.
import { fileURLToPath } from 'node:url';
import { missingOf } from './lib/analysis.mjs';
import { alertFindings } from './lib/alerts.mjs';
import { fetchJsonOf, readAlerts } from './lib/read.mjs';
import { runCommand, realDeps, outOf } from './lib/command.mjs';

export const runFindingsJudge = (deps) => runCommand({
  ...deps,
  judge: async ({ where, expected, analyses, env, fetchJson }) => {
    const missing = missingOf(expected, analyses, where.sha);
    if (missing.length) return { reason: `cannot trust the alerts: no analysis of ${missing.join(' ')}` };
    return { findings: alertFindings({ alerts: await readAlerts(fetchJson, where), thresholds: { security: env.CODEQL_SECURITY_ALERTS_THRESHOLD, alerts: env.CODEQL_ALERTS_THRESHOLD } }) };
  },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = outOf(process.argv);
  const r = out ? await runFindingsJudge({ ...realDeps(fetchJsonOf(process.env.GITHUB_TOKEN)), out }) : { code: 2, reason: 'no --out' };
  if (r.reason) console.error(`UNKNOWN: ${r.reason}`);
  process.exit(r.code);
}
