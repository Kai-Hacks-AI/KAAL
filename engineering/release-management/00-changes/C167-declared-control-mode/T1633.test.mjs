// Case release/T1633: not applicable answers zero and writes no record whatever the mode and the flag.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ID, STATION, flags, job } from './fixture.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1633';
export const tests = ['release/C167'];
export const title = 'not applicable answers zero and writes no record whatever the mode and the flag';
export async function run() {
  const { cli } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lineage/lib/answer.mjs')).href);
  for (const [stations, flagsText] of [[`${STATION}:preventive`, flags(['on'])], [`${STATION}:preventive`, undefined], [undefined, flags(['advisory'])]]) {
    const { env } = job({ stations, flagsText }); const lines = []; let ran = 0;
    const exit = await cli({ label: 'x', id: ID, check: async () => { ran += 1; return {}; }, applies: () => 'the base is not the default branch', read: () => ({}), argv: ['--head', 'H', '--base-ref', 'x'], env, cwd: repo, out: (l) => lines.push(l) });
    assert.equal(exit, 0); assert.equal(ran, 0); assert.equal(lines.some((l) => l.startsWith('kaal-control ')), false, 'no record');
  }
}
