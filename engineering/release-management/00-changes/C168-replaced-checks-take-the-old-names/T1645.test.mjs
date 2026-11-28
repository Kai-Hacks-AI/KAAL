// Case release/T1645 tests: release/C168. No context with the (legacy marker is required by any ruleset definition held in the repository.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1645';
export const tests = ['release/C168'];
export const title = 'No context with the (legacy marker is required by any ruleset definition held in the repository.';
export async function run() {
  const dirs = [join(repo, 'engineering/release-management/05-src/wiring/rulesets'), join(repo, 'engineering/release-management/00-changes/C34-ruleset-set-1')];
  for (const d of dirs) for (const f of readdirSync(d).filter((x) => x.endsWith('.json'))) assert.equal(readFileSync(join(d, f), 'utf8').includes('(legacy'), false, f);
}
