// Case release/T1122 tests: release/CTL19
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/triggers/verify-triggers.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C90-no-pull-request-target/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1122';
export const tests = ['release/CTL19'];
export const title = 'the real tree against itself passes, a comment does not count and every form of the trigger does';
export async function run() {
  const { judge: raw, uses, readTree } = await load();
  const { honest } = await import(new URL('../../00-changes/C131-triggers-baseline-file/fixtures.mjs', import.meta.url).href);
  const judge = (x) => raw(honest(x));
  const tree = readTree(join(repo, '.github/workflows'));
  assert.ok(Object.keys(tree).length > 0, 'no workflow was read');
  const same = judge({ base: tree, head: tree });
  assert.equal(same.verdict, 'PASS', 'an unchanged tree must pass');
  assert.equal(same.base, same.head);
  assert.equal(uses('# pull_request_target is replaced\non:\n  pull_request:\njobs: {}\n'), false, 'a comment is not a use');
  assert.equal(uses('on: pull_request_target\n'), true, 'scalar');
  assert.equal(uses('on: [push, pull_request_target]\n'), true, 'flow list');
  assert.equal(uses('on:\n  pull_request_target:\n    types: [opened]\n'), true, 'block map');
  assert.equal(uses('on:\n  - push\n  - pull_request_target\n'), true, 'block list');
  assert.equal(uses('on:\n  pull_request:\n    branches: [pull_request_target]\n'), false, 'a branch name is not a trigger');
}
