// Case release/T1293 tests: release/F83
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/queue/judge-queue.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C107-check-queue/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const SHA = 'a'.repeat(40);
export const id = 'release/T1293';
export const tests = ['release/F83'];
export const title = 'a pull request of the merge queue is named by the ref of its merge group, gh-readonly-queue/<base>/pr-<n>-<40 hex>, with or without refs/heads/, and any other ref names none';
export async function run() {
  const { pullOfGroupRef } = await import(pathToFileURL(SRC).href);
  assert.equal(pullOfGroupRef(`gh-readonly-queue/main/pr-2145-${SHA}`), 2145);
  assert.equal(pullOfGroupRef(`refs/heads/gh-readonly-queue/main/pr-7-${SHA}`), 7);
  assert.equal(pullOfGroupRef(`refs/heads/gh-readonly-queue/release/x/pr-12-${SHA}`), 12, 'a base with a slash');
  for (const bad of [undefined, null, 5, '', 'main', 'refs/heads/main', 'kaal/release/pr-7', `gh-readonly-queue/main/pr-0-${SHA}`, `gh-readonly-queue/main/pr-07-${SHA}`, 'gh-readonly-queue/main/pr-7-abc', `gh-readonly-queue/main/pr--7-${SHA}`, `gh-readonly-queue/main/7-${SHA}`, `x/gh-readonly-queue/main/pr-7-${SHA}`, `gh-readonly-queue/main/pr-7-${SHA}/x`, `gh-readonly-queue/main/pr-7-${'g'.repeat(40)}`, `gh-readonly-queue/main/pr-7-${'a'.repeat(39)}`, `gh-readonly-queue/main/pr-7-${'a'.repeat(41)}`]) assert.equal(pullOfGroupRef(bad), undefined, `${bad} names no pull request`);
}
