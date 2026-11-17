// Case controls/T783 tests: controls/G90
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
export const id = 'controls/T783';
export const tests = ['controls/G90'];
export const title = 'gap controls/G90 is closed: controls/CTL1 is declared and found';
export async function run() {
  assert.ok(existsSync(join(EC, '04-controls/CTL1-check-controls/CTL1.md')), 'CTL1.md is absent');
  assert.ok(found().controls.some((c) => c.id === 'controls/CTL1'), 'the finder does not list controls/CTL1');
}
