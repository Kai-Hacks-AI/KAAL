// Case release/T1790 tests: release/C201. The target of a pull request has one station, from one mapping beside the list of stations.
import assert from 'node:assert/strict';
import { load } from './fixture.mjs';
export const id = 'release/T1790';
export const tests = ['release/C201'];
export const title = 'stationOf maps the default branch to Promoting, kaal/**, hotfix/** and wire/** to their stations, and any other target to none';
export async function run() {
  const { stationOf, STATIONS } = await load('lib/stations.mjs');
  assert.equal(typeof stationOf, 'function', 'stationOf is absent');
  const at = (baseRef, defaultBranch = 'main') => stationOf({ baseRef, defaultBranch });
  assert.equal(at('main'), 'Promoting'); assert.equal(at('trunk', 'trunk'), 'Promoting', 'the default branch is whatever the repository says');
  assert.equal(at('kaal/release/x'), 'Collecting'); assert.equal(at('kaal/x'), 'Collecting');
  assert.equal(at('hotfix/x'), 'Hotfixing'); assert.equal(at('hotfix/a/b'), 'Hotfixing');
  assert.equal(at('wire/x'), 'Wiring');
  for (const none of ['claude/x', 'feature/y', 'kaal', 'kaal/', 'hotfix/', 'wire/', 'mainline', 'Main', 'refs/heads/main', 'xkaal/x']) assert.equal(at(none), undefined, `${none} is at no station`);
  for (const missing of [undefined, null, '', 5]) { assert.equal(at(missing), undefined, `a target ${String(missing)} has none`); assert.equal(stationOf({ baseRef: 'main', defaultBranch: missing }), undefined, `a default ${String(missing)} gives none`); }
  assert.equal(stationOf(), undefined);
  for (const b of ['main', 'kaal/a', 'hotfix/a', 'wire/a']) assert.ok(STATIONS.includes(at(b)), `${b}: every answer is a station`);
}
