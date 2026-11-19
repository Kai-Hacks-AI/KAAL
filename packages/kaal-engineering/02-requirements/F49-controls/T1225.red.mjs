// Case engineering/T1225 tests: engineering/F49
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1225';
export const tests = ['engineering/F49'];
export const title = 'the reference limits 02-controls to controls over the package itself and calls consumer controls consumer space';
export async function run() {
  const t = ref();
  assert.match(t, /only controls over the package itself/i, '02-controls is not limited to the package itself');
  for (const w of ['development', 'delivery', 'solution']) assert.ok(t.includes(w), `${w} is not named`);
  assert.match(t, /consumer space/, 'consumer controls are not called consumer space');
}
