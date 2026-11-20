// Case release/T873 tests: release/C67
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { F17 } from './fixtures.mjs';
export const id = 'release/T873';
export const tests = ['release/C67', 'release/D1'];
export const title = 'the requirement F17 states the agreed route, a HOTFIX into hotfix/ from a head outside it, a PROMOTION from a collector or a hotfix/ branch, a SYNC into kaal/, hotfix/ or wire/, and no longer states the old HOTFIX route';
export async function run() {
  const f17 = readFileSync(F17, 'utf8');
  assert.match(f17, /HOTFIX goes into a base under `hotfix\/` from a head that is not under `hotfix\/`/, 'F17 does not state the HOTFIX route');
  assert.match(f17, /PROMOTION takes `main` as base and a head under `kaal\/` or `hotfix\/`/, 'F17 does not state the PROMOTION route');
  assert.match(f17, /SYNC take a base under `kaal\/`, `hotfix\/` or `wire\/`|SYNC takes a base under `kaal\/`, `hotfix\/` or `wire\/`/, 'F17 does not state the SYNC route');
  assert.match(f17, /from a `hotfix\/` head must be a PROMOTION/, 'F17 does not state that a hotfix/ head is promoted');
  assert.doesNotMatch(f17, /HOTFIX takes a head under `hotfix\/`/, 'F17 still states the old HOTFIX head');
  assert.doesNotMatch(f17, /base of a HOTFIX is not judged/, 'F17 still says the base of a HOTFIX is not judged');
  assert.doesNotMatch(f17, /from a `hotfix\/` head must be a HOTFIX/, 'F17 still says a hotfix/ head takes the TYPE HOTFIX');
}
