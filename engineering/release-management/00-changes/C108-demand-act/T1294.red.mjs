// Case release/T1294 tests: release/I58
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-demand-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C108-demand-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1294';
export const tests = ['release/I58'];
export const title = 'release/I58 states the contract that a collector is closed by its retro before it is promoted, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I58-change-closed-by-act/I58.md');
  assert.ok(existsSync(real), 'I58.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I58.md')}\n`, 'I58.md differs from the draft');
  assert.match(t, /^id: release\/I58$/m);
}
