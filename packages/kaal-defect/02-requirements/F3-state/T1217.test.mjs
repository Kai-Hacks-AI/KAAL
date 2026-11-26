// Case defect/T1217 tests: defect/F3
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const script = join(root, 'packages/kaal-defect/skills/kaal-defect/scripts/known-defects.mjs');
export const id = 'defect/T1217';
export const tests = ['defect/F3'];

const R = 'r1';
const rec = (c, outcome, complete = true) => ({ case: c, run: '1', revision: R, outcome, complete });
// One Defect x/D1 with a Case in `cases`; a second Cases folder is handed over, present or not.
function fixture({ second }) {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const d = mkdtempSync(join(tmpdir(), 'partial-'));
  for (const sub of ['defects', 'cases-a', 'cases-b']) mkdirSync(join(d, sub));
  writeFileSync(join(d, 'defects', 'x-D1.md'), '---\nid: x/D1\n---\n# x/D1\n');
  writeFileSync(join(d, 'cases-a', 'T1.test.mjs'), '// Case x/T1 tests: x/D1\n');
  if (second === 'present') writeFileSync(join(d, 'cases-b', 'T2.test.mjs'), '// Case x/T2 tests: x/D1\n');
  return d;
}
const check = (d, second, records) => {
  writeFileSync(join(d, 'places.json'), JSON.stringify([{ context: 'a', defects: join(d, 'defects'), architecture: [], cases: [join(d, 'cases-a'), join(d, second === 'gone' ? 'cases-gone' : 'cases-b')] }]));
  writeFileSync(join(d, 'records.json'), JSON.stringify(records));
  return spawnSync(process.execPath, [script, '--places', join(d, 'places.json'), '--records', join(d, 'records.json'), '--revision', R], { encoding: 'utf8' });
};
const lines = (r) => r.stdout.split('\n').filter(Boolean);

export const title = 'a partial Case inventory never produces answered, while RED still confirms';
export async function run() {
  // Complete discovery, every Case GREEN and complete: answered.
  const full = fixture({ second: 'present' });
  const ok = check(full, 'present', [rec('x/T1', 'GREEN'), rec('x/T2', 'GREEN')]);
  assert.equal(ok.status, 0);
  assert.ok(lines(ok).includes('answered x/D1'), 'with every location discovered and every Case GREEN the Defect is answered');

  // One Cases location unavailable: the Case that may live there is unknown, so the Defect is not answered from the Cases that were found.
  const part = fixture({ second: 'gone' });
  const r = check(part, 'gone', [rec('x/T1', 'GREEN')]);
  assert.ok(!lines(r).includes('answered x/D1'), 'a partial Case inventory must not produce answered');
  assert.ok(lines(r).includes('unknown x/D1'), 'the state stays unknown');
  assert.ok(lines(r).some((l) => l.startsWith('incomplete ') && l.includes('cases-gone')), 'and the report says which location was unavailable');
  assert.notEqual(r.status, 0, 'the run does not exit as a complete discovery');

  // A Case found RED is evidence of the Defect whatever else could not be read.
  const red = check(part, 'gone', [rec('x/T1', 'RED')]);
  assert.ok(lines(red).includes('confirmed x/D1'), 'RED confirms even when discovery is incomplete');
  assert.notEqual(red.status, 0);

  // The same holds when the Defect's own Cases are all found but a Defect or Architecture location of the caller was unavailable.
  const other = fixture({ second: 'present' });
  writeFileSync(join(other, 'places.json'), JSON.stringify([{ context: 'a', defects: join(other, 'defects'), architecture: [join(other, 'arch-gone')], cases: [join(other, 'cases-a'), join(other, 'cases-b')] }]));
  writeFileSync(join(other, 'records.json'), JSON.stringify([rec('x/T1', 'GREEN'), rec('x/T2', 'GREEN')]));
  const o = spawnSync(process.execPath, [script, '--places', join(other, 'places.json'), '--records', join(other, 'records.json'), '--revision', R], { encoding: 'utf8' });
  assert.ok(!lines(o).includes('answered x/D1'), 'while any supplied location is unavailable nothing is answered');
  assert.ok(lines(o).some((l) => l.startsWith('incomplete ')));
}
