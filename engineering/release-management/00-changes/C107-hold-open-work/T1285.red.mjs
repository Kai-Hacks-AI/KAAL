// Case release/T1285 tests: release/I57
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
const SRC = join(RM, '05-src/open-work/judge-open-work.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C107-hold-open-work/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1285';
export const tests = ['release/I57'];
export const title = 'release/I57 states the contract that a promotion leaves no open work behind, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I57-no-open-work-behind/I57.md');
  assert.ok(existsSync(real), 'I57.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I57.md')}\n`, 'I57.md differs from the draft');
  assert.match(t, /^id: release\/I57$/m);
}
