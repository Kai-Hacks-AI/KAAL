// Case release/T1608 tests: release/C159. The record of a verdict of the Promotion Source entries names the head the run judged, not the merge commit of the run: the boundary takes `sha` from KAAL_HEAD_SHA, and without a head or a run id there is no boundary.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RUN = join(repo, 'engineering/release-management/05-src/promotion-source/lib/run.mjs');
export const id = 'release/T1608';
export const tests = ['release/C159'];
export const title = 'the record of a verdict of the Promotion Source entries names the judged head, not the merge commit of the run';
export async function run() {
  const { run: entry } = await import(pathToFileURL(RUN).href);
  const seen = [];
  const check = async (_facts, { boundary }) => { seen.push(boundary); return { verdict: 'PASS', kind: 'pass', findings: [], blocked: false }; };
  const base = { KAAL_REPO: 'o/r', KAAL_DEFAULT: 'main', KAAL_HEAD_REPO: 'o/r', KAAL_HEAD_REF: 'kaal/release/x' };
  const go = (env) => entry({ label: 'x', check, read: () => ({}), argv: ['--base-ref', 'main'], env: { ...base, ...env }, out: () => {} });
  await go({ KAAL_HEAD_SHA: 'HEAD1', GITHUB_RUN_ID: '7', GITHUB_SHA: 'MERGE1' });
  assert.deepEqual(seen.at(-1), { x: 'real', run: '7', sha: 'HEAD1' }, 'the record names the head, not GITHUB_SHA');
  await go({ GITHUB_RUN_ID: '7', GITHUB_SHA: 'MERGE1' });
  assert.equal(seen.at(-1), undefined, 'a job without a head gives no boundary');
  await go({ KAAL_HEAD_SHA: 'HEAD1', GITHUB_SHA: 'MERGE1' });
  assert.equal(seen.at(-1), undefined, 'a run without a run id gives no boundary');
}
