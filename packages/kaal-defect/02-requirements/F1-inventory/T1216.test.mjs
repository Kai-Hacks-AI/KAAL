// Case defect/T1216 tests: defect/F1
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const script = join(root, 'packages/kaal-defect/skills/kaal-defect/scripts/known-defects.mjs');
export const id = 'defect/T1216';
export const tests = ['defect/F1'];

const R = 'r1';
// Every location handed over exists unless a test takes it away. `defects` holds the records, `cases` the Cases.
function fixture(defectIds = ['x/D1']) {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const d = mkdtempSync(join(tmpdir(), 'discovery-'));
  for (const sub of ['defects', 'architecture', 'cases']) mkdirSync(join(d, sub));
  for (const i of defectIds) writeFileSync(join(d, 'defects', i.replace('/', '-') + '.md'), `---\nid: ${i}\n---\n# ${i}\n`);
  writeFileSync(join(d, 'records.json'), '[]');
  return d;
}
const place = (d, over = {}) => [{ context: 'a', defects: join(d, 'defects'), architecture: [join(d, 'architecture')], cases: [join(d, 'cases')], ...over }];
const check = (d, places, ...more) => {
  writeFileSync(join(d, 'places.json'), JSON.stringify(places));
  return spawnSync(process.execPath, [script, '--places', join(d, 'places.json'), '--records', join(d, 'records.json'), '--revision', R, ...more], { encoding: 'utf8' });
};
const lines = (r) => r.stdout.split('\n').filter(Boolean);

export const title = 'a location that cannot be discovered is reported as incomplete discovery and never read as an empty inventory';
export async function run() {
  // A verified empty inventory: every location exists and holds no Defect. The answer is empty and the discovery is complete.
  const empty = fixture([]);
  const ok = check(empty, place(empty));
  assert.equal(ok.status, 0, 'verified empty locations are a complete discovery');
  assert.deepEqual(lines(ok), [], 'a verified empty inventory lists nothing');
  assert.deepEqual(lines(check(empty, place(empty), '--list')), [], 'and has nothing unresolved');

  // The same answer must not come from a location that is not there: that is unavailable, not empty.
  for (const [role, over] of [
    ['defects', (d) => ({ defects: join(d, 'gone') })],
    ['architecture', (d) => ({ architecture: [join(d, 'gone')] })],
    ['cases', (d) => ({ cases: [join(d, 'gone')] })],
  ]) {
    const d = fixture([]);
    for (const extra of [[], ['--list']]) {
      const r = check(d, place(d, over(d)), ...extra);
      assert.notEqual(r.status, 0, `an unavailable ${role} location must not exit as a complete discovery (${extra.join(' ') || 'report'})`);
      assert.ok(lines(r).some((l) => l.startsWith('incomplete ') && l.includes(role) && l.includes(join(d, 'gone'))), `the output names the unavailable ${role} location and says incomplete`);
    }
  }
  // A path that is a file where a folder was handed over is unavailable too.
  const f = fixture([]);
  writeFileSync(join(f, 'notadir'), 'x');
  const r = check(f, place(f, { defects: join(f, 'notadir') }));
  assert.notEqual(r.status, 0, 'a file where a folder was handed over is incomplete discovery');
  assert.ok(lines(r).some((l) => l.startsWith('incomplete ') && l.includes(join(f, 'notadir'))));

  // Incomplete discovery never hides what was found, and never drops an unresolved Defect: the Defect of the available place is still listed.
  const m = fixture(['x/D1']);
  const two = [...place(m), { context: 'b', defects: join(m, 'gone'), architecture: [], cases: [] }];
  const both = check(m, two);
  assert.ok(lines(both).includes('unknown x/D1'), 'the Defect found is still reported');
  assert.ok(lines(both).some((l) => l.startsWith('incomplete ')), 'beside the unavailable location');
  assert.notEqual(both.status, 0);
  const listed = check(m, two, '--list');
  assert.ok(lines(listed).some((l) => l.includes('x/D1')), 'the unresolved inventory still lists the Defect found');
  assert.ok(lines(listed).some((l) => l.startsWith('incomplete ')), 'and says the inventory is incomplete');
  // Caller-owned scope: a location the caller did not hand over is not unavailable, and nothing registers a second list.
  const own = fixture(['x/D1']);
  const scoped = check(own, [{ context: 'a', defects: join(own, 'defects') }]);
  assert.equal(scoped.status, 0, 'no Case or Architecture location handed over is the caller\'s scope, not a failure');
  assert.ok(!/register|known\.json/.test(readFileSync(script, 'utf8')), 'no second register');
}
