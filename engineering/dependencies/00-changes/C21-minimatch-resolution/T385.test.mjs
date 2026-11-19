// Case engineering/T385 (engineering/C21): the root lockfile resolves no minimatch inside the range of GHSA-g3hv-75wg-m249
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'engineering/T385';
export const tests = ['engineering/D2'];
export const title = 'package-lock.json resolves no minimatch in the range >= 7.0.0, < 11.0.1 (GHSA-g3hv-75wg-m249)';

const numbers = (v) => String(v).split('-')[0].split('.').map(Number);
const compare = (a, b) => {
  const [x, y] = [numbers(a), numbers(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};
export const vulnerable = (v) => compare(v, '7.0.0') >= 0 && compare(v, '11.0.1') < 0;

export function run() {
  // The range test can fail: its edges are on the right side.
  assert.equal(vulnerable('6.2.0'), false);
  assert.equal(vulnerable('7.0.0'), true);
  assert.equal(vulnerable('10.2.6'), true);
  assert.equal(vulnerable('11.0.0'), true);
  assert.equal(vulnerable('11.0.1'), false);

  const lock = JSON.parse(readFileSync(join(repo, 'package-lock.json'), 'utf8'));
  const found = Object.entries(lock.packages).filter(([path]) => path === 'node_modules/minimatch' || path.endsWith('/node_modules/minimatch'));
  const bad = found.filter(([, entry]) => vulnerable(entry.version)).map(([path, entry]) => `minimatch ${entry.version} at ${path}`);
  assert.deepEqual(bad, [], `the lockfile resolves a minimatch inside the advisory range: ${bad.join('; ')}`);
}
