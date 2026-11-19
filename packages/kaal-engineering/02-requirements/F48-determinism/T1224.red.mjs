// Case engineering/T1224 tests: engineering/F48
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1224';
export const tests = ['engineering/F48'];
export const title = 'the reference says what is deterministic, that numbers only order, and that dist is generated and not committed';
export async function run() {
  const t = ref();
  assert.match(t, /Only scripts, unit tests and test-cases are deterministic/, 'the determinism rule is absent');
  assert.match(t, /validated by review/, 'the rest is not said to be validated by review');
  assert.match(t, /numbers only order the folders for people/, 'the numbers rule is absent');
  assert.match(t, /dist\/[^\n]*never edited[^\n]*not committed/, 'dist is not said to be never edited and not committed');
}
