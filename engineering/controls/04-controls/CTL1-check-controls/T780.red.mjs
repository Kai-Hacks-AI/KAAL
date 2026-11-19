// Case controls/T780 tests: controls/CTL1
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const EC = join(repo, 'engineering/controls');
const found = () => JSON.parse(execFileSync(process.execPath, [FINDER, EC], { encoding: 'utf8' }));
export const id = 'controls/T780';
export const tests = ['controls/CTL1'];
export const title = 'the finder lists controls/CTL1 as a valid detective control that has controls/I7 and is running, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const c = found().controls.find((x) => x.id === 'controls/CTL1');
  assert.ok(c, 'controls/CTL1 is not listed');
  assert.equal(c.valid, true, 'controls/CTL1 is not valid');
  assert.equal(c.type, 'detective');
  assert.equal(c.status, 'running');
  assert.deepEqual(c.has, ['controls/I7']);
  assert.equal(c.title, 'check Controls');
  assert.ok(c.tests.some((t) => t.id === 'controls/T780') && c.tests.some((t) => t.id === 'controls/T782'), 'the control tests are not found from the control');
  const draft = readFileSync(join(EC, '00-changes/C13-check-controls-control/interface.md'), 'utf8').split(/^## Draft of CTL1\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  assert.equal(readFileSync(join(EC, '04-controls/CTL1-check-controls/CTL1.md'), 'utf8'), `${draft}\n`, 'CTL1.md differs from the draft');
}
