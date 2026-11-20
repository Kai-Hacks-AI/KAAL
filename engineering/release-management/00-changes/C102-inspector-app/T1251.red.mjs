// Case release/T1251 tests: release/F79
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const draft = (name) => readFileSync(join(RM, '00-changes/C102-inspector-app/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1251';
export const tests = ['release/F79'];
export const title = 'release/F79 serves release/I55 and states the manifest, the two jobs and that UNKNOWN never passes, equal to its draft';
export async function run() {
  const real = join(RM, '02-requirements/F79-inspector-least-privilege-and-separation/F79.md');
  assert.ok(existsSync(real), 'F79.md is absent');
  const t = readFileSync(real, 'utf8');
  assert.equal(t, `${draft('F79.md')}\n`, 'F79.md differs from the draft');
  assert.match(t, /serves: \[release\/I55\]/);
  assert.match(t, /checks: write/);
  assert.match(t, /UNKNOWN never passes/);
}
