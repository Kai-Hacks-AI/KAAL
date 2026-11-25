// Case release/T1398 tests: release/C129
import assert from 'node:assert/strict';
import { ANALYSIS_JUDGE, BOTH, ENV, api, clock, an, alert } from './fixtures.mjs';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export const id = 'release/T1398';
export const tests = ['release/C129'];
export const title = 'verify CodeQL analysis writes its findings and exits 0 even when there are some, exits 2 with no file for every case it cannot tell, and takes sha and ref from the environment only';
export async function run() {
  const { runAnalysisJudge } = await import(ANALYSIS_JUDGE);
  const out = join(mkdtempSync(join(tmpdir(), 'cq-')), 'findings.json');
  const go = (env, a) => runAnalysisJudge({ env, out, fetchJson: a.fetchJson, ...clock() });
  const clean = api(BOTH); const r1 = await go(ENV, clean); assert.equal(r1.code, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), []);
  assert.ok(clean.urls.every((u) => u.includes('/repos/o/r/code-scanning/analyses') && u.includes('sha=abc') && u.includes('ref=refs%2Fpull%2F9%2Fmerge')));
  assert.ok(!clean.urls.some((u) => u.includes('/alerts')), 'it asks for no alert');
  const failed = await go({ ...ENV, CODEQL_ANALYZE_RESULT: 'failure' }, api([BOTH[1], an('/language:python')], [alert(3, 'error', 'high')]));   // an analysis failed: nothing will arrive, so no wait
  assert.equal(failed.code, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), ['missing:/language:actions']);
  for (const [env, a] of [[ENV, api(new Error('502'))], [ENV, api([BOTH[1]])], [{ ...ENV, CODEQL_EXPECTED: '' }, api(BOTH)], [{ ...ENV, GITHUB_SHA: '' }, api(BOTH)], [{ ...ENV, GITHUB_REF: '' }, api(BOTH)]]) {
    writeFileSync(out, '["stale"]'); const r = await go(env, a); assert.equal(r.code, 2); assert.ok(r.reason); assert.equal(existsSync(out), false);
  }
}
