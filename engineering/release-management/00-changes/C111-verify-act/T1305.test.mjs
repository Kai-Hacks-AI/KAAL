// Case release/T1305 tests: release/I60
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
export const id = 'release/T1305';
export const tests = ['release/I60'];
export const title = 'release/I60 states the contract that the ACT of a collector has the form of a retro, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I60-act-is-a-well-formed-retro/I60.md');
  assert.ok(existsSync(real), 'I60.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I60.md')}\n`, 'I60.md differs from the draft');
  assert.match(t, /^id: release\/I60$/m);
}
