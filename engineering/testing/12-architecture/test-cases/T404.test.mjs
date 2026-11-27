// Case testing/T404 tests: testing/A60
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C81-run-case-form/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T404';
export const tests = ['testing/A60'];
export const title = 'testing/A60 keeps one producer of the run report and attributes by file, equal to its draft';

export async function run() {
  const real = join(ET, '12-architecture/A60-run-case-form/A60.md');
  assert.ok(existsSync(real), 'A60.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('A60.md')}\n`, 'A60.md differs from the draft');
  assert.match(text, /^id: testing\/A60$/m);
}
