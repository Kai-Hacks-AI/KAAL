// Case engineering/T1622 tests: engineering/F102
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { root, dir, scripts } from './fixture.mjs';
export const id = 'engineering/T1622';
export const tests = ['engineering/F102'];
export const title = 'check-run over engineering/controls prints what check-controls prints and exits with the same code';
export async function run() {
  const runner = join(dir, 'check-run.mjs');
  assert.ok(existsSync(runner), 'check-run.mjs is absent');
  const folder = join(root, 'engineering/controls');
  const go = (script) => spawnSync(process.execPath, [script, folder], { cwd: root, encoding: 'utf8' });
  const before = go(join(scripts, 'check-controls.mjs'));
  const after = go(runner);
  assert.equal(after.status, before.status, 'the exit codes differ');
  assert.equal(after.stdout, before.stdout, 'the output differs');
  assert.equal(after.stderr, before.stderr, 'the diagnostics differ');
}
