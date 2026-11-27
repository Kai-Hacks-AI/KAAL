// Case release/T1603 tests: release/C165. The record of a verdict names the head the run judged, not the merge commit of the run: the boundary of the shared command line takes `sha` from `--head`, and without a head or a run id there is no boundary.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const REPORT = join(repo, 'engineering/release-management/05-src/change-isolation/lib/report.mjs');
export const id = 'release/T1603';
export const tests = ['release/C165'];
export const title = 'the record of a verdict names the judged head, not the merge commit of the run';
export async function run() {
  const { cli } = await import(pathToFileURL(REPORT).href);
  const seen = [];
  const check = async ({ boundary }) => { seen.push(boundary); return { verdict: 'PASS', findings: [], blocked: false }; };
  const go = (argv, env) => cli({ check, label: 'x', argv, env, cwd: repo, out: () => {} });
  await go(['--head', 'HEAD1', '--base', 'BASE1'], { GITHUB_RUN_ID: '7', GITHUB_SHA: 'MERGE1' });
  assert.deepEqual(seen.at(-1), { x: 'real', run: '7', sha: 'HEAD1' }, 'the record names the head, not GITHUB_SHA');
  await go(['--base', 'BASE1'], { GITHUB_RUN_ID: '7', GITHUB_SHA: 'MERGE1' });
  assert.equal(seen.at(-1), undefined, 'a command line without a head gives no boundary');
  await go(['--head', 'HEAD1', '--base', 'BASE1'], { GITHUB_SHA: 'MERGE1' });
  assert.equal(seen.at(-1), undefined, 'a run without a run id gives no boundary');
}
