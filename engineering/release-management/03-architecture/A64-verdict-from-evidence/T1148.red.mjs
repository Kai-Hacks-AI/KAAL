// Case release/T1148 tests: release/A64
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { src, loadDraft, green, facts, NOW } from './fixtures.mjs';
export const id = 'release/T1148';
export const tests = ['release/A64'];
export const title = "the collector is read as data from the base: GET only, nothing imported or run, 300 files is incomplete";
export async function run() {
  const { gatherEvidence } = await loadDraft('gather-evidence.mjs');
  const calls = [];
  const mk = (n) => ({ ahead_by: 2, behind_by: 5, commits: [{ commit: { committer: { date: '2026-11-10T00:00:00Z' } } }], files: Array.from({ length: n }, (_, i) => ({ filename: 'f' + i, status: i === 0 ? 'removed' : 'added' })) });
  for (const [n, complete] of [[10, true], [300, false]]) {
    const api = async (m, p) => { calls.push([m, p]); if (/compare/.test(p)) return mk(n); if (/git\/ref/.test(p)) return { object: { sha: 'b'.repeat(40) } }; return [{ number: 4, state: 'closed', merged_at: null, title: 't', base: { ref: 'main' }, head: { ref: 'kaal/a/b' } }]; };
    const f = await gatherEvidence(api, 'o/r', 'kaal/a/b');
    assert.equal(f.filesComplete, complete);
    assert.ok(!f.files.includes('f0'), 'a removed file is not evidence');
    assert.deepEqual(f.closedPromotions, [{ number: 4, state: 'closed' }]);
    assert.equal(f.behindMain, 5);
  }
  assert.ok(calls.every(([m]) => m === 'GET'), 'only GET');
  const text = readFileSync(src('verdict.mjs'), 'utf8') + readFileSync(src('gather.mjs'), 'utf8');
  assert.ok(!/child_process|\beval\b|new Function|import\(|^import /m.test(text), 'nothing is imported or run');
}
