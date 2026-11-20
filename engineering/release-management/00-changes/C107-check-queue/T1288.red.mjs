// Case release/T1288 tests: release/F83
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
export const id = 'release/T1288';
export const tests = ['release/F83'];
export const title = 'the judge says FAIL naming every pull request in the queue of the promoted branch, whether it is a draft or not and whatever its head is, and the promotion itself is not named';
export async function run() {
  const { judgeQueue } = await import(pathToFileURL(SRC).href);
  const head = 'kaal/release/example';
  const j = (pulls, over = {}) => judgeQueue({ head, self: 50, complete: true, pulls, ...over });
  assert.equal(j([]).verdict, 'PASS', 'the good input must PASS so a failure below says something');
  let r = j([{ number: 7, base: head }]);
  assert.equal(r.verdict, 'FAIL');
  assert.deepEqual(r.based, [7]);
  assert.ok(r.message.includes('#7'), 'the pull request is not named');
  r = j([{ number: 50, base: 'main' }, { number: 12, base: head, draft: true }, { number: 7, base: head, head: 'claude/x' }, { number: 9, base: 'main' }]);
  assert.equal(r.verdict, 'FAIL');
  assert.deepEqual(r.based, [7, 12], 'every pull request is named, in order');
  assert.ok(r.message.includes('#7') && r.message.includes('#12'));
  assert.equal(j([{ number: 50, base: head }]).verdict, 'PASS', 'the promotion is judged by its own number, whatever it is based on');
  assert.deepEqual(j([{ number: 50, base: head }, { number: 51, base: head }]).based, [51], 'the promotion is not named');
}
