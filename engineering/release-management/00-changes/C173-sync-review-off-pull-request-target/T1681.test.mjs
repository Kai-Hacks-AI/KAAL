// Case release/T1681 tests: release/C173
import assert from 'node:assert/strict';
import { source, jobOf, world } from './fixture.mjs';
export const id = 'release/T1681';
export const tests = ['release/C173'];
export const title = 'the candidate is fetched as Git data and never checked out, built, installed or run, and a head the job cannot read is refused with no verdict of PASS';
export async function run() {
  const verify = source('sync-verify-plain.yml');
  const job = jobOf(verify, 'verify Sync');
  assert.equal([...job.matchAll(/git fetch/g)].length, 1);
  assert.ok(job.includes('refs/pull/${KAAL_PR}/head'), 'the candidate is not fetched from its pull ref');
  assert.ok(!/ref: \$\{\{ github\.(event\.pull_request|head_ref)/.test(job), 'the candidate is checked out');
  assert.ok(job.includes('ref: ${{ github.event.repository.default_branch }}'), 'the default branch is not the trusted judge');
  assert.ok(!/\b(npm|npx|pnpm|yarn|make|git checkout|git switch|git merge|git worktree)\b/.test(job), 'the candidate is built, installed or checked out');
  // the head read must equal the event's head: an unreadable head is UNKNOWN, written to the file as data, and approves nothing
  const x = await world();
  const { verify: runVerify } = await import('../C65-sync-split/fixtures.mjs').then((m) => m.load('cli.mjs'));
  let file;
  x.w.reset();
  const code = runVerify(x.w.env({ KAAL_HEAD: '0'.repeat(40), KAAL_VERDICT_FILE: '/v.json', KAAL_RUN_ID: '9' }), x.deps({ writeFile: (_p, t) => { file = t; } }));
  assert.equal(code, 2);
  assert.equal(JSON.parse(file).verdict.outcome, 'UNKNOWN');
  assert.equal(JSON.parse(file).head, '0'.repeat(40));
  x.w.done();
}
