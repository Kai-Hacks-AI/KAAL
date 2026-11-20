// Case release/T1291 tests: release/CTL27
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
export const id = 'release/T1291';
export const tests = ['release/CTL27'];
export const title = 'release/CTL27 is the detective control check Queue, which has release/I57, equal to its draft, declares the minimum evidence and is accepted by the controls checker';
export async function run() {
  assert.ok(existsSync(FINDER), 'the finder is absent');
  const out = JSON.parse(execFileSync(process.execPath, [FINDER, RM], { encoding: 'utf8' }));
  assert.deepEqual(out.refused, [], 'an item was refused');
  const c = out.controls.find((x) => x.id === 'release/CTL27');
  assert.ok(c, 'release/CTL27 is not listed');
  assert.equal(c.type, 'detective');
  assert.equal(c.title, 'check Queue');
  assert.deepEqual(c.has, ['release/I57']);
  assert.equal(readFileSync(join(RM, '04-controls/CTL27-check-queue/CTL27.md'), 'utf8'), `${draft('CTL27.md')}\n`, 'CTL27.md differs from its draft');
  const chk = spawnSync(process.execPath, [CHECK, RM], { encoding: 'utf8' });
  assert.doesNotMatch(chk.stdout + chk.stderr, /CTL27[^\n]*(invalid|evidence)/i, 'the controls checker rejects the declaration');
}
