// Case release/T60 tests: release/A18
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const judgeFile = join(repo, 'engineering/change-isolation/check.mjs');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const frontmatter = (path, what) => read(path, what).split('---')[1] ?? '';
const judge = async () => { const m = await import(pathToFileURL(judgeFile).href); assert.equal(typeof m.judge, 'function', 'the judge is not exported'); return m.judge; };
export const id = 'release/T60';
export const tests = ['release/A18'];
export const title = 'the judge holds the rules once and no adapter restates them';
export async function run() {
  assert.match(read(join(cap, '03-architecture/A17-change-isolation/A18-judge/A18.md'), 'A18'), /parent: release\/A17/);
  const adapters = ['.githooks/pre-push', 'engineering/github/change-isolation.sh', 'engineering/github/push-check.sh', '.github/workflows/change-isolation.yml', '.github/workflows/merge-group.yml'];
  for (const f of adapters) assert.doesNotMatch(readFileSync(join(repo, f), 'utf8'), /kaal-core\/|CORE_SUPPORT/, `${f} restates a rule of the judge`);
  await judge();
}
