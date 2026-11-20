// Case release/T1270 tests: release/I54
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
export const id = 'release/T1270';
export const tests = ['release/I54'];
export const title = 'release/I54 states that main is only moved forward, that the gate of the Promoting station holds it with non_fast_forward through release/CTL25 gate Promotion and release/CTL26 verify Promotion gate, and that a deletion of main is not claimed, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I54-main-history-is-kept/I54.md');
  assert.ok(existsSync(real), 'I54.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I54.md')}\n`, 'I54.md differs from the draft');
  assert.match(t, /^id: release\/I54$/m);
  assert.match(t, /The gate of the Promoting station holds this/);
  assert.match(t, /release\/CTL25 `gate Promotion` is that preventive control and release\/CTL26 `verify Promotion gate` reveals/);
  assert.match(t, /A deletion of `main` is a different protection/);
  assert.doesNotMatch(t, /CTL22/, 'the retired control is still named');
}
