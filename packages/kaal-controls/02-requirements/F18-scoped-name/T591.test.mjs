// Case controls/T591 tests: controls/F18
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(fileURLToPath(import.meta.url).split('/packages/')[0], 'packages/kaal-controls');
const pkg = () => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
export const id = 'controls/T591';
export const tests = ['controls/F18'];
export const title = 'with the scoped name, the package stays private at 0.0.1 with skills in files less the shims it leaves out and a public publishConfig, and the Skill keeps its name';
export async function run() {
  const p = pkg();
  assert.equal(p.name, '@kaihacksai/kaal-controls', 'the package is not scoped');
  assert.equal(p.private, true);
  assert.equal(p.version, '0.0.1');
  assert.equal(p.files[0], 'skills');
  assert.ok(p.files.slice(1).every((f) => /^!skills\/kaal-controls\/scripts\/[a-z-]+\.mjs$/.test(f)), 'files holds something besides skills and the shims it leaves out');
  assert.deepEqual(p.publishConfig, { access: 'public' });
  assert.match(readFileSync(join(dir, 'skills/kaal-controls/SKILL.md'), 'utf8'), /^---\nname: kaal-controls\n/);
}
