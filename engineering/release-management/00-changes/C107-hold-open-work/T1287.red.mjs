// Case release/T1287 tests: release/A73, release/F83
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
export const id = 'release/T1287';
export const tests = ['release/A73', 'release/F83'];
export const title = 'release/A73 is the judge of open work and addresses release/F83; the judge is its draft and says PASS when no open pull request other than the promotion is based on the promoted branch, whatever else is open';
export async function run() {
  const real = join(RM, '03-architecture/A73-judge-open-work/A73.md');
  assert.ok(existsSync(real), 'A73.md is absent');
  assert.equal(readFileSync(real, 'utf8'), `${draft('A73.md')}\n`, 'A73.md differs from the draft');
  assert.ok(existsSync(SRC), 'judge-open-work.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-open-work.mjs')}\n`, 'judge-open-work.mjs differs from the draft');
  const { judgeOpenWork } = await import(pathToFileURL(SRC).href);
  const head = 'kaal/release/example';
  const j = (pulls, over = {}) => judgeOpenWork({ head, self: 50, complete: true, pulls, ...over });
  assert.equal(j([]).verdict, 'PASS', 'an empty list must PASS');
  assert.equal(j([{ number: 50, base: 'main' }]).verdict, 'PASS', 'the promotion itself is no open work');
  assert.equal(j([{ number: 50, base: 'main' }, { number: 7, base: 'main' }, { number: 8, base: 'kaal/release/other' }, { number: 9, base: 'hotfix/x' }]).verdict, 'PASS', 'pull requests based elsewhere are no open work');
  assert.equal(j([{ number: 7, base: 'kaal/release/example-2' }, { number: 8, base: 'Kaal/Release/Example' }]).verdict, 'PASS', 'a name that only resembles the branch is no open work');
  assert.equal(j([{ number: 7, base: 'main', head }]).verdict, 'PASS', 'a pull request that is only FROM the branch is no open work');
}
