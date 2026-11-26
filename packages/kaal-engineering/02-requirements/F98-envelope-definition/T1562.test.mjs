// Case engineering/T1562 tests: engineering/F98
import assert from 'node:assert/strict';
import { load, loadAreas } from './fixture.mjs';
export const id = 'engineering/T1562';
export const tests = ['engineering/F98'];
export const title = 'the file and write-areas.json list the same TYPEs';
export async function run() {
  const d = load();
  const prs = loadAreas().pullRequests;
  assert.deepEqual(prs.map((p) => p.type).sort(), d.types.map((t) => t.type).sort(), 'the two files list different TYPEs');
}
