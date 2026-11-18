// Case release/T936 tests: release/C72
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, load, facts, read } from './fixtures.mjs';
export const id = 'release/T936';
export const tests = ['release/C72'];
export const title = 'the command decides from standard input alone, prints the same decision, and holds no network call, no gh, no git and no word of an approval or a merge';
export async function run() {
  assert.ok(existsSync(join(SRC, 'cli.mjs')), 'cli.mjs is absent');
  const src = read('engineering/release-management/05-src/promotion-raise/cli.mjs').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  for (const bad of ['fetch(', 'https', 'child_process', 'spawn', 'exec', 'gh ', 'git ', 'approve', 'merge', 'GH_TOKEN', 'process.env']) assert.ok(!src.includes(bad), `cli.mjs holds ${bad}`);
  const f = facts();
  const r = spawnSync('node', [join(SRC, 'cli.mjs'), 'decide'], { input: JSON.stringify(f), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const m = await load('decide.mjs');
  assert.deepEqual(JSON.parse(r.stdout), m.decideRaise(f));
  const bad = spawnSync('node', [join(SRC, 'cli.mjs'), 'decide'], { input: 'not json', encoding: 'utf8' });
  assert.notEqual(bad.status, 0, 'a facts input that is not JSON is accepted');
}
