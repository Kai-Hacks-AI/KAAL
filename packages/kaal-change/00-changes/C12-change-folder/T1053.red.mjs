// Case change/T1053 tests: change/C12
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const id = 'change/T1053';
export const tests = ['change/C12'];
export const title = 'change/C12 ends as it began: its registration is the one file in its folder, a single check that globs its own Cases, and no Case is still unwired when the DO is done';
export async function run() {
  const here = dirname(fileURLToPath(import.meta.url));
  const reg = JSON.parse(readFileSync(join(here, 'kaal-guard.json'), 'utf8'));
  assert.equal(reg.checks.length, 1, 'the registration holds more than one check');
  assert.equal(reg.checks[0].when, undefined, 'the registration narrows its check with when');
  const folder = here.split('/packages/')[1] ? 'packages/' + here.split('/packages/')[1] : here;
  assert.ok(reg.checks[0].run.includes(`"${folder}/T*.test.mjs"`), `the check does not glob its own folder's Cases: ${reg.checks[0].run}`);
  const unwired = readdirSync(here).filter((f) => /^T\d+\.red\.mjs$/.test(f));
  assert.deepEqual(unwired, [], 'Cases are still unwired (.red.mjs): the DO is not done');
}
test(id, () => run());
