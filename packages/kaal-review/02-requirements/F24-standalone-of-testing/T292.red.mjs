// Case review/T292 tests: review/F24 (RED until review/C2 DO)
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const id = 'review/T292';
export const tests = ['review/F24', 'review/G3'];
export const title = 'kaal-review declares no dependency on kaal-testing and nothing in it imports a Testing module';
const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));
function* files(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.(mjs|js|json)$/.test(name) && name !== 'package-lock.json') yield p;
  }
}
export function run() {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, 'package.json'), 'utf8'));
  for (const k of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    assert.ok(!(pkg[k] || {})['kaal-testing'], `package.json ${k} still lists kaal-testing`);
  }
  const offenders = [];
  for (const f of files(PACKAGE)) {
    if (f.endsWith('T292.red.mjs') || f.endsWith('T292.test.mjs')) continue;
    if (/from\s+['"]kaal-testing|import\(['"]kaal-testing|require\(['"]kaal-testing/.test(readFileSync(f, 'utf8'))) offenders.push(f.slice(PACKAGE.length));
  }
  assert.deepEqual(offenders, [], `files still import kaal-testing: ${offenders.join(', ')}`);
}
