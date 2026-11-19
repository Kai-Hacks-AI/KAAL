// Case engineering/T1226 tests: engineering/N20
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1226';
export const tests = ['engineering/N20'];
export const title = 'the reference says it moves no package and leaves migration to later, and stays small';
export async function run() {
  const t = ref();
  assert.match(t, /moves no existing package/, 'the reference does not say it moves no package');
  assert.match(t, /package by package/, 'migration is not left to later, package by package');
  assert.ok(t.split('\n').length <= 60, 'the reference is not small: more than 60 lines');
}
