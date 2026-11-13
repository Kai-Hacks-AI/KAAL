// Case pull/T14 tests: pull/F14, pull/F15
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T14';
export const tests = ['pull/F14', 'pull/F15'];
export const title = 'the command, run on the real repository, prints a result for every declared collector and the qualifiers in the declared order, fails naming what is missing, and its gatherer issues only reads and reads the file state, the history by ancestry and the Case executions of the exact head';
// Always: the credential failure, the read-only source check and the recorded live run. With KAAL_LIVE=<owner/repo>: the command is run on the real host again.
function shows(result, names) {
  assert.deepEqual(result.collectors.map((c) => c.name), names, 'the result does not hold one entry per declared collector, in the declared order');
  for (const c of result.collectors) {
    assert.ok(['qualifies', 'does not qualify', 'not judged'].includes(c.status), `${c.name}: no status`);
    if (c.status !== 'qualifies') assert.ok(c.missing.length > 0, `${c.name}: ${c.status} without saying what is missing`);
  }
  const order = result.collectors.filter((c) => c.status === 'qualifies').map((c) => c.name);
  assert.deepEqual(result.qualifiers, order, 'the qualifiers are not those that qualify, in the declared order');
}
export async function run() {
  const live = process.env.KAAL_LIVE;
  const dir = join(repoRoot, 'engineering/release-management/05-src/pull-promotion');
  const declared = join(dir, 'declaration.json');
  const command = (args, options = {}) => spawnSync('node', [join(dir, 'run.mjs'), ...args], { encoding: 'utf8', ...options });
  const declaration = JSON.parse(readFileSync(declared, 'utf8'));
  const names = declaration.collectors.map((c) => c.name ?? c);

  // the gatherer's reading of the host's records, on the recorded log of a real CI job and on small records of the host's comparison
  const read = await import(pathToFileURL(join(dir, 'read.mjs')).href);
  const log = readFileSync(join(dir, 'evidence/ci-log-excerpt.txt'), 'utf8');
  const runs = [{ job: 1, text: log }];
  const seen = read.executionsOf(runs, 'H');
  assert.deepEqual(seen.map((e) => e.case).sort(), ['foundation/T16', 'foundation/T17', 'foundation/T18', 'foundation/T19', 'foundation/T20', 'foundation/T21', 'release/T1', 'release/T2', 'release/T3', 'release/T4'], 'the Cases of the recorded log are not those reported under a scoped id');
  assert.ok(seen.every((e) => e.head === 'H' && e.conclusion === 'success' && /^\d{4}-\d\d-\d\dT/.test(e.at)), 'an execution does not carry its head, its conclusion and its time');
  // the newest run of a job counts; a failure of any job at the head counts against the Case
  const failed = log.replace('✔ release/T2', '✖ release/T2');
  assert.equal(read.executionsOf([{ job: 1, text: log }, { job: 2, text: failed }], 'H').find((e) => e.case === 'release/T2').conclusion, 'failure', 'a red job did not count');
  const rerun = `${failed}\n2026-11-13T16:00:00.0000000Z ✔ release/T2 (1ms)`;
  assert.equal(read.executionsOf([{ job: 1, text: rerun }], 'H').find((e) => e.case === 'release/T2').conclusion, 'success', 'the newest run of a job did not win');
  assert.deepEqual(read.executionsOf([{ job: 1, text: '2026-11-13T15:00:00.0Z   ✔ T19 (1ms)\nno marks here' }], 'H'), [], 'an unscoped name was taken for a Case');
  // history: ancestry, not order of arrival
  const c = (sha, parent) => ({ sha, parents: [{ sha: parent }] });
  assert.deepEqual(read.historyOf([c('b', 'a'), c('c', 'b')], 'a'), ['b', 'c']);
  assert.throws(() => read.historyOf([c('c', 'b'), c('b', 'a')], 'a'), /could not order the history/, 'a history out of ancestry was accepted');
  assert.throws(() => read.historyOf([c('b', 'x')], 'a'), /could not order the history/, 'a history that does not start at the merge base was accepted');
  // the delta keeps added, modified and removed apart, and a rename is a removal and an addition
  assert.deepEqual(read.deltaOf([{ filename: 'a', status: 'added' }, { filename: 'b', status: 'removed' }, { filename: 'n', status: 'renamed', previous_filename: 'o' }]), [{ path: 'a', status: 'added' }, { path: 'b', status: 'removed' }, { path: 'n', status: 'modified' }, { path: 'o', status: 'removed' }]);

  // no usable credential: the command fails naming what is missing (no network is needed)
  const bare = command(['some-owner/some-repo', declared], { env: { PATH: process.env.PATH, HOME: mkdtempSync(join(tmpdir(), 'pull-nohome-')) } });
  assert.equal(bare.status, 2, 'the command ran without a supported credential');
  assert.match(String(bare.stderr), /GH_TOKEN|GITHUB_TOKEN|gh auth|credential/i, 'the missing credential is not named');

  // read-only by construction: the sources of the command hold no request that is not a GET
  const sources = readdirSync(dir).filter((f) => /\.mjs$/.test(f)).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  assert.ok(!/(-X|--method)\s*['"]?(POST|PUT|PATCH|DELETE)\b/i.test(sources), 'a source holds a request that is not a GET');
  assert.ok(!/\bmutation\b/.test(sources), 'a source holds a GraphQL mutation');
  assert.ok(/'-X', 'GET'/.test(sources), 'the gatherer does not name GET for its requests');

  // the recorded run on the real repository: one entry per declared collector, in the declared order, and the qualifiers in that order
  const recorded = JSON.parse(readFileSync(join(dir, 'evidence/live-report.json'), 'utf8'));
  shows(recorded, names);
  assert.ok(existsSync(join(dir, 'evidence/live-run.md')), 'the record of the live run is missing');

  if (!live) return;
  const ok = command([live, declared]);
  assert.equal(ok.status, 0, `the command failed: ${ok.stderr}`);
  shows(JSON.parse(ok.stdout), names);
  assert.ok(!/\bREADY\b|may promote/i.test(ok.stdout), 'the output claims readiness or an authorization');

  // an unreadable host fails naming what could not be read
  const unreadable = command(['no-such-owner-xyz/none', declared]);
  assert.notEqual(unreadable.status, 0);
  assert.match(String(unreadable.stderr), /could not|cannot|not read|unreach/i, 'an unreadable host did not fail naming what could not be read');
}
