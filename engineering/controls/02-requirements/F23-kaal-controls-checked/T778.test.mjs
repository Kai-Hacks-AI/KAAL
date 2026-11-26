// Case controls/T778 tests: controls/F23
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const RECORDS = join(repo, 'engineering/controls/06-records');
export const id = 'controls/T778';
export const tests = ['controls/F23'];
export const title = 'Engineering runs the product check on the controls that exist in its folders at execution time';
export async function run() {
  assert.ok(existsSync(CHECK), 'the product check is absent');
  // Without records the check reads declarations; given the records of the runs (controls/A16) it also fails a tested claim they do not show.
  for (const extra of [[], ['--records', RECORDS]]) {
    try { execFileSync(process.execPath, [CHECK, join(repo, 'engineering'), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { assert.fail(`the product check fails on the controls of engineering${extra.length ? ' given the records' : ''}: ${String(e.stderr).split('\n')[0]}`); }
  }
}
