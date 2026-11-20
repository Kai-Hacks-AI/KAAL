// Case release/T1279 tests: release/A72
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
export const id = 'release/T1279';
export const tests = ['release/A72'];
export const title = 'release/A72 is the GitHub platform component that is the parent of the ruleset of the Promoting station and addresses what its child addresses, equal to its draft';
export async function run() {
  const real = join(RM, '03-architecture/A72-github/A72.md');
  assert.ok(existsSync(real), 'A72.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('A72.md')}\n`, 'A72.md differs from the draft');
  assert.match(t, /addresses: \[release\/F77, release\/F81\]/);
}
