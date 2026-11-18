// Case release/T1124 tests: release/F67
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
export const id = 'release/T1124';
export const tests = ['release/F67'];
export const title = 'the workflow source runs on plain pull_request with read-only permissions, no secret and no pull_request_target, and runs the judge';
export async function run() {
  const { uses } = await load();
  const real = join(RM, '05-src/wiring/workflows/verify-triggers.yml');
  assert.ok(existsSync(real), 'the workflow source is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('verify-triggers.yml')}\n`, 'the workflow source differs from the draft');
  assert.equal(uses(t), false, 'the check must not use pull_request_target itself');
  assert.match(t, /^on:\n  pull_request:/m);
  assert.match(t, /permissions:\n  contents: read/);
  assert.doesNotMatch(t, /secrets\./);
  assert.match(t, /verify-triggers\.mjs/);
}
