// Case architecture/T27 tests: architecture/D1
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'architecture/T27';
export const tests = ['architecture/D1'];
export const title = 'a kaal-architecture that is not on the registry has its machinery at engineering/architecture';

// No N: the package is not on the registry. `private` in the repository says nothing of what was published, so the registry is asked.
async function published(name) {
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
  if (res.status === 404) return false;
  if (res.ok) return true;
  throw new Error(`the registry answered ${res.status}: the Case cannot judge`);
}

export async function run() {
  const scope = JSON.parse(readFileSync(join(root, 'packages/kaal-hosting/package.json'), 'utf8')).name.split('/')[0];
  if (await published(`${scope}/kaal-architecture`)) return; // it has an N: not judged here
  const tracked = execFileSync('git', ['-C', root, 'ls-files', '--', 'engineering/architecture'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  assert.ok(tracked.some((p) => /^engineering\/architecture\/(13-source\/)?skills?\//.test(p) || /^engineering\/architecture\/13-source\//.test(p)),
    'kaal-architecture has no N (not on the registry), and has no machinery at engineering/architecture: it runs nowhere');
}
