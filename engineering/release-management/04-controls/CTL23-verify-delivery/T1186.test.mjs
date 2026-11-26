// Case release/T1186 tests: CTL23
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C101-delivery-control/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' }).trim();
const CHECKER = 'engineering/change-isolation/check.mjs';
const READER = 'engineering/release-management/05-src/delivery/locations.mjs';
const DECL = 'engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json';
const put = (dir, rel, from) => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); copyFileSync(join(repo, from ?? rel), join(dir, rel)); };
export const id = 'release/T1186';
export const tests = ['release/CTL23'];
export const title = 'the control declares its own minimum evidence with a failure kind, and the controls checker accepts the declaration';
export async function run() {
  const real = join(RM, '04-controls/CTL23-verify-delivery/CTL23.md');
  assert.ok(existsSync(real), 'CTL23.md is absent');
  assert.match(readFileSync(real, 'utf8'), /^evidence: \[fixture:2, real:1, provoked:1:fail\]$/m);
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  const c = out.controls.find((x) => x.id === 'release/CTL23');
  assert.ok(c, 'release/CTL23 is not listed');
  assert.deepEqual(out.refused, []);
  const chk = spawnSync(process.execPath, [CHECK, RM], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL23[^\n]*(invalid|evidence)/i, 'the controls checker rejects the declaration');
}
