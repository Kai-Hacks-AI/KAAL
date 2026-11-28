// Case release/T1643 tests: release/C168. Each aggregator fails when a needed job failed, was skipped or was cancelled and passes only when every needed job succeeded; it holds no permission, no checkout and no secret.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, REQUIRED, workflows, parse, reporters } from './fixture.mjs';
export const id = 'release/T1643';
export const tests = ['release/C168'];
export const title = 'Each aggregator fails when a needed job failed, was skipped or was cancelled and passes only when every needed job succeeded; it holds no permission, no checkout and no secret.';
export async function run() {
  const ws = workflows();
  for (const [file, name, needs] of [['change-isolation-plain.yml', 'Change Isolation', ['github-alone', 'delivery']], ['branching-plain.yml', 'Branching', ['freshness', 'synchronization', 'auto-merge']], ['promotion-source-plain.yml', 'Promotion Source', ['origin', 'head-evidence']]]) {
    const w = ws.find((x) => x.file === file); const j = w.jobs.find((x) => x.name === name); assert.ok(j, name);
    assert.deepEqual(j.needs, needs, name); assert.match(j.ifs, /always\(\)/); assert.equal(j.permissions, '{}');
    const body = j.lines.join('\n'); assert.equal(/checkout|secrets\./.test(body), false, `${name} holds no checkout or secret`);
    const script = /run: \|\n((?:\s{10}.*\n?)+)/.exec(body)[1];
    const verdict = (results) => spawnSync('bash', ['-c', script], { env: { PATH: process.env.PATH, RESULTS: results }, encoding: 'utf8' }).status;
    const ok = needs.map(() => 'success').join(' ');
    assert.equal(verdict(ok), 0, `${name} passes when all succeeded`);
    for (const bad of ['failure', 'skipped', 'cancelled']) assert.equal(verdict(needs.map((_, i) => (i === 0 ? bad : 'success')).join(' ')), 1, `${name} ${bad}`);
  }
}
