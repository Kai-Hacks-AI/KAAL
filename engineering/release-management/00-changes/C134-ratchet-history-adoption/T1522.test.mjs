// Case release/T1522 tests: release/C134
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export const id = 'release/T1522';
export const tests = ['release/C134'];
export const title = 'each ratchet of release keeps a history.jsonl beside its baseline: it starts with the adoption line of release/C134 and its size is the size of the baseline now';
const FOLDERS = ['CTL20-gate-verify-triggers', 'CTL36-verify-workflow-names'];
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  for (const f of FOLDERS) {
    const dir = `${repo}/engineering/release-management/04-controls/${f}`;
    assert.ok(existsSync(`${dir}/history.jsonl`), `${f} has no history file`);
    const lines = readFileSync(`${dir}/history.jsonl`, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const baseline = JSON.parse(readFileSync(`${dir}/baseline.json`, 'utf8'));
    assert.ok(lines.length >= 1, `${f}: empty history`);
    let previous = null, time = -Infinity;
    for (const [i, l] of lines.entries()) {
      const at = Date.parse(l.at);
      assert.ok(typeof l.at === 'string' && !Number.isNaN(at) && at >= time, `${f}: line ${i} has no valid time or goes back`);
      assert.ok(typeof l.change === 'string' && l.change, `${f}: line ${i} names no Change`);
      assert.deepEqual(l.removed, [...l.removed].sort(), `${f}: line ${i} removed is not sorted`);
      if (i === 0) { assert.equal(l.from, null, `${f}: the first line is the adoption`); assert.deepEqual(l.removed, []); }
      else { assert.equal(l.from, previous, `${f}: line ${i} does not start where the one before ended`); assert.equal(l.from - l.to, l.removed.length); }
      previous = l.to; time = at;
    }
    assert.equal(lines[0].change, 'release/C134', `${f}: the adoption line names the adopting Change`);
    assert.equal(previous, baseline.length, `${f}: the last line does not end at the size of the baseline`);
  }
}
