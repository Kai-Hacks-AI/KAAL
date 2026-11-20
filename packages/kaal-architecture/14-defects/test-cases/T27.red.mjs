// Case architecture/T27 tests: architecture/D1
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'architecture/T27';
export const tests = ['architecture/D1'];
export const title = 'an unpublished kaal-architecture has its machinery at engineering/architecture';

// Never published means private: publishing needs the private flag removed, so a private package has no N and its N+1 is what runs.
export async function run() {
  const pkg = JSON.parse(readFileSync(join(root, 'packages/kaal-architecture/package.json'), 'utf8'));
  assert.equal(pkg.private, true, 'the package is not private: it may have an N, which this Case does not judge');
  const tracked = execFileSync('git', ['-C', root, 'ls-files', '--', 'engineering/architecture'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  assert.ok(tracked.some((p) => /^engineering\/architecture\/(13-source\/)?skills?\//.test(p) || /^engineering\/architecture\/13-source\//.test(p)),
    'the unpublished kaal-architecture has no machinery at engineering/architecture, so it runs nowhere');
}
