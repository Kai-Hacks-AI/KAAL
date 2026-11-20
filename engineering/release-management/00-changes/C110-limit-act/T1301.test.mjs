// Case release/T1301 tests: release/F85
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-limit-act.mjs');
const MAP = join(RM, '05-src/phase/write-map.json');
const draft = (name) => readFileSync(join(RM, '00-changes/C110-limit-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1301';
export const tests = ['release/F85'];
export const title = 'release/F85 serves release/I59 and states the requirement that a pull request which changes a folder of the route act may change nothing outside those folders, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F85-limit-act/F85.md');
  assert.ok(existsSync(real), 'F85.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F85.md')}\n`, 'F85.md differs from the draft');
  assert.match(t, /serves: \[release\/I59\]/);
}
