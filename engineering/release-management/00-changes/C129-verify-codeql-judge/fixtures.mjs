export const DIR = new URL('../../05-src/codeql-gate/', import.meta.url).href;
export const FINDINGS = DIR + 'lib/findings.mjs';
export const RUNNER = DIR + 'judge-codeql.mjs';
export const an = (category, o = {}) => ({ category, sha: 'abc', ref: 'refs/pull/9/merge', error: '', ...o });
export const alert = (number, severity, security, o = {}) => ({ number, state: 'open', rule: { severity, security_severity_level: security }, ...o });
export const EXPECTED = ['/language:actions', '/language:javascript-typescript'];
export const BOTH = EXPECTED.map((c) => an(c));
export const T = { security: 'high_or_higher', alerts: 'errors' };
