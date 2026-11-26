export const DIR = new URL('../../05-src/codeql-gate/', import.meta.url).href;
export const ANALYSIS = DIR + 'lib/analysis.mjs';
export const ALERTS = DIR + 'lib/alerts.mjs';
export const ANALYSIS_JUDGE = DIR + 'judge-codeql-analysis.mjs';
export const FINDINGS_JUDGE = DIR + 'judge-codeql-findings.mjs';
export const an = (category, o = {}) => ({ category, commit_sha: 'abc', ref: 'refs/pull/9/merge', error: '', ...o });
export const alert = (number, severity, security, o = {}) => ({ number, state: 'open', rule: { severity, security_severity_level: security }, ...o });
export const EXPECTED = ['/language:actions', '/language:javascript-typescript'];
export const BOTH = EXPECTED.map((c) => an(c));
export const ENV = { GITHUB_REPOSITORY: 'o/r', GITHUB_SHA: 'abc', GITHUB_REF: 'refs/pull/9/merge', GITHUB_TOKEN: 't', CODEQL_EXPECTED: EXPECTED.join(' '), CODEQL_ANALYZE_RESULT: 'success', CODEQL_SECURITY_ALERTS_THRESHOLD: 'high_or_higher', CODEQL_ALERTS_THRESHOLD: 'errors' };
// A fake of the GitHub API: the analyses and the alerts it answers, or an error. `urls` keeps what was asked.
export const api = (analyses, alerts = []) => { const urls = []; const fetchJson = async (url) => { urls.push(url); if (analyses instanceof Error) throw analyses; return url.includes('/analyses') ? analyses : alerts; }; return { fetchJson, urls }; };
// A clock that moves only when the command sleeps.
export const clock = () => { let t = 0; return { now: () => t, sleep: async (ms) => { t += ms; } }; };
