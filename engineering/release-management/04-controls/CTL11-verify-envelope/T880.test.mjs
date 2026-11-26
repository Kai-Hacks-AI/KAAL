// Case release/T880 tests: release/CTL11
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T880';
export const tests = ['release/CTL11'];
export const title = 'the finder lists release/CTL11 as a detective control that has release/I7, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL11');
  assert.ok(c, 'release/CTL11 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I7']);
  assert.equal(c.title, 'verify Envelope');
  assert.deepEqual(c.tests.map((t) => t.id).sort(), ['release/T880', 'release/T881'], 'the control tests are not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C68-verify-envelope/interface.md'), 'utf8').split(/^## Draft of CTL11\.md$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
  const real = join(RM, '04-controls/CTL11-verify-envelope/CTL11.md');
  assert.ok(existsSync(real), 'CTL11.md is absent');
  assert.equal(readFileSync(real, 'utf8').replace(/^evidence: .*\n/m, ''), `${draft}\n`, 'CTL11.md differs from the draft');
}
