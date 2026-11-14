// Case release/T211 tests: F22
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T211';
export const tests = ['release/F22'];
export const title = 'WIRE verification: the installed WIRE template equals its Engineering source';

// A WIRE Case: it runs at the bootstrap install, not in the collector's CHECK.
export function run() {
  const src = join(repo, 'engineering/release-management/05-src/wiring/templates/wire.md');
  const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/wire.md');
  assert.ok(existsSync(src), 'the WIRE template source is absent');
  assert.ok(existsSync(installed), 'the WIRE template is not installed');
  assert.equal(readFileSync(installed, 'utf8'), readFileSync(src, 'utf8'), 'the installed template differs from its source');
}
