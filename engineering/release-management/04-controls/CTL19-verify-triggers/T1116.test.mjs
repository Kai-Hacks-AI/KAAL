// Case release/T1116 tests: release/CTL19
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
export const id = 'release/T1116';
export const tests = ['release/CTL19'];
export const title = 'the finder lists release/CTL19 as a detective control that has release/I50, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL19');
  assert.ok(c, 'release/CTL19 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I50']);
  assert.equal(c.title, 'verify Triggers');
  const real = join(RM, '04-controls/CTL19-verify-triggers/CTL19.md');
  assert.ok(existsSync(real), 'CTL19.md is absent');
  assert.equal(readFileSync(real, 'utf8').replace(/^evidence: .*\n/m, ''), `${draft('CTL19.md')}\n`, 'CTL19.md differs from the draft');
}
