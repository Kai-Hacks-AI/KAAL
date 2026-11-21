// Case testing/T397 tests: testing/I48
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

export const id = 'testing/T397';
export const tests = ['testing/I48'];
export const title = 'testing/I48 states that every Case is well formed and explicitly attributed while leaving assertion sufficiency to review, equal to its draft';

export async function run() {
  const real = join(ET, '10-intent/I48-cases-are-well-formed/I48.md');
  assert.ok(existsSync(real), 'I48.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('I48.md')}\n`, 'I48.md differs from the draft');
  assert.match(text, /^id: testing\/I48$/m);
  assert.match(text, /Owner: testing/);
}
