// Case release/T1689 tests: release/C173. review Sync asks the Approver App for the pull request permission only, never the issues permission, and the operations it performs are labels, comments and review requests of the pull request, which that permission covers; without the App token the job fails loudly.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = join(repo, 'engineering/release-management/05-src');
export const id = 'release/T1689';
export const tests = ['release/C173'];
export const title = 'review Sync mints the Approver token with pull-requests write only and no issues permission, and every operation it performs is on the pull request or its issue number';
export async function run() {
  const y = readFileSync(join(SRC, 'wiring/workflows/sync-act.yml'), 'utf8').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  const mints = [...y.matchAll(/uses: actions\/create-github-app-token@[0-9a-f]{40}[\s\S]*?(?=\n      - |\n  [a-z]+:\n|$)/g)].map((m) => m[0]).filter((m) => /APPROVER/.test(m));
  assert.equal(mints.length, 1, 'the Approver token is minted once');
  const perms = [...mints[0].matchAll(/permission-([a-z-]+): (\w+)/g)].map((m) => `${m[1]}:${m[2]}`);
  assert.deepEqual(perms, ['pull-requests:write'], 'the Approver token asks for the pull request permission and nothing else');
  assert.doesNotMatch(y, /permission-issues|issues: write/, 'no issues permission is asked anywhere');
  // the calls of review Sync are all under the pull request or its issue number
  const cli = readFileSync(join(SRC, 'sync-review/cli.mjs'), 'utf8');
  const review = cli.slice(cli.indexOf('export function review'));
  const endpoints = [...review.matchAll(/repos\/\$\{[^}]+\}\/([a-z_]+)\/\$\{[^}]+\}\/([a-z_]+)/g)].map((m) => `${m[1]}/${m[2]}`);
  assert.ok(endpoints.length > 0, 'review Sync reads or writes nothing?');
  for (const e of endpoints) assert.ok(['issues/labels', 'issues/comments', 'pulls/requested_reviewers', 'pulls/reviews'].includes(e), `${e} is not a pull request operation`);
  // no App token fails loudly
  assert.match(y, /if: \$\{\{ steps\.app\.outputs\.token == '' \}\}[\s\S]*?exit 1/, 'a missing App token does not fail the job');
}
