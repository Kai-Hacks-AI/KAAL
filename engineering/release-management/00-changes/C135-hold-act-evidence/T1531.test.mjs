// Case release/T1531 tests: release/C135
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { carriedCaseFiles } from '../../05-src/phase/list-carried-cases.mjs';
export const id = 'release/T1531';
export const tests = ['release/C135'];
export const title = 'the lister names the Case files of the Changes a collector carries and no Case of a Change main already holds, and nothing when none is carried';
export async function run() {
  const tmp = mkdtempSync(join(tmpdir(), 't1531-'));
  const put = (tree, rel, text) => { mkdirSync(join(tree, rel, '..'), { recursive: true }); writeFileSync(join(tree, rel), text); };
  const change = (tree, dir, cid) => put(tree, `engineering/x/00-changes/${dir}/${cid.split('/')[1]}.md`, `---\nid: ${cid}\ntitle: t\n---\n`);
  const kase = (tree, dir, name, cid) => put(tree, `engineering/x/00-changes/${dir}/${name}.test.mjs`, `export const id = '${cid}';\nexport const tests = [];\nexport async function run() {}\n`);
  try {
    const main = join(tmp, 'main'), collector = join(tmp, 'collector'), none = join(tmp, 'none');
    for (const tree of [main, collector, none]) { change(tree, 'C1-old', 'x/C1'); kase(tree, 'C1-old', 'T1', 'x/T1'); }
    change(collector, 'C2-new', 'x/C2'); kase(collector, 'C2-new', 'T2', 'x/T2'); kase(collector, 'C2-new', 'T3', 'x/T3');
    assert.deepEqual(carriedCaseFiles(main, collector), ['engineering/x/00-changes/C2-new/T2.test.mjs', 'engineering/x/00-changes/C2-new/T3.test.mjs'], 'the carried Change contributes its Cases, main\'s Change none');
    assert.deepEqual(carriedCaseFiles(main, none), [], 'a collector that carries nothing lists nothing');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
