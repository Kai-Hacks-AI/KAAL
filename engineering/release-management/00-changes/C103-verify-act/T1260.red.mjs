// Case release/T1260 tests: release/I56
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
export const id = 'release/T1260';
export const tests = ['release/I56'];
export const title = 'release/I56 states that an ACT enters only when the Cases its PLAN added are really green, with release management as owner, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I56-act-enters-when-the-plan-cases-are-green/I56.md');
  assert.ok(existsSync(real), 'I56.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I56.md')}\n`, 'I56.md differs from the draft');
  assert.match(t, /^id: release\/I56$/m);
  assert.match(t, /really green/);
  assert.match(t, /the Dispatcher raises a PROMOTION only after an ACT has merged/);
}
