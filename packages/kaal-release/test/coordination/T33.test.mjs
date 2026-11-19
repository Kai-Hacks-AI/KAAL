// Case coordination/T33 tests: F3, F6 (the station mapping and the order)
import assert from 'node:assert/strict';
import { byRef, config, piece, showWip } from './fixtures.mjs';
export const id = 'coordination/T33';
export const tests = ['coordination/F3', 'coordination/F6'];
export const title = 'a piece is placed by its from and into with the first matching entry; one no entry matches is in unknown station, last; stations follow the config order, empty ones are omitted, pieces go by reference whatever the input order';
export async function run() {
  const pieces = [
    piece(12, { into: 'target', from: 'col/a' }),
    piece(3, { into: 'col/a' }),
    piece(7, { into: 'elsewhere' }),
    piece(5, { into: 'col/b', from: 'target' }),
  ];
  const report = await showWip({ pieces, gaps: [] }, config());
  assert.deepEqual(report.stations.map((s) => s.station), ['Integration', 'Promotion', 'unknown station'], 'stations are not in config order with unknown last');
  assert.deepEqual(report.stations[0].pieces.map((p) => p.ref), ['#3', '#5'], 'pieces of a station are not by reference');
  assert.deepEqual(report.stations[1].pieces.map((p) => p.ref), ['#12']);
  assert.deepEqual(report.stations[2].pieces.map((p) => p.ref), ['#7'], 'a piece no entry matches is not in unknown station');
  const reversed = await showWip({ pieces: [...pieces].reverse(), gaps: [] }, config());
  assert.deepEqual(reversed, report, 'the order of the input changes the report');

  const first = await showWip({ pieces: [piece(1, { from: 'target', into: 'col/a' })], gaps: [] }, config({ stations: [{ station: 'Sync', from: 'target', into: 'col/*' }, { station: 'Integration', into: 'col/*' }] }));
  assert.equal(first.stations[0].station, 'Sync', 'the first matching entry does not win');
  assert.equal(first.stations.length, 1, 'a station with no piece is listed');

  const empty = await showWip({ pieces: [piece(2, { into: 'col/z' })], gaps: [] }, config({ stations: [] }));
  assert.deepEqual(empty.stations.map((s) => s.station), ['unknown station'], 'a default mapping was assumed');
  assert.equal(byRef(report, '#12').type, 'DO');
}
