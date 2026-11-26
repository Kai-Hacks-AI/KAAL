// Case engineering/T1551 tests: engineering/F97
import assert from 'node:assert/strict';
import { load, resolve } from './fixture.mjs';
export const id = 'engineering/T1551';
export const tests = ['engineering/F97'];
export const title = 'no two rows share a path, the longest row wins, and a legacy name resolves like its alias';
export async function run() {
  const areas = load();
  const seen = new Map();
  for (const { path, phase } of areas.areas) {
    assert.ok(['PLAN', 'DO', 'ACT'].includes(phase), `${path} has the phase ${phase}`);
    assert.ok(!seen.has(path), `${path} appears twice`);
    seen.set(path, phase);
  }
  assert.notEqual(resolve(areas, '01-changes/C1-x/do.md'), resolve(areas, '01-changes/C1-x/change.md'), 'the longer row beats the shorter');
  for (const [legacy, now] of Object.entries(areas.legacy)) assert.equal(resolve(areas, `${legacy}/a/b.md`), resolve(areas, `${now}/a/b.md`), `${legacy} does not resolve like ${now}`);
  for (const l of ['00-changes', '01-intent', '02-requirements', '03-architecture', '04-controls', '05-src']) assert.ok(areas.legacy[l], `${l} has no alias`);
}
