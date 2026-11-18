// Case release/T1120 tests: release/CTL19
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
export const id = 'release/T1120';
export const tests = ['release/CTL19'];
export const title = 'a head that adds a workflow with pull_request_target, or gives one to an existing workflow, fails';
export async function run() {
  const { judge } = await load();
  const on = (e) => `name: x\non:\n  ${e}:\njobs: {}\n`;
  const pr = on('pull_request');
  const prt = on('pull_request_target');
  const base = { '.github/workflows/a.yml': pr, '.github/workflows/b.yml': prt };
  const added = judge({ base, head: { ...base, '.github/workflows/c.yml': prt } });
  assert.equal(added.verdict, 'FAIL');
  assert.match(added.reasons.join(' '), /c\.yml/);
  const gained = judge({ base, head: { ...base, '.github/workflows/a.yml': prt } });
  assert.equal(gained.verdict, 'FAIL');
  assert.match(gained.reasons.join(' '), /a\.yml/);
}
