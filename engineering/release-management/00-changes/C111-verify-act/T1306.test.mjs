// Case release/T1306 tests: release/F86
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
const SRC = join(RM, '05-src/phase/judge-verify-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C111-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1306';
export const tests = ['release/F86'];
export const title = 'release/F86 serves release/I60 and states the requirement that a retro which reflects a carried Change and is not well formed is revealed, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F86-verify-act/F86.md');
  assert.ok(existsSync(real), 'F86.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F86.md')}\n`, 'F86.md differs from the draft');
  assert.match(t, /serves: \[release\/I60\]/);
}
