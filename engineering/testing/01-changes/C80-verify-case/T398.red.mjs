// Case testing/T398 tests: testing/F173
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C80-verify-case/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T398';
export const tests = ['testing/F173'];
export const title = 'testing/F173 serves testing/I48 and states the Case form and attribution rules, equal to its draft';

export async function run() {
  const real = join(ET, '11-requirements/F173-verify-case/F173.md');
  assert.ok(existsSync(real), 'F173.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('F173.md')}\n`, 'F173.md differs from the draft');
  assert.match(text, /^serves: \[testing\/I48\]$/m);
}
