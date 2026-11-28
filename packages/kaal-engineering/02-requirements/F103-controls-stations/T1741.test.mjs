// Case engineering/T1741 tests: engineering/F103
import assert from 'node:assert/strict';
import { files, entry, STATION_NAMES } from './fixture.mjs';
export const id = 'engineering/T1741';
export const tests = ['engineering/F103'];
export const title = 'no file of 13-source/controls holds a list of the station names';
export async function run() {
  for (const name of files()) {
    const held = STATION_NAMES.filter((s) => new RegExp(`['"]${s}['"]`).test(entry(name)));
    assert.ok(held.length < 2, `${name} holds the stations ${held.join(', ')}; the list is Release's`);
  }
}
