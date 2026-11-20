// Case release/T1290 tests: release/F83
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
export const id = 'release/T1290';
export const tests = ['release/F83'];
export const title = 'node judge-queue.mjs --head <branch> (--self <n> | --group-ref <ref>) --facts <file> prints the verdict and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN, a missing or unreadable file included, and the promotion is named by exactly one of the two';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'c107-'));
  try {
    const f = join(dir, 'facts.json');
    const cli = (text, ...args) => {
      if (text === undefined) rmSync(f, { force: true }); else writeFileSync(f, text);
      const r = spawnSync(process.execPath, [SRC, ...args], { encoding: 'utf8' });
      return [r.status, (r.stdout.match(/PASS|FAIL|UNKNOWN/) ?? [''])[0]];
    };
    const head = ['--head', 'kaal/release/example'];
    const self = ['--self', '50', '--facts', f];
    const clean = '{"complete":true,"pulls":[{"number":7,"base":"main"}]}';
    const queued = '{"complete":true,"pulls":[{"number":7,"base":"kaal/release/example"}]}';
    assert.deepEqual(cli(clean, ...head, ...self), [0, 'PASS']);
    assert.deepEqual(cli(queued, ...head, ...self), [1, 'FAIL']);
    assert.deepEqual(cli('{"complete":false,"pulls":[]}', ...head, ...self), [2, 'UNKNOWN'], 'a cut list is UNKNOWN');
    assert.deepEqual(cli('not json', ...head, ...self), [2, 'UNKNOWN']);
    assert.deepEqual(cli('[]', ...head, ...self), [2, 'UNKNOWN'], 'a list instead of facts is UNKNOWN');
    assert.deepEqual(cli(undefined, ...head, ...self), [2, 'UNKNOWN'], 'a missing file is UNKNOWN');
    const group = ['--group-ref', `refs/heads/gh-readonly-queue/main/pr-50-${SHA}`, '--facts', f];
    assert.deepEqual(cli(clean, ...head, ...group), [0, 'PASS'], 'the promotion named by the merge group ref');
    assert.deepEqual(cli('{"complete":true,"pulls":[{"number":50,"base":"main"},{"number":7,"base":"kaal/release/example"}]}', ...head, ...group), [1, 'FAIL']);
    assert.deepEqual(cli('{"complete":true,"pulls":[{"number":50,"base":"kaal/release/example"}]}', ...head, ...group), [0, 'PASS'], 'the group names the promotion, which is not in its own queue');
    assert.deepEqual(cli(clean, ...head, '--group-ref', 'refs/heads/main', '--facts', f), [2, 'UNKNOWN'], 'a ref that is not a merge group is UNKNOWN');
    assert.deepEqual(cli(clean, ...head, ...self, '--group-ref', `refs/heads/gh-readonly-queue/main/pr-50-${SHA}`), [2, 'UNKNOWN'], 'both a number and a group ref is UNKNOWN');
    assert.deepEqual(cli(clean, ...head, '--facts', f), [2, 'UNKNOWN'], 'no promotion is UNKNOWN');
    assert.deepEqual(cli(clean, ...head, '--self', 'x', '--facts', f), [2, 'UNKNOWN'], 'a promotion number that is not a number is UNKNOWN');
    assert.deepEqual(cli(clean, '--self', '50', '--facts', f), [2, 'UNKNOWN'], 'no branch is UNKNOWN');
    assert.deepEqual(cli(clean), [2, 'UNKNOWN'], 'no arguments is UNKNOWN');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
