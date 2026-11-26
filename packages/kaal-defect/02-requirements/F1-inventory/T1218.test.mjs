// Case defect/T1218 tests: defect/F1
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const script = join(root, 'packages/kaal-defect/skills/kaal-defect/scripts/known-defects.mjs');
export const id = 'defect/T1218';
export const tests = ['defect/F1'];

const R = 'r1';
export const title = 'a file that cannot be read inside one location is incomplete discovery of that file alone, and what was read is kept';
export async function run() {
  assert.ok(existsSync(script), 'the script scripts/known-defects.mjs is absent');
  const { readTree, report, incompleteLines } = await import(pathToFileURL(script).href);
  const hosting = await import('@kaihacksai/kaal-hosting');
  const d = mkdtempSync(join(tmpdir(), 'partialread-'));
  for (const sub of ['defects', 'cases']) mkdirSync(join(d, sub));
  // Three records in one location; the middle one cannot be read, so a record is read before it and one after it.
  for (const n of [1, 2, 3]) writeFileSync(join(d, 'defects', `x-D${n}.md`), `---\nid: x/D${n}\n---\n# x/D${n}\n`);
  writeFileSync(join(d, 'cases', 'T1.test.mjs'), '// Case x/T1 tests: x/D1\n');
  const denied = join(d, 'defects', 'x-D2.md');
  // The host refuses one read, as a disk or a permission can; it is the only seam, and it is injected so the Case runs the same on every platform.
  const host = { ...hosting, readFile: async (p) => { if (p === denied) throw Object.assign(new Error('read refused'), { code: 'EACCES' }); return hosting.readFile(p); } };
  const places = [{ context: 'a', defects: join(d, 'defects'), architecture: [], cases: [join(d, 'cases')] }];
  const tree = await readTree(places, host);

  assert.ok(tree.defects.has('x/D1') && tree.defects.has('x/D3'), 'the records read before and after the unreadable file are kept');
  assert.ok(!tree.defects.has('x/D2'), 'the unreadable record is not invented');
  assert.deepEqual(incompleteLines(tree), [`incomplete defects ${denied} (EACCES)`], 'the unreadable file is named with its reason, and nothing else is reported incomplete');
  // Nothing found is answered while discovery is incomplete: D1 has its only known Case GREEN and complete, and stays unknown.
  const green = [{ case: 'x/T1', run: '1', revision: R, outcome: 'GREEN', complete: true }];
  const lines = report(tree, green, R);
  assert.ok(lines.includes('unknown x/D1'), 'x/D1 is reported, and is not answered from a partial discovery');
  assert.ok(lines.includes('unknown x/D3'), 'x/D3 is reported');
  assert.ok(lines.some((l) => l.startsWith('incomplete defects ') && l.includes(denied)), 'the report says which file could not be read');
  // The same location read without the refusal is complete and answered.
  const ok = await readTree(places, hosting);
  assert.deepEqual(incompleteLines(ok), []);
  assert.ok(report(ok, green, R).includes('answered x/D1'));
}
