// Case pull/T36 tests: pull/F37
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T36';
export const tests = ['pull/F37'];
export const title = 'a Case file sits at the path its id names, and no completed Case remains under plan/';

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.name === 'node_modules' ? [] : e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

export async function run() {
  const root = join(repo, 'packages/kaal-release');
  const bad = [];
  let checked = 0;
  for (const file of walk(root)) {
    const rel = relative(repo, file).split('\\').join('/');
    const placed = /\/test\/([a-z-]+)\/(T\d+)\.test\.mjs$/.exec(rel);
    if (placed) {
      checked += 1;
      const declared = /export const id = '([^']+)'/.exec(readFileSync(file, 'utf8'))?.[1];
      if (declared !== `${placed[1]}/${placed[2]}`) bad.push(`${rel} exports ${declared ?? 'no id'}, the path names ${placed[1]}/${placed[2]}`);
    }
    if (/\/plan\/[^/]+\/T\d+\.test\.mjs$/.test(rel)) bad.push(`${rel} is a completed Case under plan/: the declaration reads it under a bare id`);
  }
  assert.ok(checked >= 10, `only ${checked} Case files found under test/<scope>/`);
  assert.deepEqual(bad, [], `Cases not where their id says:\n${bad.join('\n')}`);
}
