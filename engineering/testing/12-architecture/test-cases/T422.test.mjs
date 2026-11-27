// Case testing/T422 tests: testing/A63
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C84-evidence-judged-revision/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T422';
export const tests = ['testing/A63'];
export const title = 'testing/A63 says the check is pure, resolution is another capability, and what stays residual, equal to its draft';

export async function run() {
  const real = join(ET, '12-architecture/A63-revision/A63.md');
  assert.ok(existsSync(real), 'A63.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('A63.md')}\n`, 'A63.md differs from the draft');
  assert.match(text, /^id: testing\/A63$/m);
}
