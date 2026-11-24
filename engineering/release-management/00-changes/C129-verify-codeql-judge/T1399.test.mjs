// Case release/T1399 tests: release/C129
import assert from 'node:assert/strict';
import { FINDINGS_JUDGE, BOTH, ENV, api, clock, an, alert } from './fixtures.mjs';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export const id = 'release/T1399';
export const tests = ['release/C129'];
export const title = 'verify CodeQL findings writes the alerts at or above the threshold, and exits 2 with no file for every case it cannot tell, an expected analysis that is absent included';
export async function run() {
  const { runFindingsJudge } = await import(FINDINGS_JUDGE);
  const out = join(mkdtempSync(join(tmpdir(), 'cq-')), 'findings.json');
  const go = (env, a) => runFindingsJudge({ env, out, fetchJson: a.fetchJson, ...clock() });
  const clean = api(BOTH, [alert(1, 'warning', 'medium')]); const r1 = await go(ENV, clean); assert.equal(r1.code, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), []);
  assert.ok(clean.urls.some((u) => u.includes('/code-scanning/alerts') && u.includes('ref=refs%2Fpull%2F9%2Fmerge') && u.includes('state=open')));
  const some = await go(ENV, api(BOTH, [alert(3, 'error', 'high'), alert(4, 'warning', 'low')])); assert.equal(some.code, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), ['alert:3']);
  for (const [env, a] of [
    [ENV, api(new Error('502'))],
    [{ ...ENV, CODEQL_ANALYZE_RESULT: 'failure' }, api([BOTH[1]], [])],      // an analysis is absent: an alert set it cannot trust is never clean
    [ENV, api([BOTH[1]], [])],                                                // success, but one never arrives: the wait ends
    [{ ...ENV, CODEQL_SECURITY_ALERTS_THRESHOLD: 'bogus' }, api(BOTH)],
    [{ ...ENV, CODEQL_ALERTS_THRESHOLD: '' }, api(BOTH)],
    [{ ...ENV, GITHUB_SHA: '' }, api(BOTH)],
  ]) { writeFileSync(out, '["stale"]'); const r = await go(env, a); assert.equal(r.code, 2); assert.ok(r.reason); assert.equal(existsSync(out), false); }
  const errored = await go(ENV, api([an('/language:actions', { error: 'x' }), BOTH[1]], [])); assert.equal(errored.code, 0);   // an errored analysis is the other control's finding, not this one's
  assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), []);
}
