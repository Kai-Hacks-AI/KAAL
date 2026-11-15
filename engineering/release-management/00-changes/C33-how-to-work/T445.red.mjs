// Case release/T445 tests: F23
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T445';
export const tests = ['release/F23'];
export const title = 'WIRE verification: each installed template equals its Engineering source, trailer included';

// A WIRE Case: it runs at the WIRE, never in the collector's CHECK.
const PAIRS = [['plan.md', 'PULL_REQUEST_TEMPLATE/plan.md'], ['do.md', 'PULL_REQUEST_TEMPLATE/do.md'], ['act.md', 'PULL_REQUEST_TEMPLATE/act.md'],
  ['promotion.md', 'PULL_REQUEST_TEMPLATE/promotion.md'], ['wire.md', 'PULL_REQUEST_TEMPLATE/wire.md']];
export function run() {
  for (const [s, i] of PAIRS) {
    const src = join(repo, 'engineering/release-management/05-src/wiring/templates', s);
    const inst = join(repo, '.github', i);
    assert.ok(existsSync(src), `source ${s} is absent`);
    assert.ok(existsSync(inst), `${i} is not installed`);
    const a = readFileSync(src, 'utf8');
    assert.ok(a.includes('## HOW TO WORK'), `source ${s} has no trailer`);
    assert.equal(readFileSync(inst, 'utf8'), a, `${i} differs from its source`);
  }
}
