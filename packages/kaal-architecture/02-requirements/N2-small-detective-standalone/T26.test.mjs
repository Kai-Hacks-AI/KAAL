// Case architecture/T26 tests: architecture/N2
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readRecord } from '../../lib/records.mjs';
export const id = 'architecture/T26';
export const tests = ['architecture/N2'];
export const title = 'the package depends only on Hosting and Foundation and ships no workflow, hook or gate';
export function run() {
  assert.equal(typeof readRecord, 'function');
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies });
  for (const d of deps) assert.ok(/kaal-(hosting|foundation)$/.test(d), `unexpected dependency ${d}`);
  assert.ok(!(pkg.files || []).some((f) => /workflows?|hooks?/.test(f)));
}
