// Case engineering/T1225 tests: engineering/F49
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const dir = join(pkg, 'skills/kaal-engineering');
const template = () => { const f = join(dir, 'references/package-layout.json'); assert.ok(existsSync(f), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(f, 'utf8')); };
const folder = (t, n) => t.folders.find((f) => f.name === n);
export const id = 'engineering/T1225';
export const tests = ['engineering/F49'];
export const title = '02-controls is scoped to the package and consumer controls are consumer space, not a folder';
export async function run() {
  const t = template();
  const c = folder(t, '02-controls');
  assert.equal(c.scope, 'package');
  assert.deepEqual([...c.covers].sort(), ['delivery', 'development', 'solution']);
  assert.ok(t.consumerSpace.length >= 1, 'consumer controls are not named as consumer space');
  assert.ok(!t.folders.some((f) => /consumer/i.test(f.name)), 'a consumer folder is part of the layout');
}
