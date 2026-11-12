// Case pull/T14 tests: pull/F14, pull/F15, pull/F16, pull/F17, pull/F18
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T14';
export const tests = ['pull/F14', 'pull/F15', 'pull/F16', 'pull/F17', 'pull/F18'];
export const title = 'the command reads the real repository on any provisioned runner with an explicit read-only credential, issues only reads, leaves a defined snapshot of host state identical, fails naming what is missing, and emits acceptance evidence tied to the exact implementation head and host state';
// Observation boundary (pull/F16). PROVED: every request through the one reader is a read to the repository's host; the snapshot below is identical before the first run and after the last
// on an otherwise quiet host. NOT PROVED: mutations outside the snapshot, a command that bypasses the reader, an adversarial adapter.
const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const sorted = (rows, key) => [...rows].sort((a, b) => (a[key] < b[key] ? -1 : 1));
function snapshot(live) {
  const prs = JSON.parse(gh(['pr', 'list', '--repo', live, '--state', 'open', '--limit', '500', '--json', 'number,state,isDraft,autoMergeRequest,headRefOid,baseRefName,labels,assignees,reviewRequests,mergeStateStatus,mergeable']));
  const branches = gh(['api', `repos/${live}/branches`, '--paginate', '--jq', '.[] | {name, sha: .commit.sha}']).split('\n').filter(Boolean).map((line) => JSON.parse(line));
  const settings = JSON.parse(gh(['api', `repos/${live}`, '--jq', '{allow_auto_merge, allow_squash_merge, allow_merge_commit, allow_rebase_merge, delete_branch_on_merge, default_branch}']));
  let rulesets = 'unreadable';
  try { rulesets = JSON.parse(gh(['api', `repos/${live}/rulesets`, '--jq', '[.[] | {id, name, enforcement, updated_at}]'])); } catch { /* recorded as unreadable, not as empty */ }
  return { prs: sorted(prs, 'number'), branches: sorted(branches, 'name'), settings, rulesets };
}
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const readsOnly = (line) => {
  const entry = JSON.parse(line);
  if (entry.kind === 'graphql') return entry.operation === 'query' && !/\bmutation\b/i.test(JSON.stringify(entry));
  return entry.method === 'GET' && /^(api\.github\.com|github\.com)$/.test(entry.host);
};
export async function run() {
  const live = process.env.KAAL_LIVE;
  const collector = process.env.KAAL_COLLECTOR;
  assert.ok(live && collector, 'KAAL_LIVE=<owner/repo> and KAAL_COLLECTOR=<collector> are required: this Case runs against the real host and is not simulated');
  const dir = join(repoRoot, 'engineering/release-management/05-src/pull-promotion');
  const declared = join(dir, 'declaration.json');
  const audit = join(mkdtempSync(join(tmpdir(), 'pull-audit-')), 'audit.jsonl');
  const implementationHead = execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.equal(execFileSync('git', ['-C', repoRoot, 'status', '--porcelain'], { encoding: 'utf8' }).trim(), '', 'the checkout under test is not clean: the evidence would not name an exact head');

  // the baseline is taken before the command runs for the first time
  const before = snapshot(live);
  const out = execFileSync('node', [join(dir, 'run.mjs'), live, declared, collector, '--audit', audit], { encoding: 'utf8' });
  const result = JSON.parse(out);
  assert.ok(['READY', 'BLOCKED', 'NOT JUDGED'].includes(result.verdict), 'no verdict');
  assert.equal(result.judgments.length, 6);
  assert.ok(result.judgments.every((j) => j.owner && ['PASS', 'FAIL', 'UNKNOWN'].includes(j.status)), 'a judgment without an owner or a status');
  assert.ok(result.judgments.filter((j) => j.status === 'UNKNOWN').every((j) => j.missing.length > 0), 'an unknown judgment without the missing evidence');
  assert.ok(result.judgments.filter((j) => j.status !== 'PASS').every((j) => j.because), 'a judgment that did not pass without a reason');
  assert.ok(['OPEN', 'REVIEW', 'REVISE', 'LAND', 'WAIT', null].includes(result.next.action), 'an action outside the five');

  // read-only, part one: every request the command made through the reader is a read to the repository's host
  const lines = readFileSync(audit, 'utf8').split('\n').filter(Boolean);
  assert.ok(lines.length > 0, 'the audit is empty: the command made no recorded request, so nothing is proved');
  const writes = lines.filter((line) => !readsOnly(line));
  assert.deepEqual(writes, [], 'the audit holds a request that is not a read');

  // read-only, part two: the snapshot of host state is identical after the last run (the host must be otherwise quiet; a difference is investigated, never excused)
  execFileSync('node', [join(dir, 'run.mjs'), live, declared, collector], { encoding: 'utf8' });
  const after = snapshot(live);
  assert.deepEqual(after, before, 'the snapshot of host state changed between the first run and the last');

  // explicit authentication: with no supported credential the command fails naming it, and does not fall back to anything else
  const bare = spawnSync('node', [join(dir, 'run.mjs'), live, declared, collector], { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: mkdtempSync(join(tmpdir(), 'pull-nohome-')) } });
  assert.notEqual(bare.status, 0, 'the command ran without a supported credential');
  assert.match(String(bare.stderr), /GH_TOKEN|GITHUB_TOKEN|gh auth|credential/i, 'the missing credential is not named');
  const failed = spawnSync('node', [join(dir, 'run.mjs'), 'no-such-owner-xyz/none', declared, collector], { encoding: 'utf8' });
  assert.notEqual(failed.status, 0);
  assert.match(String(failed.stderr), /could not|cannot|not read|unreach/i, 'an unreadable host did not fail naming what could not be read');

  // the acceptance record is tied to the exact implementation head and host state
  const record = JSON.parse(execFileSync('node', [join(dir, 'run.mjs'), live, declared, collector, '--record'], { encoding: 'utf8' }));
  assert.equal(record.implementationHead, implementationHead, 'the record names another head than the one that ran');
  assert.equal(record.snapshotDigest, digest(before), 'the record names another host state than the one observed');
  assert.ok(record.collector === collector && record.collectorHead && record.credentialKind && record.runnerKind && record.at, 'the record omits the collector head, credential kind, runner kind or time');
  assert.ok(!JSON.stringify(record).includes(process.env.GH_TOKEN ?? '\u0000'), 'the record holds the credential');
}
