// Case coordination/T16 tests: F12
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { analyzeFlow, collector, declaration, facts, promotionOf, scriptPath } from './fixtures.mjs';
export const id = 'coordination/T16';
export const tests = ['coordination/F12'];
export const title = 'the Script runs from a command line in any directory with an empty environment and prints what the function returns; it fails only when an input cannot be read';
export async function run() {
  assert.ok(existsSync(scriptPath), 'the Script is absent');
  assert.ok(!/process\.env/.test(readFileSync(scriptPath, 'utf8')), 'the Script reads the environment');
  const state = facts({ collectors: [collector('col-a', 1)], requests: [promotionOf(5, 'col-a', { review: null })] });
  const dir = mkdtempSync(join(tmpdir(), 'flow-'));
  const write = (name, value) => { const file = join(dir, name); writeFileSync(file, JSON.stringify(value)); return file; };
  const factsFile = write('facts.json', state);
  const declarationFile = write('declaration.json', declaration());
  const expected = JSON.parse(JSON.stringify(await analyzeFlow(state, declaration())));
  const ran = spawnSync(process.execPath, [scriptPath, factsFile, declarationFile], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.equal(ran.status, 0, `the command line fails on valid input: ${ran.stderr}`);
  assert.deepEqual(JSON.parse(ran.stdout), expected, 'the command line prints something other than the function returns');
  const missing = spawnSync(process.execPath, [scriptPath, join(dir, 'missing.json'), declarationFile], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.notEqual(missing.status, 0, 'an unreadable input does not fail the command line');
  assert.ok(missing.stderr.length > 0, 'an unreadable input is not explained');
}
