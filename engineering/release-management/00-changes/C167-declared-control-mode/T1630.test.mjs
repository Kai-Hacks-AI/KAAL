// Case release/T1630 tests: release/C167. The helper passes the control's declared mode for the station and the flag of control and place, requests detective when nothing is declared, and never omits the flag: a missing file, entry or value is the library's configuration failure, never a pass.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ID, STATION, record, flags } from './fixture.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1630';
export const tests = ['release/C167'];
export const title = 'the helper passes the declared mode and the flag of control and place, and a missing flag is a configuration failure';
export async function run() {
  const { resolveEntry } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lib/entry-flag.mjs')).href);
  const go = (stations, flagsText) => resolveEntry({ id: ID, station: STATION, recordText: record(stations), flagsText });
  let r = go(`${STATION}:preventive`, flags(['on']));
  assert.deepEqual(r, { mode: 'preventive', flag: { name: `${ID}@${STATION}`, value: 'on' } }, 'declared preventive with the flag on');
  r = go(`${STATION}:preventive`, flags(['advisory']));
  assert.equal(r.mode, 'preventive'); assert.equal(r.flag.value, 'off', 'the library maps advisory; the helper does not');
  assert.equal(go(undefined, flags(['on'])).mode, 'detective', 'no declaration requests detective');
  assert.equal(go('Collecting:preventive', flags(['on'])).mode, 'detective', 'a declaration for another station is no declaration here');
  // a missing file, a missing entry, an invalid value, an unparsable file: the library's configuration failure, nothing runs
  for (const [why, text] of [['file missing', undefined], ['entry missing', flags(['on', 'release/CTL99'])], ['value invalid', flags(['sometimes'])], ['file unparsable', '{ not json']]) {
    const p = go(`${STATION}:preventive`, text);
    assert.equal(p.stop, true, `preventive, ${why}: nothing runs`); assert.equal(p.exit, 1, `preventive, ${why}: exit 1`);
    assert.ok(p.lines.some((l) => l.includes(`preventive-without-flag:${ID}@${STATION}`)), `preventive, ${why}: the finding names the cause`);
    const d = go(undefined, text);
    assert.equal(d.stop, true, `detective, ${why}: nothing runs`); assert.equal(d.exit, 1, `detective, ${why}: exit 1`);
    assert.ok(d.lines.some((l) => /no-flag|unrecognized-flag/.test(l)), `detective, ${why}: no-flag or unrecognized-flag`);
  }
  assert.equal(go(undefined, flags(['sometimes'])).lines.some((l) => l.includes('unrecognized-flag')), true);
  assert.deepEqual(go(`${STATION}:preventive`, flags(['stopped'])), { stop: true, exit: 0, lines: [`${ID}@${STATION}: stopped, not run`] }, 'a stopped flag does not run the control');
  const u = resolveEntry({ id: ID, station: STATION, recordText: undefined, flagsText: flags(['on']) });
  assert.equal(u.exit, 2, 'a record that cannot be read answers UNKNOWN');
}
