// Case change/T1061 tests: change/F54
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { load } from '../../test/folder-control-support.mjs';
export const id = 'change/T1061';
export const tests = ['change/F54'];
export const title = 'the repository itself passes the folder control: no Case in a Change folder tests an element and no Change or Gap is tested outside one';
export async function run() {
  const c = await load();
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const { readFileSync } = await import('node:fs');
  const found = c.judgeFolders({ files, read: (p) => readFileSync(`${root}/${p}`, 'utf8') });
  assert.deepEqual(found.map((f) => `${f.rule} ${f.path}`), [], 'the repository holds artifacts of the wrong orientation');
}
test(id, () => run());
