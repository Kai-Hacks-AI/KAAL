// Case pull/T14 tests: pull/F14 (acceptance on the real host, run on the Owner's device)
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T14';
export const tests = ['pull/F14'];
export const title = 'the command reads the real repository through the signed-in host reader and prints the verdict of one real collector with its owners and missing evidence, changes nothing, or fails naming what it could not read';
// Needs the host reader signed in, so it is not part of CI: run by hand,
// KAAL_LIVE=<owner/repo> KAAL_COLLECTOR=<collector> node -e "import('./T14.red.mjs').then(m => m.run())"
export async function run() {
  const live = process.env.KAAL_LIVE;
  const collector = process.env.KAAL_COLLECTOR;
  assert.ok(live && collector, 'KAAL_LIVE=<owner/repo> and KAAL_COLLECTOR=<collector> are required: this Case runs against the real host and is not simulated');
  const dir = join(repo, 'engineering/release-management/05-src/pull-promotion');
  const declared = join(dir, 'declaration.json');
  // the baseline of the host is captured before the command runs for the first time, so a mutation by any run is seen
  const before = execFileSync('gh', ['pr', 'list', '--repo', live, '--state', 'open', '--json', 'number,isDraft,autoMergeRequest,headRefOid'], { encoding: 'utf8' });
  const out = execFileSync('node', [join(dir, 'run.mjs'), live, declared, collector], { encoding: 'utf8' });
  const result = JSON.parse(out);
  assert.ok(['READY', 'BLOCKED', 'NOT JUDGED'].includes(result.verdict), 'no verdict');
  assert.equal(result.judgments.length, 6);
  assert.ok(result.judgments.every((j) => j.owner && ['PASS', 'FAIL', 'UNKNOWN'].includes(j.status)), 'a judgment without an owner or a status');
  assert.ok(result.judgments.filter((j) => j.status === 'UNKNOWN').every((j) => j.missing.length > 0), 'an unknown judgment without the missing evidence');
  assert.ok(result.judgments.filter((j) => j.status !== 'PASS').every((j) => j.because), 'a judgment that did not pass without a reason');
  assert.ok(['OPEN', 'REVIEW', 'REVISE', 'LAND', 'WAIT', null].includes(result.next.action), 'an action outside the five');
  // read-only: the repository's open pieces and their states are the same after the run
  execFileSync('node', [join(dir, 'run.mjs'), live, declared, collector], { encoding: 'utf8' });
  const after = execFileSync('gh', ['pr', 'list', '--repo', live, '--state', 'open', '--json', 'number,isDraft,autoMergeRequest,headRefOid'], { encoding: 'utf8' });
  assert.equal(after, before, 'the run changed the open pieces');
  const failed = spawnSync('node', [join(dir, 'run.mjs'), 'no-such-owner-xyz/none', declared, collector], { encoding: 'utf8' });
  assert.notEqual(failed.status, 0);
  assert.match(String(failed.stderr), /could not|cannot|not read|unreach/i, 'an unreadable host did not fail naming what could not be read');
}
