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
const SRC = join(RM, '05-src/open-work/judge-open-work.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C107-hold-open-work/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1288';
export const tests = ['release/F83'];
export const title = 'the judge says FAIL naming every open pull request based on the promoted branch, whether it is a draft or not and whatever its head is, and the promotion itself is not named';
export async function run() {
  const { judgeOpenWork } = await import(pathToFileURL(SRC).href);
  const head = 'kaal/release/example';
  const j = (pulls, over = {}) => judgeOpenWork({ head, self: 50, complete: true, pulls, ...over });
  let r = j([{ number: 7, base: head }]);
  assert.equal(r.verdict, 'FAIL');
  assert.deepEqual(r.based, [7]);
  assert.ok(r.message.includes('#7'), 'the pull request is not named');
  r = j([{ number: 50, base: 'main' }, { number: 12, base: head, draft: true }, { number: 7, base: head, head: 'claude/x' }, { number: 9, base: 'main' }]);
  assert.equal(r.verdict, 'FAIL');
  assert.deepEqual(r.based, [7, 12], 'every pull request is named, in order');
  assert.ok(r.message.includes('#7') && r.message.includes('#12'));
  r = j([{ number: 50, base: head }]);
  assert.equal(r.verdict, 'PASS', 'the promotion is the only one: judged by its own number, whatever it is based on');
  r = j([{ number: 50, base: head }, { number: 51, base: head }]);
  assert.deepEqual(r.based, [51], 'the promotion is not named');
}
