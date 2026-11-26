// Case engineering/T1562 tests: engineering/F98
import assert from 'node:assert/strict';
import { load, loadAreas } from './fixture.mjs';
export const id = 'engineering/T1562';
export const tests = ['engineering/F98'];
export const title = 'one truth: write-areas.json carries no recognition and lists the same TYPEs as the definition';
export async function run() {
  const d = load();
  const prs = loadAreas().pullRequests;
  assert.deepEqual(prs.map((p) => p.type).sort(), d.types.map((t) => t.type).sort(), 'the two files list different TYPEs');
  for (const p of prs) assert.ok(!('recognised' in p) && !('elsewhere' in p), `${p.type} repeats recognition in write-areas.json`);
}
