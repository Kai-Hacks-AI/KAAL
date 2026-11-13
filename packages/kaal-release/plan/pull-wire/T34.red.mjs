// Case pull/T34 tests: pull/F35
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T34';
export const tests = ['pull/F35'];
export const title = 'CI runs every engineering Case and logs it under its scoped id';
export async function run() {
  const file = join(repo, 'engineering/cases/cases.test.mjs');
  assert.ok(existsSync(file), 'engineering/cases/cases.test.mjs is absent');
  const pkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
  assert.match(pkg.scripts['test:engineering'], /engineering\/cases\/cases\.test\.mjs/, 'test:engineering does not name the Cases file');
  const ran = spawnSync(process.execPath, ['--test', '--test-reporter=spec', file], { cwd: repo, encoding: 'utf8' });
  const lines = (ran.stdout + ran.stderr).split('\n').map((l) => `2026-01-01T00:00:00.0000000Z ${l}`);
  const { executionsOf } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/pull-promotion/read.mjs')).href);
  const got = executionsOf([{ job: 'Engineering', text: lines.join('\n') }], 'head');
  const dir = join(repo, 'engineering');
  const expected = [];
  for (const scope of readdirSync(dir)) {
    const changes = join(dir, scope, '00-changes');
    if (!existsSync(changes)) continue;
    for (const change of readdirSync(changes)) for (const f of readdirSync(join(changes, change))) if (/^T\d+\.test\.mjs$/.test(f)) expected.push(join(changes, change, f));
  }
  assert.ok(expected.length > 0, 'no engineering Case files found');
  const have = new Set(got.filter((e) => e.conclusion === 'success').map((e) => e.case));
  for (const f of expected) {
    const m = await import(pathToFileURL(f).href);
    assert.ok(have.has(m.id), `${m.id} has no logged success`);
  }
}
