// Case testing/T415 tests: testing/F176
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

export const id = 'testing/T415';
export const tests = ['testing/F176'];
export const title = 'testing/F176 states the mutant spec, the four outcomes and the record, equal to its draft';

export async function run() {
  const real = join(ET, '11-requirements/F176-mutate/F176.md');
  assert.ok(existsSync(real), 'F176.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('F176.md')}\n`, 'F176.md differs from the draft');
  assert.match(text, /^id: testing\/F176$/m);
}
