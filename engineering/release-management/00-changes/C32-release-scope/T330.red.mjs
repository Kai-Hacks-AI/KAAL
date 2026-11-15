// Case release/T330 tests: F53
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T330';
export const tests = ['release/F53'];
export const title = 'the scope judge classifies each Change as delivered or missing and is ready only when no required Change is missing';

export async function run() {
  const src = join(repo, 'engineering/release-management/05-src/scope/scope-judge.mjs');
  assert.ok(existsSync(src), 'the scope judge is absent from the Engineering sources');
  const { judge } = await import(src);
  const manifest = { package: 'p', version: '0.0.1', changes: [
    { id: 'release/C1', capability: 'release', role: 'required' },
    { id: 'release/C2', capability: 'release', role: 'optional' } ] };
  assert.deepEqual(judge(manifest, new Set(['release/C1'])), { ready: true, delivered: ['release/C1'], missing: ['release/C2'] });
  assert.equal(judge(manifest, new Set(['release/C2'])).ready, false, 'a missing required Change is accepted');
  assert.throws(() => judge({ ...manifest, changes: [{ id: 'release/C1', role: 'maybe' }] }, new Set()), 'an unknown role is accepted');
  assert.throws(() => judge({ package: 'p', changes: [] }, new Set()), 'a manifest without a version is accepted');
  assert.throws(() => judge({ ...manifest, changes: [manifest.changes[0], manifest.changes[0]] }, new Set()), 'a duplicate Change is accepted');
}
