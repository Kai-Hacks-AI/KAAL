// Case release/T1129 tests: release/CTL20
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C91-gate-verify-triggers/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1129';
export const tests = ['release/CTL20'];
export const title = 'the finder lists release/CTL20 as a preventive control that has release/I50, equal to its draft apart from its evidence and the ratchet it declares (release/C130)';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL20');
  assert.ok(c, 'release/CTL20 is not listed');
  assert.equal(c.type, 'preventive');
  assert.deepEqual(c.has, ['release/I50']);
  assert.equal(c.title, 'gate verify Triggers');
  const real = join(RM, '04-controls/CTL20-gate-verify-triggers/CTL20.md');
  assert.ok(existsSync(real), 'CTL20.md is absent');
  assert.equal(readFileSync(real, 'utf8').replace(/^(evidence|strategy|baseline-source|owner|exit): .*\n/gm, ''), `${draft('CTL20.md')}\n`, 'CTL20.md differs from the draft');
}
