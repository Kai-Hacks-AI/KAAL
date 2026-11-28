// Case release/T1791 tests: release/C201. An engaged entry with no KAAL_STATION resolves its flag at the station of its target; a supplied KAAL_STATION wins.
import assert from 'node:assert/strict';
import { load, files, record, flags, TARGET, JUDGED } from './fixture.mjs';
export const id = 'release/T1791';
export const tests = ['release/C201'];
export const title = 'an engaged entry takes the station of its target, and a supplied KAAL_STATION still wins';
export async function run() {
  const { fromEnv } = await load('lib/entry-flag.mjs');
  const ID = 'release/CTL37';
  for (const station of JUDGED) {
    const { env } = files({ recordText: record(ID, `${station}:preventive`), flagsText: flags([ID], [station], 'on') });
    const entry = fromEnv({ id: ID, env, baseRef: TARGET[station] });
    assert.equal(entry.station, station, `${TARGET[station]} resolves at ${station}`);
    assert.equal(entry.mode, 'preventive', `${station}: the declared mode at that station`); assert.equal(entry.flag.value, 'on');
    // the same files at another target have no declaration or entry there
    const other = JUDGED.find((s) => s !== station);
    assert.equal(fromEnv({ id: ID, env, baseRef: TARGET[other] }).exit, 1, `${other}: no entry at that station is an unknown decision, never a pass`);
  }
  // supplied wins: the same job, KAAL_STATION Promoting, a target that would be Collecting
  const { env } = files({ recordText: record(ID, 'Promoting:preventive'), flagsText: flags([ID], ['Promoting'], 'on') });
  const supplied = fromEnv({ id: ID, env: { ...env, KAAL_STATION: 'Promoting' }, baseRef: 'kaal/release/x' });
  assert.equal(supplied.station, 'Promoting'); assert.equal(supplied.mode, 'preventive');
  // not engaged: nothing changes
  assert.equal(fromEnv({ id: ID, env: { KAAL_DEFAULT: 'main' }, baseRef: 'main' }), undefined, 'a job that supplies no flag has not adopted it');
}
