// Case release/T1262 tests: release/A71
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
const draft = (name) => readFileSync(join(RM, '00-changes/C103-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1262';
export const tests = ['release/A71'];
export const title = 'release/A71 addresses release/F80 and names the cumulative PLAN, the three parts of the source and the command line, equal to its draft';
export async function run() {
  const real = join(RM, '03-architecture/A71-verify-act-from-the-plan-revision/A71.md');
  assert.ok(existsSync(real), 'A71.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('A71.md')}\n`, 'A71.md differs from the draft');
  assert.match(t, /addresses: \[release\/F80\]/);
  assert.match(t, /folds, in order, the PLAN pull requests of the Change/);
  assert.match(t, /adds a Case[^.]*changes one[^.]*retires one/);
  assert.match(t, /05-src\/phase\/judge-act\.mjs/);
}
