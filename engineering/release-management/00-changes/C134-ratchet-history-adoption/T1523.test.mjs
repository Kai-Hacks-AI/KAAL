// Case release/T1523 tests: release/C134
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { judgeProgress } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/ratchet.mjs';
export const id = 'release/T1523';
export const tests = ['release/C134'];
export const title = 'the adoption history of each ratchet takes a later reduction under the shared library: the judge passes the next line and fails a line that does not follow';
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  for (const f of ['CTL20-gate-verify-triggers', 'CTL36-verify-workflow-names']) {
    const dir = `${repo}/engineering/release-management/04-controls/${f}`;
    const history = readFileSync(`${dir}/history.jsonl`, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const baseline = JSON.parse(readFileSync(`${dir}/baseline.json`, 'utf8'));
    const [gone, ...rest] = baseline;
    const last = history[history.length - 1];
    const line = { at: '2999-01-01T00:00Z', change: 'release/C999', from: baseline.length, to: rest.length, removed: [gone] };
    const window = { from: '2000-01-01T00:00Z', to: '3000-01-01T00:00Z' };
    const change = { id: 'release/C999', exists: true };
    const pass = judgeProgress({ base: { baseline, history }, head: { baseline: rest, history: [...history, line] }, change, window });
    assert.equal(pass.verdict, 'PASS', `${f}: ${pass.reason}`);
    const wrong = judgeProgress({ base: { baseline, history }, head: { baseline: rest, history: [...history, { ...line, from: last.to + 1 }] }, change, window });
    assert.equal(wrong.verdict, 'FAIL', `${f}: a line that does not follow its baseline must fail`);
    const missing = judgeProgress({ base: { baseline, history }, head: { baseline: rest, history }, change, window });
    assert.equal(missing.verdict, 'FAIL', `${f}: a reduction with no line must fail`);
  }
}
