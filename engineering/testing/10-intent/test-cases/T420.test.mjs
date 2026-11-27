// Case testing/T420 tests: testing/I52
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C84-evidence-examined-content/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T420';
export const tests = ['testing/I52'];
export const title = 'testing/I52 says evidence corresponds to the content actually examined and is checked against an identity the consumer establishes, with no source assumed, equal to its draft';

export async function run() {
  const real = join(ET, '10-intent/I52-evidence-names-examined-content/I52.md');
  assert.ok(existsSync(real), 'I52.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('I52.md')}\n`, 'I52.md differs from the draft');
  assert.match(text, /^id: testing\/I52$/m);
}
