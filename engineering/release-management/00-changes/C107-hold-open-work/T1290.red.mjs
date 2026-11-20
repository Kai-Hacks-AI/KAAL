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
const SRC = join(RM, '05-src/open-work/judge-open-work.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C107-hold-open-work/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1290';
export const tests = ['release/F83'];
export const title = 'node judge-open-work.mjs --head <branch> --self <n> --facts <file> prints the verdict and exits 0 for PASS, 1 for FAIL and 2 for UNKNOWN, a missing or unreadable file included';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'c107-'));
  try {
    const f = join(dir, 'facts.json');
    const cli = (text, ...args) => {
      if (text === undefined) rmSync(f, { force: true }); else writeFileSync(f, text);
      const r = spawnSync(process.execPath, [SRC, ...args], { encoding: 'utf8' });
      return [r.status, (r.stdout.match(/PASS|FAIL|UNKNOWN/) ?? [''])[0]];
    };
    const args = ['--head', 'kaal/release/example', '--self', '50', '--facts', f];
    assert.deepEqual(cli('{"complete":true,"pulls":[{"number":7,"base":"main"}]}', ...args), [0, 'PASS']);
    assert.deepEqual(cli('{"complete":true,"pulls":[{"number":7,"base":"kaal/release/example"}]}', ...args), [1, 'FAIL']);
    assert.deepEqual(cli('{"complete":false,"pulls":[]}', ...args), [2, 'UNKNOWN'], 'a cut list is UNKNOWN');
    assert.deepEqual(cli('not json', ...args), [2, 'UNKNOWN']);
    assert.deepEqual(cli('[]', ...args), [2, 'UNKNOWN'], 'a list instead of facts is UNKNOWN');
    assert.deepEqual(cli(undefined, ...args), [2, 'UNKNOWN'], 'a missing file is UNKNOWN');
    assert.deepEqual(cli('{"complete":true,"pulls":[]}', '--head', 'kaal/release/example', '--facts', f), [2, 'UNKNOWN'], 'no promotion number is UNKNOWN');
    assert.deepEqual(cli('{"complete":true,"pulls":[]}', '--head', 'kaal/release/example', '--self', 'x', '--facts', f), [2, 'UNKNOWN'], 'a promotion number that is not a number is UNKNOWN');
    assert.deepEqual(cli('{"complete":true,"pulls":[]}', '--self', '50', '--facts', f), [2, 'UNKNOWN'], 'no branch is UNKNOWN');
    assert.deepEqual(cli('{"complete":true,"pulls":[]}'), [2, 'UNKNOWN'], 'no arguments is UNKNOWN');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
