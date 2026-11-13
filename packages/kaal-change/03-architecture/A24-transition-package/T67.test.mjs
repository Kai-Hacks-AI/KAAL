// Case change/T67 tests: change/A24, change/F52
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dir, read, REF, SKILL } from '../../00-changes/C10-transition/lib.mjs';
export const id = 'change/T67';
export const tests = ['change/A24', 'change/F52'];
export const title = "the package's delivered-file inventory lists the reference and the Skill with their digests, and its Case file list names the reference";
export function run() {
  read(REF, 'the reference');
  const files = JSON.parse(read('test/verify.json', 'the verification inventory')).files;
  for (const rel of [SKILL, REF]) {
    assert.ok(files[rel], `the inventory does not list ${rel}`);
    assert.equal(files[rel], createHash('sha256').update(readFileSync(join(dir, rel))).digest('hex'), `the inventory digest of ${rel} differs`);
  }
  assert.ok(read('test/change.test.mjs', 'the delivered-file Case').includes(`"${REF}"`), 'the delivered-file Case does not name the reference');
}
test(id, () => run());
