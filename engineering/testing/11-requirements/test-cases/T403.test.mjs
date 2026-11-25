// Case testing/T403 tests: testing/F174
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

export const id = 'testing/T403';
export const tests = ['testing/F174'];
export const title = 'testing/F174 states how an export-form Case is run and reported, equal to its draft';

export async function run() {
  const real = join(ET, '11-requirements/F174-run-export-cases/F174.md');
  assert.ok(existsSync(real), 'F174.md is absent');
  const text = norm(readFileSync(real, 'utf8'));
  assert.equal(text, `${draft('F174.md')}\n`, 'F174.md differs from the draft');
  assert.match(text, /^id: testing\/F174$/m);
}
