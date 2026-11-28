// Case release/T1794 tests: release/C201. On a fixture flag file of the instance's format, every adopting control resolves at every station its check is judged at; a file missing, an entry missing or a value invalid is an unknown decision.
import assert from 'node:assert/strict';
import { load, files, record, flags, IDS, JUDGED, TARGET } from './fixture.mjs';
export const id = 'release/T1794';
export const tests = ['release/C201'];
export const title = 'on a fixture flag file every adopting control resolves at every station, and a missing file, entry or value is exit 1, never a pass';
export async function run() {
  const { fromEnv } = await load('lib/entry-flag.mjs');
  for (const ID of IDS) for (const station of JUDGED) {
    const good = files({ recordText: record(ID, `${station}:preventive`), flagsText: flags(IDS, JUDGED, 'advisory') });
    const r = fromEnv({ id: ID, env: good.env, baseRef: TARGET[station] });
    assert.ok(!r.stop, `${ID}@${station}: resolves`); assert.equal(r.station, station);
    for (const [why, flagsText] of [['file missing', undefined], ['entry missing', flags(IDS, JUDGED, 'advisory', [ID, station])], ['value invalid', flags(IDS, JUDGED, 'sometimes')], ['not parsable', '{']]) {
      const bad = files({ recordText: record(ID, `${station}:preventive`), flagsText });
      const e = fromEnv({ id: ID, env: bad.env, baseRef: TARGET[station] });
      assert.equal(e.stop, true, `${ID}@${station}: ${why} runs nothing`); assert.equal(e.exit, 1, `${ID}@${station}: ${why} is exit 1`);
    }
  }
}
