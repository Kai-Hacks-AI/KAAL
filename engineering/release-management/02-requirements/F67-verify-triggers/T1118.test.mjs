// Case release/T1118 tests: release/F67
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
export const id = 'release/T1118';
export const tests = ['release/F67'];
export const title = 'release/F67 serves release/I50 and states the ratchet, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F67-verify-triggers/F67.md');
  assert.ok(existsSync(real), 'F67.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('F67.md')}\n`, 'F67.md differs from the draft');
  const t = readFileSync(real, 'utf8');
  assert.match(t, /serves: \[release\/I50\]/);
  assert.match(t, /never a list kept by hand/);
}
