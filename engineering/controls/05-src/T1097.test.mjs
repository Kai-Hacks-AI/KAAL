// Case controls/T1097 tests: controls/A16
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'controls/T1097';
export const tests = ['controls/A16'];
export const title = 'the converter copies a runner report into records and marks a failure only when the base was RED and the head is GREEN';
export async function run() {
  const { reportToRecords } = await import(pathToFileURL(join(repo, 'engineering/controls/05-src/report-to-records.mjs')).href);
  const head = { tests: [{ id: 'demo/T1', actual: 'GREEN' }, { id: 'demo/T2', actual: 'GREEN' }, { id: 'demo/T3', actual: 'RED' }, { id: 'demo/T4', actual: 'GREEN' }] };
  const base = { tests: [{ id: 'demo/T1', actual: 'RED' }, { id: 'demo/T2', actual: 'GREEN' }, { id: 'demo/T3', actual: 'RED' }] };
  const plain = reportToRecords(head, { x: 'fixture', run: 'r1' });
  assert.deepEqual(plain.map((r) => [r.case, r.outcome]), [['demo/T1', 'GREEN'], ['demo/T2', 'GREEN'], ['demo/T3', 'RED'], ['demo/T4', 'GREEN']]);
  assert.ok(plain.every((r) => r.x === 'fixture' && r.run === 'r1' && !('base' in r)), 'a record without a base gained one');
  const pair = reportToRecords(head, { x: 'provoked', run: 'r2', base });
  const by = Object.fromEntries(pair.map((r) => [r.case, r]));
  assert.deepEqual(by['demo/T1'].base, { run: 'r2-base', outcome: 'RED' }, 'RED then GREEN carried no base');
  assert.ok(!('base' in by['demo/T2']), 'GREEN then GREEN carried a base');
  assert.ok(!('base' in by['demo/T3']), 'a RED head carried a base');
  assert.ok(!('base' in by['demo/T4']), 'a test absent from the base carried a base');
}
