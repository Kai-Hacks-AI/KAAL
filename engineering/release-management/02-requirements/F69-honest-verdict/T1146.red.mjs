// Case release/T1146 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1146';
export const tests = ['release/F69'];
export const title = "the order is by collector name, labelled, deterministic, and changes no verdict";
export async function run() {
  const { verdict, ordered } = await loadDraft('verdict.mjs');
  const names = ['kaal/z/last', 'kaal/a/first', 'kaal/m/mid'];
  const ds = names.map((c) => verdict(facts({ collector: c, files: c === 'kaal/m/mid' ? [] : green }), NOW));
  const o = ordered(ds);
  assert.deepEqual(o.map((x) => x.collector), ['kaal/a/first', 'kaal/m/mid', 'kaal/z/last']);
  assert.deepEqual(o.map((x) => x.order), [1, 2, 3]);
  assert.ok(o.every((x) => /not a priority/.test(x.orderedBy)));
  assert.deepEqual(ordered([...ds].reverse()), o);
  assert.deepEqual(o.map((x) => x.verdict), ['raisable', 'not-ready', 'raisable']);
}
