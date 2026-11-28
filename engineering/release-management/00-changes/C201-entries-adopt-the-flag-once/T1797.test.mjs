// Case release/T1797 tests: release/C201. No silent bypass: a violation never exits 0 when the flag cannot be established, and a target at no station never exits 0.
import assert from 'node:assert/strict';
import { load, files, record, flags, ENTRIES, JUDGED, TARGET } from './fixture.mjs';
export const id = 'release/T1797';
export const tests = ['release/C201'];
export const title = 'with the flag file, an entry or a value missing or invalid, or the target at no station, an adopting entry never exits 0 on a violation';
export async function run() {
  const { fromEnv } = await load('lib/entry-flag.mjs');
  for (const [, ID] of ENTRIES) {
    for (const station of JUDGED) for (const [why, flagsText] of [['file missing', undefined], ['entry missing', flags([ID], JUDGED, 'on', [ID, station])], ['value invalid', flags([ID], JUDGED, 'sometimes')], ['unparsable', '{']]) {
      const r = fromEnv({ id: ID, env: files({ recordText: record(ID, `${station}:preventive`), flagsText }).env, baseRef: TARGET[station] });
      assert.equal(r.stop, true, `${ID}@${station} ${why}: nothing runs`); assert.notEqual(r.exit, 0, `${ID}@${station} ${why}: never a pass`);
    }
    // the record that cannot be read
    const nr = fromEnv({ id: ID, env: files({ flagsText: flags([ID], JUDGED, 'on') }).env, baseRef: 'main' });
    assert.equal(nr.stop, true); assert.notEqual(nr.exit, 0, `${ID}: an unreadable record is never a pass`);
    // no station
    for (const baseRef of ['claude/x', 'feature/y', undefined]) {
      const r = fromEnv({ id: ID, env: files({ recordText: record(ID, 'Promoting:preventive'), flagsText: flags([ID], JUDGED, 'on') }).env, baseRef });
      assert.equal(r.stop, true); assert.notEqual(r.exit, 0, `${ID}: the target ${baseRef} at no station is never a pass`);
    }
  }
}
