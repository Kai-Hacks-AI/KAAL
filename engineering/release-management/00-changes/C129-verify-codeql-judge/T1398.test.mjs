// Case release/T1398 tests: release/C129
import assert from 'node:assert/strict';
import { RUNNER, BOTH, an, alert } from './fixtures.mjs';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export const id = 'release/T1398';
export const tests = ['release/C129'];
export const title = 'the command writes the findings and exits 0 even when there are some, exits 2 with no file for every case it cannot tell, and takes sha and ref from the environment only';
export async function run() {
  const { runJudge } = await import(RUNNER);
  const out = join(mkdtempSync(join(tmpdir(), 'cq-')), 'findings.json');
  const env = { GITHUB_REPOSITORY: 'o/r', GITHUB_SHA: 'abc', GITHUB_REF: 'refs/pull/9/merge', GITHUB_TOKEN: 't', CODEQL_EXPECTED: '/language:actions /language:javascript-typescript', CODEQL_ANALYZE_RESULT: 'success', CODEQL_SECURITY_ALERTS_THRESHOLD: 'high_or_higher', CODEQL_ALERTS_THRESHOLD: 'errors' };
  const urls = [];
  const fetchJson = (analyses, alerts) => async (url) => { urls.push(url); if (analyses instanceof Error) throw analyses; return url.includes('/analyses') ? analyses : alerts; };
  let t = 0;   // the clock moves only when the command sleeps
  const run = (e, f) => { t = 0; return runJudge({ env: e, out, fetchJson: f, sleep: async (ms) => { t += ms; }, now: () => t }); };
  const clean = await run(env, fetchJson(BOTH, [])); assert.equal(clean.code, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), []);
  assert.ok(urls.every((u) => u.includes('/repos/o/r/code-scanning/')) && urls.some((u) => u.includes('sha=abc')) && urls.every((u) => u.includes('ref=refs%2Fpull%2F9%2Fmerge') || u.includes('ref=refs/pull/9/merge')));
  const some = await run({ ...env, CODEQL_ANALYZE_RESULT: 'failure' }, fetchJson([BOTH[1]], [alert(3, 'error', 'high')]));   // an analysis failed: nothing will arrive, so no wait assert.equal(some.code, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), ['alert:3', 'missing:/language:actions']);
  writeFileSync(out, '[]');
  for (const [e, f] of [[env, fetchJson(new Error('502'))], [env, fetchJson([BOTH[1]], [])],   // success, but one analysis never arrives: the wait ends in UNKNOWN
     [{ ...env, CODEQL_EXPECTED: '' }, fetchJson(BOTH, [])], [{ ...env, CODEQL_SECURITY_ALERTS_THRESHOLD: 'bogus' }, fetchJson(BOTH, [])], [{ ...env, GITHUB_SHA: '' }, fetchJson(BOTH, [])]]) {
    writeFileSync(out, '["stale"]'); const r = await run(e, f); assert.equal(r.code, 2); assert.ok(r.reason); assert.equal(existsSync(out), false);
  }
}
