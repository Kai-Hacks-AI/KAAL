// Case release/T1339 tests: release/I65
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, RM, RUNNER, ROOT, RETROS, ACT_PATHS, makeTrees, gitMerge, retroText } from './act-fixtures.mjs';
const lib = () => import(pathToFileURL(join(RM, '05-src/phase/lib/tree-facts.mjs')).href);
const runner = () => import(pathToFileURL(RUNNER).href);
const answerOf = async (name, spec, changed = ACT_PATHS) => {
  const t = makeTrees(spec);
  try { const { readTree } = await lib(); const { judgeOf } = await runner(); return judgeOf(name, await readTree({ main: t.main, collector: t.pr, changed }), t.pr); } finally { t.cleanup(); }
};
export const id = 'release/T1339';
export const tests = ['release/I65'];
export const title = 'release/I65, release/F90 and release/A101 are placed and equal to their drafts';
export async function run() {
  const draft = (name) => readFileSync(join(RM, '00-changes/C122-act-judges-workflow/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name}\\.md$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
  for (const [name, dir] of [['I65', '01-intent/I65-act-is-judged-where-it-is-made'], ['F90', '02-requirements/F90-act-judges-run-on-collector-pull-requests'], ['A101', '03-architecture/A101-act-judges-workflow']]) {
    const f = join(RM, dir, `${name}.md`);
    assert.ok(existsSync(f), `${name}.md is absent`);
    assert.equal(readFileSync(f, 'utf8'), `${draft(name)}\n`, `${name}.md differs from its draft`);
  }
}
