// Case release/T1632 tests: release/C167. The mode and the flag are the ones of the files the job names (the base's), never the ones of the head's own tree.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ID, STATION, flags, job } from './fixture.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1632';
export const tests = ['release/C167'];
export const title = 'a head that carries an edited control record or flag file gets the base\'s mode and flag';
export async function run() {
  const { cli } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lineage/lib/answer.mjs')).href);
  const { env, dir } = job({ stations: `${STATION}:preventive`, flagsText: flags(['on']) });
  // the head's own tree carries a flag file that says stopped; it must not be read
  const head = join(dir, 'head'); mkdirSync(join(head, 'engineering/14-operations/controls'), { recursive: true });
  writeFileSync(join(head, 'engineering/14-operations/controls/flags.json'), flags(['stopped']));
  const calls = [];
  const check = async (_f, o) => { calls.push(o); return { kind: 'pass', verdict: 'PASS', findings: [], blocked: false, applied: true, record: null }; };
  await cli({ label: 'x', id: ID, check, applies: () => true, read: () => ({}), argv: ['--head', 'H', '--base-ref', 'main'], env, cwd: head, out: () => {} });
  assert.equal(calls.length, 1, 'the head\'s stopped flag did not stop the run'); assert.equal(calls[0].boundary.flag.value, 'on', 'the base\'s flag is the one passed');
}
