// Case release/T1285 tests: release/I57
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
export const id = 'release/T1285';
export const tests = ['release/I57'];
export const title = 'release/I57 states the contract that a collector is promoted only when its queue is empty, and what the queue is, equal to its draft';
export async function run() {
  const real = join(RM, '01-intent/I57-collector-queue-empty/I57.md');
  assert.ok(existsSync(real), 'I57.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('I57.md')}\n`, 'I57.md differs from the draft');
  assert.match(t, /^id: release\/I57$/m);
}
