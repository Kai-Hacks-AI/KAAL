// Case release/T554 tests: C39 (the overview is counts, a dive-in is the full list)
import assert from 'node:assert/strict';
import { branches, config, load, piece, scriptPath } from './fixtures.mjs';
export const id = 'release/T554';
export const tests = ['release/C39'];
export const title = 'the overview shows a count per place and per package state, and the full list of a place only when that place is asked for';
export async function run() {
  const { showWip, renderInventory } = await load(scriptPath);
  const names = [...Array.from({ length: 30 }, (_, i) => `claude/t${i}`), 'kaal/release/a', 'kaal/release/b', 'hotfix/x'];
  const report = showWip({ pieces: [piece(1, { from: 'kaal/release/a' }), piece(2, { from: 'kaal/release/a', into: 'kaal/release/b' })], branches: branches(...names), gaps: [] }, config());
  const overview = renderInventory(report);
  assert.match(overview, /development\s+30\b/, 'the count of development is not shown');
  assert.match(overview, /kaal\s+2\b.*\b2 transports\b/, 'the count of kaal and its transports is not shown');
  assert.match(overview, /hotfix\s+1\b/);
  assert.ok(!overview.includes('claude/t7'), 'the overview lists a development branch');
  assert.ok(!overview.includes('kaal/release/a'), 'the overview lists a kaal branch');
  const dive = renderInventory(report, { place: 'development' });
  assert.equal(dive.split('\n').filter((l) => l.includes('claude/t')).length, 30, 'the dive-in does not list every branch of the place');
  const kaal = renderInventory(report, { place: 'kaal' });
  assert.ok(kaal.includes('kaal/release/a') && kaal.includes('#1') && kaal.includes('#2'), 'the dive-in does not list the branch with its transports');
  assert.ok(!kaal.includes('claude/t7'), 'the dive-in of one place lists another place');
  assert.throws(() => renderInventory(report, { place: 'nowhere' }), /nowhere/, 'an unknown place is answered with an empty list');
}
