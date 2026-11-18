// Case release/T1142 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1142';
export const tests = ['release/F69'];
export const title = "every decision names its collector, whatever its verdict";
export async function run() {
  const { verdict } = await loadDraft('verdict.mjs');
  for (const f of [facts(), facts({ collector: 'kaal/a/b', files: [] }), facts({ collector: 'kaal/a/c', aheadOfMain: 0 }), facts({ collector: 'kaal/a/d', filesComplete: false }), facts({ collector: 'main' }), facts({ collector: 'kaal/a/e', open: [{ number: 3, base: 'main', head: 'kaal/a/e' }] })]) {
    const x = verdict(f, NOW);
    assert.equal(x.collector, f.collector);
    assert.ok(x.verdict && x.reason, 'a verdict and a reason are given');
  }
}
