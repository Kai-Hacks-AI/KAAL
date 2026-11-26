// Case release/T1309 tests: release/CTL31
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-verify-act.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C111-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1309';
export const tests = ['release/CTL31'];
export const title = 'release/CTL31 is the detective control verify Act, which has release/I60, equal to its draft, declares the minimum evidence and is accepted by the controls checker';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL31');
  assert.ok(c, 'release/CTL31 is not listed');
  assert.equal(c.type, 'detective');
  assert.equal(c.title, 'verify Act');
  assert.deepEqual(c.has, ['release/I60']);
  assert.equal(readFileSync(join(RM, '04-controls/CTL31-verify-act/CTL31.md'), 'utf8'), `${draft('CTL31.md')}\n`, 'CTL31.md differs from its draft');
  const chk = spawnSync(process.execPath, [CHECK, RM], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL31[^\n]*(invalid|evidence)/i, 'the controls checker rejects the declaration');
}
