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
// on an otherwise quiet host, and the audits and the snapshots cover every invocation of the command in this Case. NOT PROVED: mutations outside the snapshot, a command that bypasses the reader, an adversarial adapter.
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
  const work = mkdtempSync(join(tmpdir(), 'pull-audit-'));
  const implementationHead = execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.equal(execFileSync('git', ['-C', repoRoot, 'status', '--porcelain'], { encoding: 'utf8' }).trim(), '', 'the checkout under test is not clean: the evidence would not name an exact head');

  // EVERY invocation of the command in this Case, successful or not, writes its own audit; none runs outside it
  const audits = [];
  const invoke = (name, args, options = {}) => {
    const file = join(work, `${name}.jsonl`);
    audits.push(file);
    return spawnSync('node', [join(dir, 'run.mjs'), ...args, '--audit', file], { encoding: 'utf8', ...options });
  };

  // the baseline is taken before the command runs for the first time
  const before = snapshot(live);

  // failures first: no supported credential, and an unreadable host. Each must fail naming what is missing, and is audited like the rest
  const bare = invoke('no-credential', [live, declared, collector], { env: { PATH: process.env.PATH, HOME: mkdtempSync(join(tmpdir(), 'pull-nohome-')) } });
  assert.notEqual(bare.status, 0, 'the command ran without a supported credential');
  assert.match(String(bare.stderr), /GH_TOKEN|GITHUB_TOKEN|gh auth|credential/i, 'the missing credential is not named');
  const unreadable = invoke('unreadable-host', ['no-such-owner-xyz/none', declared, collector]);
  assert.notEqual(unreadable.status, 0);
  assert.match(String(unreadable.stderr), /could not|cannot|not read|unreach/i, 'an unreadable host did not fail naming what could not be read');

  // the successful executions that acceptance rests on: the verdict, a repeat, and the acceptance record
  const first = invoke('verdict', [live, declared, collector]);
  assert.equal(first.status, 0, `the command failed: ${first.stderr}`);
  const result = JSON.parse(first.stdout);
  assert.ok(['READY', 'BLOCKED', 'NOT JUDGED'].includes(result.verdict), 'no verdict');
  assert.equal(result.judgments.length, 6);
  assert.ok(result.judgments.every((j) => j.owner && ['PASS', 'FAIL', 'UNKNOWN'].includes(j.status)), 'a judgment without an owner or a status');
  assert.ok(result.judgments.filter((j) => j.status === 'UNKNOWN').every((j) => j.missing.length > 0), 'an unknown judgment without the missing evidence');
  assert.ok(result.judgments.filter((j) => j.status !== 'PASS').every((j) => j.because), 'a judgment that did not pass without a reason');
  assert.ok(['OPEN', 'REVIEW', 'REVISE', 'LAND', 'WAIT', null].includes(result.next.action), 'an action outside the five');
  const repeat = invoke('repeat', [live, declared, collector]);
  assert.equal(repeat.status, 0);
  const recorded = invoke('record', [live, declared, collector, '--record']);
  assert.equal(recorded.status, 0, `the record run failed: ${recorded.stderr}`);
  const record = JSON.parse(recorded.stdout);

  // the final snapshot is taken after ALL executions, and compared with the baseline taken before the first
  const after = snapshot(live);
  assert.deepEqual(after, before, 'the snapshot of host state changed between before the first invocation and after the last');

  // read-only, part one: every request of every invocation (successful or not) is a read to the repository's host; the audits are the evidence inspected
  const lines = audits.flatMap((file) => { try { return readFileSync(file, 'utf8').split('\n').filter(Boolean); } catch { return []; } });
  assert.ok(lines.length > 0, 'the audits are empty: no recorded request, so nothing is proved');
  for (const name of ['verdict', 'repeat', 'record']) assert.ok(readFileSync(join(work, `${name}.jsonl`), 'utf8').trim().length > 0, `the audit of the ${name} run is empty`);
  assert.deepEqual(lines.filter((line) => !readsOnly(line)), [], 'an audit holds a request that is not a read');

  // the acceptance record names what was actually inspected: the exact head, the host state observed, and the audits read
  assert.equal(record.implementationHead, implementationHead, 'the record names another head than the one that ran');
  assert.equal(record.snapshotDigest, digest(after), 'the record names another host state than the one observed last');
  assert.equal(record.snapshotDigest, digest(before), 'the record names a host state that differs from the baseline');
  assert.equal(record.auditDigest, digest(lines), 'the record names other audits than the ones inspected');
  assert.equal(record.invocations, audits.length, 'the record does not count every invocation');
  assert.ok(record.collector === collector && record.collectorHead && record.credentialKind && record.runnerKind && record.at, 'the record omits the collector head, credential kind, runner kind or time');
  assert.ok(!JSON.stringify(record).includes(process.env.GH_TOKEN ?? '\u0000'), 'the record holds the credential');
}
