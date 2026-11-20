// Case release/T1272 tests: release/A68
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
export const id = 'release/T1272';
export const tests = ['release/A68'];
export const title = 'release/A68 addresses release/F77 and names the ruleset source, the declaration, that a control realized by requiring a detection stays a control named by what it controls, the sources that leave and the order of loading and retiring, equal to its draft';
export async function run() {
  const real = join(RM, '03-architecture/A68-hold-history/A68.md');
  assert.ok(existsSync(real), 'A68.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('A68.md')}\n`, 'A68.md differs from the draft');
  assert.match(t, /addresses: \[release\/F77\]/);
  assert.match(t, /05-src\/wiring\/rulesets\/promoting\.json/);
  assert.match(t, /is an entry of the station's declaration too, and stays a control named by what it controls/);
  assert.match(t, /release\/CTL5 and release\/CTL20 \(and likely release\/CTL10\) stay preventive controls, to be renamed and re-explained/);
  assert.match(t, /the control release\/CTL22 leave/);
  assert.match(t, /the Owner retires the old ruleset's rule only after the new one is loaded and has been observed in force/);
}
