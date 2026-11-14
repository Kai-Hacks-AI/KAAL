// Case pull/T36 tests: pull/F37
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T36';
export const tests = ['pull/F37'];
export const title = 'a Case file sits at the path its id names, the declaration reads exactly the ids the Cases export, and no completed Case remains under plan/';

// The Cases this Change places (twelve Show WIP Cases and pull/T34): each must be in the inventory the declaration derives.
const NAMED = [...Array.from({ length: 12 }, (_, i) => `coordination/T${33 + i}`), 'pull/T34'];
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.name === 'node_modules' ? [] : e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));

export async function run() {
  // The inventory is what the declaration itself expects: its Case patterns applied to the files of the package, an id being the captured group.
  const declaration = JSON.parse(readFileSync(join(repo, 'engineering/release-management/05-src/pull-promotion/declaration.json'), 'utf8'));
  const patterns = declaration.evidence.cases.files.map((p) => new RegExp(p));
  const inventory = new Map(); // derived id -> path
  const bad = [];
  for (const file of walk(join(repo, 'packages/kaal-release'))) {
    const rel = relative(repo, file).split('\\').join('/');
    for (const re of patterns) {
      const derived = re.exec(rel)?.[1];
      if (!derived) continue;
      inventory.set(derived, rel);
      const exported = /export const id = '([^']+)'/.exec(readFileSync(file, 'utf8'))?.[1];
      if (exported !== derived) bad.push(`${rel}: the declaration expects ${derived}, the Case exports ${exported ?? 'no id'}`);
    }
    if (/\/plan\/[^/]+\/T\d+\.test\.mjs$/.test(rel)) bad.push(`${rel} is a completed Case under plan/: the declaration reads it under a bare id`);
  }
  for (const name of NAMED) if (!inventory.has(name)) bad.push(`${name} is not in the inventory the declaration derives`);
  assert.deepEqual(bad, [], `Cases not where their id says:\n${bad.join('\n')}`);
}
