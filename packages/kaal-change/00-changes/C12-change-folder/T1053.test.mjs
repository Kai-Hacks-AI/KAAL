// Case change/T1053 tests: change/C12
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const id = 'change/T1053';
export const tests = ['change/C12'];
export const title = 'change/C12 ends as it began: its registration is the one file in its folder, one passive check that runs the Change check on the folder with the runner as an argument, and it is never unwired';
export async function run() {
  const here = dirname(fileURLToPath(import.meta.url));
  const reg = JSON.parse(readFileSync(join(here, 'kaal-guard.json'), 'utf8'));
  assert.equal(reg.checks.length, 1, 'the registration holds more than one check');
  assert.equal(reg.checks[0].when, undefined, 'the registration narrows its check with when');
  const folder = 'packages/' + here.split('/packages/')[1];
  assert.match(reg.checks[0].run, /scripts\/change-check\.mjs/, 'the check does not run the Change check');
  assert.ok(reg.checks[0].run.includes(folder) && /--runner\s+"/.test(reg.checks[0].run), `the check names no folder or no runner: ${reg.checks[0].run}`);
  assert.ok(!/node --test/.test(reg.checks[0].run), 'the check runs Cases directly: it would not go cold');
  assert.deepEqual(readdirSync(here).filter((f) => /\.red\.mjs$/.test(f)), [], 'an unwired .red.mjs file is left');
  assert.ok(existsSync(join(here, '../../skills/kaal-change/scripts/change-check.mjs')), 'the Skill ships no Change check');
}
test(id, () => run());
