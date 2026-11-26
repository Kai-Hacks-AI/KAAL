// Case engineering/T1551 tests: engineering/F97
import assert from 'node:assert/strict';
import { load, resolve } from './fixture.mjs';
export const id = 'engineering/T1551';
export const tests = ['engineering/F97'];
export const title = 'no two rows share a path, the longest row wins, and a legacy name resolves like its alias';
export async function run() {
  const areas = load();
  const seen = new Map();
  for (const row of areas.areas) {
    const { path, phase } = row;
    assert.ok(['PLAN', 'DO', 'ACT'].includes(phase) || row.delegatedTo || row.transition, `${path} has neither a phase, a delegate nor a transition`);
    assert.ok(!(phase && (row.delegatedTo || row.transition)), `${path} has both a phase and a delegate or transition`);
    assert.ok(!seen.has(path), `${path} appears twice`);
    seen.set(path, phase);
  }
  assert.notEqual(resolve(areas, '14-operations/controls/CTL1-x/baseline.json'), resolve(areas, '14-operations/controls/CTL1-x/CTL1.md'), 'the longer row beats the shorter');
  for (const [legacy, now] of Object.entries(areas.legacy)) assert.equal(resolve(areas, `${legacy}/a/b.md`), resolve(areas, `${now}/a/b.md`), `${legacy} does not resolve like ${now}`);
  for (const l of ['00-changes', '01-intent', '02-requirements', '03-architecture', '04-controls', '05-src']) assert.ok(areas.legacy[l], `${l} has no alias`);
}
