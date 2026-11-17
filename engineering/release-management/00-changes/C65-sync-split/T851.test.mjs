// Case release/T851 tests: release/C65
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repo } from './fixtures.mjs';
export const id = 'release/T851';
export const tests = ['release/C65'];
export const title = 'the workflow source gives verify Sync no token and no API, lets only it fetch the candidate, and keeps approve Sync and review Sync from naming the candidate\'s ref';
export async function run() {
  const yml = readFileSync(join(repo, 'engineering/release-management/05-src/wiring/workflows/sync-review.yml'), 'utf8');
  const code = yml.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  const job = (name) => code.split(/^  (?=[a-z]+:\n    name: )/m).find((j) => j.includes(`name: ${name}`));
  const verify = job('verify Sync'), approve = job('approve Sync'), review = job('review Sync');
  assert.ok(verify && approve && review, 'a job is absent');
  assert.match(verify, /^    permissions: \{\}$/m, 'verify Sync does not hold an empty set of permissions');
  assert.ok(!/GH_TOKEN|github\.token|secrets\./.test(verify), 'verify Sync is handed a token');
  assert.ok(!/gh api|gh pr/.test(verify), 'verify Sync calls an API');
  assert.ok(/KAAL_BODY: \$\{\{ github\.event\.pull_request\.body \}\}/.test(verify) && /KAAL_HEAD: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/.test(verify), 'verify Sync takes the head and the body from the event');
  assert.equal([...verify.matchAll(/git fetch/g)].length, 1, 'verify Sync fetches once');
  assert.ok(verify.includes('refs/pull/${KAAL_PR}/head'), 'verify Sync fetches the candidate');
  for (const [name, j] of [['approve Sync', approve], ['review Sync', review]]) {
    assert.ok(!/git fetch|refs\/pull|KAAL_HEAD/.test(j), `${name} fetches or names the candidate`);
    assert.ok(j.includes('KAAL_VERDICT: ${{ needs.verify.outputs.verdict }}'), `${name} is not handed the verdict`);
    assert.ok(j.includes('ref: ${{ github.event.repository.default_branch }}'), `${name} does not check out the default branch`);
    assert.ok(!/ref: \$\{\{ github\.event\.pull_request/.test(j), `${name} checks out the candidate`);
  }
  assert.ok(!/KAAL_BODY/.test(approve + review), 'the body reaches a job that can write');
}
