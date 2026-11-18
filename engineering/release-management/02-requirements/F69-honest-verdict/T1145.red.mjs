// Case release/T1145 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1145';
export const tests = ['release/F69'];
export const title = "behind-main and age are facts beside the verdict, not filters";
export async function run() {
  const { verdict } = await loadDraft('verdict.mjs');
  const a = verdict(facts({ behindMain: 0, tipDate: '2026-11-17T00:00:00Z' }), NOW);
  const b = verdict(facts({ behindMain: 41, tipDate: '2026-09-01T00:00:00Z' }), NOW);
  assert.equal(a.verdict, 'raisable');
  assert.equal(b.verdict, 'raisable');
  assert.equal(a.facts.behind, 0);
  assert.equal(b.facts.behind, 41);
  assert.equal(a.facts.tipAgeDays, 1);
  assert.equal(b.facts.tipAgeDays, 78);
}
