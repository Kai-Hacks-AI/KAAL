// Case release/T1633: validation comes before applicability.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ID, STATION, flags, job } from './fixture.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1633';
export const tests = ['release/C167'];
export const title = 'the flag is validated before applicability: an unknown decision fails on every pull request, a valid flag lets a control that does not apply answer zero';
export async function run() {
  const { cli } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lineage/lib/answer.mjs')).href);
  const go = async ({ stations, flagsText, withRecord }) => {
    const { env } = job({ stations, flagsText, withRecord }); const lines = []; let ran = 0;
    const exit = await cli({ label: 'x', id: ID, check: async () => { ran += 1; return {}; }, applies: () => 'the base is not the default branch', read: () => ({}), argv: ['--head', 'H', '--base-ref', 'x'], env, cwd: repo, out: (l) => lines.push(l) });
    return { exit, ran, record: lines.some((l) => l.startsWith('kaal-control ')) };
  };
  // A valid flag, whatever the declared mode: zero, nothing ran, no record.
  for (const [stations, flagsText] of [[`${STATION}:preventive`, flags(['on'])], [`${STATION}:preventive`, flags(['advisory'])], [`${STATION}:preventive`, flags(['stopped'])], [undefined, flags(['advisory'])]]) {
    const r = await go({ stations, flagsText }); assert.equal(r.exit, 0); assert.equal(r.ran, 0); assert.equal(r.record, false, 'no record');
  }
  // An unknown decision (file, entry or value missing or invalid), declared preventive and detective alike: exit 1, nothing ran, no record.
  for (const stations of [`${STATION}:preventive`, undefined]) for (const flagsText of [undefined, flags(['on', 'release/CTL99']), flags(['bogus']), '{']) {
    const r = await go({ stations, flagsText }); assert.equal(r.exit, 1, `${stations} ${flagsText}`); assert.equal(r.ran, 0); assert.equal(r.record, false);
  }
  // The control record that cannot be read answers UNKNOWN before applicability too.
  const r = await go({ flagsText: flags(['on']), withRecord: false }); assert.equal(r.exit, 2); assert.equal(r.ran, 0);
}
