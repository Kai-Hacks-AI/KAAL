// Case release/T1375 tests: release/C125
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { use } from './evidence-fixtures.mjs';
export const id = 'release/T1375';
export const tests = ['release/C125'];
export const title = 'the Cases that apply are read from both quote forms of the Case id, and a file that declares an id in neither form is not a Case';
export async function run() {
  const { applicableCases } = await use('lib/collector.mjs');
  const root = mkdtempSync(join(tmpdir(), 'c125-'));
  const put = (p, t) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), t); };
  try {
    put('00-changes/C9-demo/C9.md', '---\nid: x/C9\n---\n# x/C9\n');
    put('00-changes/C9-demo/T9001.test.mjs', "export const id = 'x/T9001';\nexport const tests = ['x/C9'];\n");
    put('00-changes/C9-demo/T9002.test.mjs', 'export const id = "x/T9002";\nexport const tests = ["x/C9"];\n');
    put('00-changes/C9-demo/T9003.test.mjs', '// no id here\nexport const tests = [\'x/C9\'];\n');
    put('00-changes/C9-demo/T9004.test.mjs', 'export const id = `x/T9004`;\n');
    assert.deepEqual((await applicableCases(root, '00-changes/C9-demo')).map((c) => c.id), ['x/T9001', 'x/T9002']);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
