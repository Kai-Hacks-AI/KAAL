// Case release/T1117 tests: release/I50
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
export const id = 'release/T1117';
export const tests = ['release/I50'];
export const title = 'release/I50 states the directive and its source, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I50-no-pull-request-target/I50.md');
  assert.ok(existsSync(real), 'I50.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('I50.md')}\n`, 'I50.md differs from the draft');
  const t = readFileSync(real, 'utf8');
  assert.ok(t.includes('https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/'), 'the source is not stated exactly');
  assert.match(t, /no workflow under `\.github\/workflows` uses the trigger `pull_request_target`/);
}
