// Case release/T1275 tests: release/F81
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C105-gate-promotion/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1275';
export const tests = ['release/F81'];
export const title = 'release/F81 serves release/I54 and states PASS, FAIL and UNKNOWN of the declared rules against the rules in force, that an undeclared rule is no finding and that the check reads no source, no Git and no network, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F81-verify-promotion-gate/F81.md');
  assert.ok(existsSync(real), 'F81.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F81.md')}\n`, 'F81.md differs from the draft');
  assert.match(t, /serves: \[release\/I54\]/);
  assert.match(t, /every declared required check included/);
  assert.match(t, /the station declares no rule, which never passes/);
  assert.match(t, /A rule in force that the station does not declare is no finding/);
  assert.match(t, /reads no ruleset source, no Git and no network/);
}
