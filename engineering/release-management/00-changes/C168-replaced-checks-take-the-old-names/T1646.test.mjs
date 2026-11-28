// Case release/T1646 tests: release/C168. The four required names are the ones in the ruleset definitions the repository holds, so a rename of a reporter without the ruleset is seen.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1646';
export const tests = ['release/C168'];
export const title = 'The four required names are the ones in the ruleset definitions the repository holds, so a rename of a reporter without the ruleset is seen.';
export async function run() {
  const old = JSON.parse(readFileSync(join(repo, 'engineering/release-management/00-changes/C34-ruleset-set-1/baseline-old.json'), 'utf8'));
  const required = new Set(); const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if (typeof v.context === 'string') required.add(v.context); Object.values(v).forEach(walk); } };
  walk(old);
  for (const name of REQUIRED) assert.ok(required.has(name), `${name} is required by the ruleset definitions`);
  const ws = workflows();
  for (const name of REQUIRED) assert.ok(reporters(ws, name, (w) => w.pullRequest).length === 1, name);
}
