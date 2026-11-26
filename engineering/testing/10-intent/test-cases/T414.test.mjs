// Case testing/T414 tests: testing/I51
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C83-verify-mutations/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T414';
export const tests = ['testing/I51'];
export const title = 'testing/I51 says Testing finds surviving mutants by running them and records the outcome, equal to its draft';

export async function run() {
  const real = join(ET, '10-intent/I51-find-surviving-mutants/I51.md');
  assert.ok(existsSync(real), 'I51.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('I51.md')}\n`, 'I51.md differs from the draft');
  assert.match(text, /^id: testing\/I51$/m);
}
