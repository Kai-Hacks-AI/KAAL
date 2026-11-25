// Case release/T1345 tests: release/A101
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
export const id = 'release/T1345';
export const tests = ['release/A101'];
export const title = 'one reading of the tree: the runner asks the library, and neither it nor a judge holds a reader of its own';
export async function run() {
  const lib = join(RM, '05-src/phase/lib/tree-facts.mjs');
  assert.ok(existsSync(lib), 'tree-facts.mjs is absent');
  const run = readFileSync(RUNNER, 'utf8');
  assert.match(run, /from '\.\/lib\/tree-facts\.mjs'/);
  assert.doesNotMatch(run, /find-retros|judge-retro|readdirSync|readFileSync/, 'the runner holds a reader of its own');
  const { capabilityRoots, carriedFolders } = await import(pathToFileURL(lib).href);
  assert.equal(typeof capabilityRoots, 'function'); assert.equal(typeof carriedFolders, 'function');
}
