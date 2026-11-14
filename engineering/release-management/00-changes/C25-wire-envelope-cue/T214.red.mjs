// Case release/T214 tests: G58
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAIRS } from './pairs.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const id = 'release/T214';
export const tests = ['release/G58'];
export const title = 'gap release/G58 is closed at the WIRE: each of the six installed templates equals its Engineering source byte for byte';
export function run() {
  for (const [source, installed] of PAIRS) {
    assert.ok(existsSync(join(cap, source)), `the Engineering source ${source} is absent`);
    assert.ok(existsSync(join(repo, installed)), `the installed template ${installed} is absent`);
    assert.equal(readFileSync(join(repo, installed), 'utf8'), readFileSync(join(cap, source), 'utf8'), `${installed} is not a byte-for-byte copy of ${source}`);
  }
}
