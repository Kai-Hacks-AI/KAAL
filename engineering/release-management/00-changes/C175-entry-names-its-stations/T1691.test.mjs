// Case release/T1691 tests: release/C175. The entry helper passes its stations to the finder, so a record at each station is read, not UNKNOWN.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const src = join(repo, 'engineering/release-management/05-src');
export const id = 'release/T1691';
export const tests = ['release/C175'];
export const title = 'the entry helper passes { stations: STATIONS } to the finder';
export async function run() {
  const text = readFileSync(join(src, 'lib/entry-flag.mjs'), 'utf8');
  assert.match(text, /findControls\(\[[^\]]*\], \{ stations: STATIONS \}\)/, 'the call names the stations');
  const { STATIONS, resolveEntry } = await import(pathToFileURL(join(src, 'lib/entry-flag.mjs')).href);
  for (const station of STATIONS) {
    const record = `---\nid: release/CTL37\ntitle: verify Freshness\ndescription: It reveals whether a promotion is fresh.\ntype: preventive\nstatus: designed\nhas: [release/I50]\nstations: [${station}:preventive]\nevidence: [fixture:2, real:2, provoked:1:fail]\n---\n# release/CTL37\n`;
    const flags = JSON.stringify({ schema: 'kaal-controls/flags@1', flags: [{ control: 'release/CTL37', place: station, name: `release/CTL37@${station}`, value: 'on' }] });
    const r = resolveEntry({ id: 'release/CTL37', station, recordText: record, flagsText: flags });
    assert.equal(r.stop, undefined, `${station}: the record is read`); assert.equal(r.mode, 'preventive', station);
  }
}
