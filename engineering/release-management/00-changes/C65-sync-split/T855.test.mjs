// Case release/T855 tests: release/C65
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repo } from './fixtures.mjs';
export const id = 'release/T855';
export const tests = ['release/C65'];
export const title = 'no job of the workflow source that can write holds a fetch of the candidate, the shape CodeQL read as a checkout of untrusted code in a privileged context';
// Observed in the experiment #1887 with CodeQL's actions queries (17 Nov 2026): a job with a write token that fetched the candidate was
// flagged, also when it fetched by commit name; the same job with `permissions: {}` and a write job that never fetched were not. This Case
// states that shape. Only CodeQL on the installed copy (the WIRE's check run) shows the scanner agrees.
export async function run() {
  const yml = readFileSync(join(repo, 'engineering/release-management/05-src/wiring/workflows/sync-review.yml'), 'utf8');
  const code = yml.split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  const jobs = code.split(/^  (?=[a-z]+:\n    name: )/m).slice(1);
  assert.equal(jobs.length, 3, 'three jobs');
  assert.match(code, /^permissions: \{\}$/m);
  for (const j of jobs) {
    const writes = /^      [a-z-]+: write$/m.test(j) || /GH_TOKEN|github\.token|secrets\./.test(j);
    const reads = /git fetch|git checkout|git switch|git merge|git worktree|refs\/pull|pull_request\.head\.(ref|sha)(?!\n)/.test(j.replace(/KAAL_HEAD: \$\{\{ github\.event\.pull_request\.head\.sha \}\}/g, ''));
    assert.ok(!(writes && reads), `a job that can write reads the candidate: ${j.split('\n')[1].trim()}`);
  }
  assert.ok(jobs.some((j) => /git fetch/.test(j) && /^    permissions: \{\}$/m.test(j)), 'the one fetch is in a job with no permissions');
  assert.ok(!/pull_request_target[\s\S]*actions\/checkout[\s\S]*ref: \$\{\{ github\.(head_ref|event\.pull_request)/.test(code), 'the candidate is checked out');
}
