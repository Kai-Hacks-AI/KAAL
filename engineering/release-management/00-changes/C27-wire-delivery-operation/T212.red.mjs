// Case release/T212 tests: F22
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T212';
export const tests = ['release/F22'];
export const title = 'WIRE verification: the installed dispatcher equals its source and the legacy hook is the declared move';

const LEGACY = 'df18ff0179e9a10ae340cd463d7012305c438b7148f0217348974b7ab56c8c06';
// A WIRE Case: it runs at the C26 install, not in the collector's CHECK.
export function run() {
  const src = join(repo, 'engineering/release-management/05-src/wiring/hooks/pre-push-dispatcher');
  assert.ok(existsSync(src), 'the dispatcher source is absent from the Engineering wiring sources');
  assert.equal(readFileSync(join(repo, '.githooks/pre-push'), 'utf8'), readFileSync(src, 'utf8'), '.githooks/pre-push differs from its source');
  const old = join(repo, '.githooks/old/pre-push');
  assert.ok(existsSync(old), 'the legacy hook is not moved');
  assert.equal(createHash('sha256').update(readFileSync(old)).digest('hex'), LEGACY, 'the moved legacy hook is not the declared preimage');
}
