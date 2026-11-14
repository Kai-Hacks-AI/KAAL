// Case architecture/T17 tests: architecture/A1
import assert from 'node:assert/strict';
import { read, SKILL } from '../../test/lib.mjs';
export const id = 'architecture/T17';
export const tests = ['architecture/A1'];
export const title = "the package is a minimal private shell that ships only its Skill";
export function run() {
  const pkg = JSON.parse(read('package.json', 'package.json'));
  assert.equal(pkg.name, 'kaal-architecture'); assert.equal(pkg.private, true); assert.deepEqual(pkg.files, ['skills']);
  assert.match(read(SKILL, 'the Skill'), /^---\nname: kaal-architecture\n/);
}
