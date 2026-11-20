// Case release/T1289 tests: release/F83
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
const SRC = join(RM, '05-src/open-work/judge-open-work.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C107-hold-open-work/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1289';
export const tests = ['release/F83'];
export const title = 'the judge says UNKNOWN, never PASS, when the promoted branch, the promotion, the list or its completeness cannot be told, and for a promotion of main';
export async function run() {
  const { judgeOpenWork } = await import(pathToFileURL(SRC).href);
  const ok = { head: 'kaal/release/example', self: 50, complete: true, pulls: [{ number: 7, base: 'main' }] };
  assert.equal(judgeOpenWork(ok).verdict, 'PASS', 'the good input must PASS so a failure below says something');
  const bad = [
    ['no head', { head: undefined }], ['empty head', { head: '' }], ['head is main', { head: 'main' }], ['head is not a string', { head: 5 }],
    ['no self', { self: undefined }], ['self is a string', { self: '50' }],
    ['the list is cut', { complete: false }], ['completeness is not stated', { complete: undefined }], ['completeness is a string', { complete: 'true' }],
    ['pulls is not a list', { pulls: { number: 7, base: 'x' } }], ['no pulls', { pulls: undefined }], ['null pulls', { pulls: null }],
    ['an item is null', { pulls: [null] }], ['an item has no number', { pulls: [{ base: 'x' }] }], ['an item has no base', { pulls: [{ number: 7 }] }], ['an item has an empty base', { pulls: [{ number: 7, base: '' }] }],
  ];
  for (const [what, over] of bad) assert.equal(judgeOpenWork({ ...ok, ...over }).verdict, 'UNKNOWN', `${what} must be UNKNOWN`);
  for (const nothing of [undefined, null, 'x', 5]) assert.equal(judgeOpenWork(nothing).verdict, 'UNKNOWN', `${nothing} must be UNKNOWN`);
  const failing = { ...ok, pulls: [{ number: 7, base: ok.head }, { number: 8 }] };
  assert.equal(judgeOpenWork(failing).verdict, 'UNKNOWN', 'an item that cannot be read hides what the others say: UNKNOWN, not FAIL');
}
