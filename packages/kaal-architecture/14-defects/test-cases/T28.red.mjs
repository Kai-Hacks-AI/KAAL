// Case architecture/T28 tests: architecture/D2
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'architecture/T28';
export const tests = ['architecture/D2'];
export const title = 'the root folders of kaal-architecture are the folders of the package layout';

export async function run() {
  const layout = JSON.parse(readFileSync(join(root, 'packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json'), 'utf8'));
  const allowed = new Set(layout.folders.map((f) => f.name));
  const tracked = execFileSync('git', ['-C', join(root, 'packages/kaal-architecture'), 'ls-files', '--', '.'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const folders = [...new Set(tracked.filter((p) => p.includes('/')).map((p) => p.split('/')[0]))].sort();
  const outside = folders.filter((f) => !allowed.has(f));
  assert.deepEqual(outside, [], `these root folders of the package are not in the package layout: ${outside.join(', ')}`);
}
