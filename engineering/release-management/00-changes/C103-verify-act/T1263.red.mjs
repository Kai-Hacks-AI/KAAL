// Case release/T1263 tests: release/CTL24
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-act.mjs');
const load = () => import(pathToFileURL(SRC).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C103-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1263';
export const tests = ['release/CTL24'];
export const title = 'the finder lists release/CTL24 as a detective control that has release/I56, equal to its draft';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL24');
  assert.ok(c, 'release/CTL24 is not listed');
  assert.equal(c.type, 'detective');
  assert.deepEqual(c.has, ['release/I56']);
  assert.equal(c.title, 'verify Act');
  const real = join(RM, '04-controls/CTL24-verify-act/CTL24.md');
  assert.ok(existsSync(real), 'CTL24.md is absent');
  assert.equal(readFileSync(real, 'utf8').replace(/^evidence: .*\n/m, ''), `${draft('CTL24.md')}\n`, 'CTL24.md differs from the draft');
}
