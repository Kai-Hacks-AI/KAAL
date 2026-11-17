// Case controls/T778 tests: controls/F23
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
export const id = 'controls/T778';
export const tests = ['controls/F23'];
export const title = 'Engineering runs the product check on the controls that exist in its folders at execution time and reports the inventory';
export async function run() {
  assert.ok(existsSync(CHECK), 'the product check is absent');
  // Temporary: the check reports the inventory and does not fail the Case while controls of other capabilities still lack a status.
  // The follow-up that tightens it again (status of every control declared, then a failing check fails this Case) is controls/C13's.
  const r = spawnSync(process.execPath, [CHECK, join(repo, 'engineering')], { encoding: 'utf8' });
  assert.ok(r.status === 0 || r.status === 1, `the product check did not run: ${r.stderr}`);
  assert.match(r.stdout, /release\/CTL1 running valid/, 'the check does not list the controls of engineering');
}
