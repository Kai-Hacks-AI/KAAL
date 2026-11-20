// Case release/T1278 tests: release/CTL25
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C105-gate-promotion/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1278';
export const tests = ['release/CTL25'];
export const title = 'release/CTL22, its push judge, its workflow source and its Cases are gone, and no declared element has the retired control';
export async function run() {
  for (const p of ['04-controls/CTL22-verify-history', '05-src/history/verify-history.mjs', '05-src/wiring/workflows/verify-history.yml']) assert.ok(!existsSync(join(RM, p)), `${p} is still on the tree`);
  assert.ok(!existsSync(join(repo, '.github/workflows/verify-history.yml')), 'a workflow of the retired control is installed');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.ok(!out.controls.some((c) => c.id === 'release/CTL22' || (c.has ?? []).includes('release/CTL22')), 'the retired control is still declared');
}
