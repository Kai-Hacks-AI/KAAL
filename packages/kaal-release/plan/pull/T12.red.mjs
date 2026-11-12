// Case pull/T12 tests: pull/F1, pull/F13
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collector, declaration, facts, flow, landed, ok, promotion, pullPromotion, scriptPath, lifecycle } from './fixtures.mjs';
export const id = 'pull/T12';
export const tests = ['pull/F1', 'pull/F13'];
export const title = 'the command prints what the function returns for a named collector, in any directory with an empty environment, and fails only when an input cannot be read or the collector is not in the facts';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'pull-'));
  const state = facts({ collectors: [collector('col-a', { checks: [ok('build'), ok('suite'), ok('guard'), ok('fresh')] })], pieces: [...lifecycle()] });
  const files = { facts: join(dir, 'facts.json'), declaration: join(dir, 'declaration.json'), flow: join(dir, 'flow.json') };
  writeFileSync(files.facts, JSON.stringify(state));
  writeFileSync(files.declaration, JSON.stringify(declaration()));
  writeFileSync(files.flow, JSON.stringify(flow()));
  const printed = execFileSync(process.execPath, [scriptPath, files.facts, files.declaration, files.flow, 'col-a'], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.deepEqual(JSON.parse(printed), JSON.parse(JSON.stringify(await pullPromotion(state, declaration(), flow(), 'col-a'))), 'the command prints something else than the function returns');

  // a verdict of any kind exits 0: NOT JUDGED and BLOCKED are answers, not failures
  writeFileSync(files.facts, JSON.stringify(facts({ pieces: [...lifecycle()] })));
  const notJudged = spawnSync(process.execPath, [scriptPath, files.facts, files.declaration, files.flow, 'col-a'], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.equal(notJudged.status, 0, 'a verdict other than READY is a failure');
  assert.equal(JSON.parse(notJudged.stdout).verdict, 'NOT JUDGED');

  // an unreadable input, or a collector the facts do not hold, fails and says which
  const unreadable = spawnSync(process.execPath, [scriptPath, join(dir, 'none.json'), files.declaration, files.flow, 'col-a'], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.notEqual(unreadable.status, 0);
  assert.match(unreadable.stderr, /none\.json/, 'the unreadable input is not named');
  const unknown = spawnSync(process.execPath, [scriptPath, files.facts, files.declaration, files.flow, 'col-z'], { cwd: dir, env: {}, encoding: 'utf8' });
  assert.notEqual(unknown.status, 0, 'a collector the facts do not hold is judged');
  assert.match(unknown.stderr, /col-z/);
}
