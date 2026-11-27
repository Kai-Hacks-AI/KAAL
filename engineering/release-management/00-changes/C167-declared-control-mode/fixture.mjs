// The fixtures the Cases of release/C167 share: a control record with a declared station, a flag file, and the files a job supplies.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
export const ID = 'release/CTL37';
export const STATION = 'Promoting';
export const record = (stations) => `---\nid: ${ID}\ntitle: verify Freshness\ndescription: It reveals whether a promotion is fresh.\ntype: preventive\nstatus: designed\nhas: [release/I50]\n${stations ? `stations: [${stations}]\n` : ''}evidence: [fixture:2, real:2, provoked:1:fail]\n---\n# ${ID}\n`;
export const flags = (...entries) => JSON.stringify({ schema: 'kaal-controls/flags@1', flags: entries.map(([value, control = ID, place = STATION]) => ({ control, place, name: `${control}@${place}`, value })) });
export function job({ stations, flagsText, withRecord = true }) {
  const dir = mkdtempSync(join(tmpdir(), 'c167-'));
  const env = { KAAL_DEFAULT: 'main', KAAL_STATION: STATION, GITHUB_RUN_ID: '7' };
  if (withRecord) { writeFileSync(join(dir, 'record.md'), record(stations)); env.KAAL_CONTROL_RECORD = join(dir, 'record.md'); }
  env.KAAL_FLAGS = join(dir, 'flags.json');
  if (flagsText !== undefined) writeFileSync(env.KAAL_FLAGS, flagsText);
  return { dir, env };
}
