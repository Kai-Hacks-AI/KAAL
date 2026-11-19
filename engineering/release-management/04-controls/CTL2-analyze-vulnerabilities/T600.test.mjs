// Case release/T600 tests: release/CTL2
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const RM = join(repo, 'engineering/release-management');
export const id = 'release/T600';
export const tests = ['release/CTL2'];
export const title = 'the finder lists release/CTL2 as a detective control that has release/I4, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL2');
  assert.ok(c, 'release/CTL2 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I4']);
  assert.equal(c.title, 'analyze Vulnerabilities');
  assert.deepEqual(c.tests.map((t) => t.id), ['release/T600'], 'the control test is not found from the control');
  const draft = readFileSync(join(RM, '00-changes/C49-analyze-vulnerabilities-control/interface.md'), 'utf8').split(/^## Draft of CTL2\.md$/m)[1].match(/^````\n([\s\S]*?)\n````$/m)[1];
  const real = join(RM, '04-controls/CTL2-analyze-vulnerabilities/CTL2.md');
  assert.ok(existsSync(real), 'CTL2.md is absent');
  // The draft predates the mandatory status of controls/C12, so the status line is left out of the comparison.
  assert.equal(readFileSync(real, 'utf8').replace(/^status: .*\n/m, '').replace(/^evidence: .*\n/m, ''), `${draft}\n`, 'CTL2.md differs from the draft');
}
