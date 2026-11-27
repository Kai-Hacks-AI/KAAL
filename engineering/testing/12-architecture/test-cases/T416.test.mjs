// Case testing/T416 tests: testing/A62
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

export const id = 'testing/T416';
export const tests = ['testing/A62'];
export const title = 'testing/A62 composes Hosting and the runner, keeps mutants given and the verdict with the caller, equal to its draft';

export async function run() {
  const real = join(ET, '12-architecture/A62-mutate/A62.md');
  assert.ok(existsSync(real), 'A62.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('A62.md')}\n`, 'A62.md differs from the draft');
  assert.match(text, /^id: testing\/A62$/m);
}
