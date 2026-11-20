// Case release/T1286 tests: release/F83
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
const SRC = join(RM, '05-src/queue/judge-queue.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C107-check-queue/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const SHA = 'a'.repeat(40);
export const id = 'release/T1286';
export const tests = ['release/F83'];
export const title = 'release/F83 serves release/I57 and states the requirement that the promotion of a branch is judged against its queue, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F83-check-queue/F83.md');
  assert.ok(existsSync(real), 'F83.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F83.md')}\n`, 'F83.md differs from the draft');
  assert.match(t, /serves: \[release\/I57\]/);
}
