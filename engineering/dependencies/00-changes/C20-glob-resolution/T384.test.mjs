// Case engineering/T384 (engineering/C20): the root lockfile resolves no glob inside the range of GHSA-3g3m-2fjr-6pw4
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'engineering/T384';
export const tests = ['engineering/D1'];
export const title = 'package-lock.json resolves no glob in the range >= 9.0.0, <= 14.0.1 (GHSA-3g3m-2fjr-6pw4)';

const numbers = (v) => String(v).split('-')[0].split('.').map(Number);
const compare = (a, b) => {
  const [x, y] = [numbers(a), numbers(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};
export const vulnerable = (v) => compare(v, '9.0.0') >= 0 && compare(v, '14.0.1') <= 0;

export function run() {
  // The range test can fail: its edges are on the right side.
  assert.equal(vulnerable('8.1.0'), false);
  assert.equal(vulnerable('9.0.0'), true);
  assert.equal(vulnerable('13.0.6'), true);
  assert.equal(vulnerable('14.0.1'), true);
  assert.equal(vulnerable('14.0.2'), false);

  const lock = JSON.parse(readFileSync(join(repo, 'package-lock.json'), 'utf8'));
  const found = Object.entries(lock.packages).filter(([path]) => path === 'node_modules/glob' || path.endsWith('/node_modules/glob'));
  const bad = found.filter(([, entry]) => vulnerable(entry.version)).map(([path, entry]) => `glob ${entry.version} at ${path}`);
  assert.deepEqual(bad, [], `the lockfile resolves a glob inside the advisory range: ${bad.join('; ')}`);
}
