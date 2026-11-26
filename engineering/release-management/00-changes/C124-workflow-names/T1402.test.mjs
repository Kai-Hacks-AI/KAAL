// Case release/T1402 tests: release/C124
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workflowNamesFindings } from '../../05-src/workflow-names/lib/names.mjs';
import { nameOf } from '../../05-src/workflow-names/lib/read.mjs';
export const id = 'release/T1402';
export const tests = ['release/C124'];
export const title = 'conforming names give no finding, a missing name, the bare KAAL and a shared name are named by file and reason and sorted, a quoted name with a comment is read, and the pure layer imports nothing and emits no verdict';
export async function run() {
  assert.deepEqual(workflowNamesFindings([{ file: 'a.yml', name: 'Alpha' }, { file: 'b.yml', name: 'Beta' }]), []);
  assert.deepEqual(workflowNamesFindings([
    { file: 'z.yml', name: 'KAAL' }, { file: 'm.yml' }, { file: 'd1.yml', name: 'Same' }, { file: 'd2.yml', name: 'Same' }, { file: 'ok.yml', name: 'Fine' },
  ]), ['d1.yml:duplicate-name', 'd2.yml:duplicate-name', 'm.yml:missing-name', 'z.yml:generic-name']);
  // Several workflows named KAAL are generic, not duplicates: one reason each.
  assert.deepEqual(workflowNamesFindings([{ file: 'a.yml', name: 'KAAL' }, { file: 'b.yml', name: 'KAAL' }]), ['a.yml:generic-name', 'b.yml:generic-name']);
  assert.equal(nameOf('name: "Quoted one" # why\non: push\n'), 'Quoted one');
  assert.equal(nameOf("name: 'Single'\non: push\n"), 'Single');
  assert.equal(nameOf('on: push\njobs:\n  x:\n    name: not top level\n'), undefined);
  assert.throws(() => nameOf('name:\non: push\n'));
  assert.throws(() => nameOf('name: |\n  text\n'));
  const src = readFileSync(new URL('../../05-src/workflow-names/lib/names.mjs', import.meta.url), 'utf8').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  assert.doesNotMatch(src, /^\s*import\b/m);
  assert.doesNotMatch(src, /PASS|FAIL|UNKNOWN|baseline/);
}
