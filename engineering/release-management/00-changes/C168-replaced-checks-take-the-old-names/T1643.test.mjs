// Case release/T1643 tests: release/C168. Each aggregator fails when a needed job failed, was skipped or was cancelled and passes only when every needed job succeeded; it holds no permission, no checkout and no secret.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters, runAggregator } from './fixture.mjs';
export const id = 'release/T1643';
export const tests = ['release/C168'];
export const title = 'Each aggregator fails when a needed job failed, was skipped or was cancelled and passes only when every needed job succeeded; it holds no permission, no checkout and no secret.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of [['change-isolation-plain.yml', 'Change Isolation', ['github-alone', 'delivery']], ['branching-plain.yml', 'Branching', ['freshness', 'synchronization', 'auto-merge']], ['promotion-source-plain.yml', 'Promotion Source', ['origin', 'head-evidence']]]) {
    const w = ws.find((x) => x.file === file); const j = w.jobs.find((x) => x.name === name); assert.ok(j, name);
    assert.deepEqual(j.needs, needs, name); assert.match(j.ifs, /always\(\)/); assert.equal(j.permissions, '{}');
    const body = j.lines.join('\n'); assert.equal(/checkout|secrets\./.test(body), false, `${name} holds no checkout or secret`);
    const ok = Object.fromEntries(needs.map((n) => [n, 'success']));
    assert.equal(runAggregator(j, ok).status, 0, `${name} passes when all succeeded`);
    for (const bad of ['failure', 'skipped', 'cancelled']) assert.equal(runAggregator(j, { ...ok, [needs[0]]: bad }).status, 1, `${name} ${bad}`);
  }
}
