// Case release/T1261 tests: release/F80
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-act.mjs');
const load = () => import(pathToFileURL(SRC).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C103-hold-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1261';
export const tests = ['release/F80'];
export const title = 'release/F80 serves release/I56 and states how the applicable Cases are found from the tree, PASS, FAIL and UNKNOWN, that history is never read and that an exit code is never a verdict, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F80-hold-act/F80.md');
  assert.ok(existsSync(real), 'F80.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F80.md')}\n`, 'F80.md differs from the draft');
  assert.match(t, /serves: \[release\/I56\]/);
  assert.match(t, /finish your work first/);
  assert.match(t, /reads the checked-out tree/);
  assert.match(t, /serves, addresses, has/);
  assert.match(t, /still a draft in the Change folder/);
  assert.match(t, /reads nothing of the history of the branch/);
  assert.match(t, /An exit code is never a verdict/);
}
