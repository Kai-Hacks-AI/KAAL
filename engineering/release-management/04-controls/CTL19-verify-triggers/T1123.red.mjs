// Case release/T1123 tests: release/I50
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/triggers/verify-triggers.mjs');
const load = () => import(pathToFileURL(MOD).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C90-no-pull-request-target/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1123';
export const tests = ['release/I50'];
export const title = 'the target: no workflow in the tree uses pull_request_target (held RED until the count is 0)';
export async function run() {
  const { uses, readTree } = await load();
  const tree = readTree(join(repo, '.github/workflows'));
  const hits = Object.keys(tree).filter((p) => uses(tree[p]));
  assert.deepEqual(hits, [], 'workflows still using pull_request_target');
}
