// Case controls/T781 tests: controls/I7
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
export const id = 'controls/T781';
export const tests = ['controls/I7'];
export const title = 'controls/I7 is answered by a control: controls/CTL1 has it, and the control tests answer for it';
export async function run() {
  const owners = found().controls.filter((c) => c.has.includes('controls/I7'));
  assert.deepEqual(owners.map((c) => c.id), ['controls/CTL1'], 'no control has controls/I7');
  assert.equal(owners[0].type, 'detective');
  assert.ok(owners[0].tests.length >= 1, 'the control has no control test');
}
