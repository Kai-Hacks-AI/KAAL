// Case release/T1300 tests: release/I59
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-limit-act.mjs');
const MAP = join(RM, '05-src/phase/write-map.json');
const draft = (name) => readFileSync(join(RM, '00-changes/C110-limit-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1300';
export const tests = ['release/I59'];
export const title = 'release/I59 states the contract that every route writes only the folders its phase owns and the ACT route only the folders of ACT work, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I59-act-does-only-act-work/I59.md');
  assert.ok(existsSync(real), 'I59.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I59.md')}\n`, 'I59.md differs from the draft');
  assert.match(t, /^id: release\/I59$/m);
}
