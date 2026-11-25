// Case release/T1397 tests: release/C129
import assert from 'node:assert/strict';
import { ANALYSIS, BOTH, EXPECTED, clock } from './fixtures.mjs';
export const id = 'release/T1397';
export const tests = ['release/C129'];
export const title = 'the wait polls every thirty seconds for ten minutes, ends in UNKNOWN naming what is missing, and does not wait when an analysis already failed';
export async function run() {
  const { waitForAnalyses } = await import(ANALYSIS);
  const wait = async (reads, analyzeResult = 'success') => { const c = clock(); let i = 0; const r = await waitForAnalyses({ sha: 'abc', expected: EXPECTED, analyzeResult, read: async () => { const v = reads[Math.min(i++, reads.length - 1)]; if (v instanceof Error) throw v; return v; }, ...c, intervalMs: 30000, budgetMs: 600000 }); return { r, t: c.now(), reads: i }; };
  const now = await wait([BOTH]); assert.equal(now.r.ok, true); assert.equal(now.t, 0); assert.equal(now.reads, 1);
  const late = await wait([[BOTH[1]], [BOTH[1]], BOTH]); assert.equal(late.r.ok, true); assert.equal(late.t, 60000);
  const never = await wait([[BOTH[1]]]); assert.equal(never.r.ok, false); assert.match(never.r.reason, /\/language:actions/); assert.ok(never.t <= 600000);
  const down = await wait([new Error('502')]); assert.equal(down.r.ok, false); assert.match(down.r.reason, /502/);
  const failed = await wait([[BOTH[1]]], 'failure'); assert.equal(failed.r.ok, true); assert.equal(failed.t, 0); assert.equal(failed.reads, 1); assert.deepEqual(failed.r.analyses, [BOTH[1]]);
}
