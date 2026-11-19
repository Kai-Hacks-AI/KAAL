// Case release/T381 tests: release/CTL21, release/F71, release/A66, release/F16
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/hotfix/verify-hotfix.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C94-verify-hotfix/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T381';
export const tests = ['release/CTL21', 'release/F71', 'release/A66'];
export const title = 'the finder lists release/CTL21 as a detective control that has release/I10; CTL21, F71 and A66 equal their drafts and chain to I10; F16 points to the control';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL21');
  assert.ok(c, 'release/CTL21 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I10']);
  assert.equal(c.title, 'verify Hotfix');
  for (const [name, dir] of [['CTL21.md', '04-controls/CTL21-verify-hotfix'], ['F71.md', '02-requirements/F71-verify-hotfix'], ['A66.md', '03-architecture/A66-verify-hotfix']]) {
    const real = join(RM, dir, name);
    assert.ok(existsSync(real), `${name} is absent`);
    assert.equal(readFileSync(real, 'utf8'), `${draft(name)}\n`, `${name} differs from the draft`);
  }
  assert.match(readFileSync(join(RM, '04-controls/CTL21-verify-hotfix/CTL21.md'), 'utf8'), /^has: \[release\/I10\]$/m);
  assert.match(readFileSync(join(RM, '02-requirements/F71-verify-hotfix/F71.md'), 'utf8'), /^serves: \[release\/I10\]$/m);
  assert.match(readFileSync(join(RM, '03-architecture/A66-verify-hotfix/A66.md'), 'utf8'), /^addresses: \[release\/F71\]$/m);
  const f16 = readFileSync(join(RM, '02-requirements/F16-hotfix-interface/F16.md'), 'utf8');
  assert.ok(f16.includes(draft('F16-sentence.md')), 'F16 does not carry the pointer sentence');
  assert.match(f16, /release\/CTL21/);
}
