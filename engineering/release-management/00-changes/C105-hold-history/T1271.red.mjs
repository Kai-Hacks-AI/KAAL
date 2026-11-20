// Case release/T1271 tests: release/F77
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
export const id = 'release/T1271';
export const tests = ['release/F77'];
export const title = 'release/F77 serves release/I54 and states that a push that does not move the default branch forward is refused whoever pushes, that the Promoting station declares the entry traced to release/CTL25 hold History beside the detections it requires, and that a detection does not name the station, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F77-hold-history/F77.md');
  assert.ok(existsSync(real), 'F77.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F77.md')}\n`, 'F77.md differs from the draft');
  assert.match(t, /serves: \[release\/I54\]/);
  assert.match(t, /is refused before it lands, whoever pushes: no bypass/);
  assert.match(t, /traced to release\/CTL25 `hold History`, beside the detections the station requires/);
  assert.match(t, /a detection does not name the station/);
  assert.doesNotMatch(t, /ruleset/, 'the requirement states what is controlled, not its realization');
  assert.match(t, /makes no claim about a deletion of `main`/);
}
