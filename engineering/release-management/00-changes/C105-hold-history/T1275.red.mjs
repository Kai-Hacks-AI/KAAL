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
const draft = (name) => readFileSync(join(RM, '00-changes/C105-hold-history/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1275';
export const tests = ['release/F81'];
export const title = 'release/F81 serves release/I54 and states PASS, FAIL and UNKNOWN of the entries declared for hold History against the rules in force, that an entry of another control and an undeclared rule are no finding and that the check reads no source, no Git and no network, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F81-verify-history-held/F81.md');
  assert.ok(existsSync(real), 'F81.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F81.md')}\n`, 'F81.md differs from the draft');
  assert.match(t, /serves: \[release\/I54\]/);
  assert.match(t, /the entries the Promoting station declares for release\/CTL25 `hold History`/);
  assert.match(t, /the station declares no entry for the control, which never passes/);
  assert.match(t, /An entry of another control is not its business and a rule in force that the station does not declare is no finding/);
  assert.match(t, /reads no ruleset source, no Git and no network/);
}
