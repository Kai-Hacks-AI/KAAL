// Case testing/T408 tests: testing/I50
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)).split(/[\\/]engineering[\\/]/)[0]);
const ET = process.env.KAAL_TESTING_DIR ? resolve(process.env.KAAL_TESTING_DIR) : join(repo, 'engineering/testing');
const norm = (s) => s.replace(/\r\n/g, '\n');
const draft = (name) => norm(readFileSync(join(ET, '01-changes/C82-observe-cases-at-revision/interface.md'), 'utf8'))
  .split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1]
  .match(/^`````\n([\s\S]*?)\n`````$/m)[1];

export const id = 'testing/T408';
export const tests = ['testing/I50'];
export const title = 'testing/I50 says Testing observes the Cases of a revision and records what it observed, equal to its draft';

export async function run() {
  const real = join(ET, '10-intent/I50-observe-cases-at-revision/I50.md');
  assert.ok(existsSync(real), 'I50.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('I50.md')}\n`, 'I50.md differs from the draft');
  assert.match(text, /^id: testing\/I50$/m);
}
