// Case architecture/T2 tests: architecture/N1
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dir, judged, key, read, SKILL, trial } from '../../00-changes/C1-classification/lib.mjs';
export const id = 'architecture/T2';
export const tests = ['architecture/N1'];
export const title = "the Skill is small and the package adds no gate, workflow or deployment";
export function run() {
  assert.ok(read(SKILL, 'the Skill').split('\n').length <= 120, 'the Skill is longer than 120 lines');
  const found = [];
  const walk = (d) => { for (const name of readdirSync(d)) { const p = join(d, name); if (statSync(p).isDirectory()) walk(p); else found.push(p.slice(dir.length + 1)); } };
  walk(dir);
  assert.deepEqual(found.filter((f) => /(^|\/)\.github\//.test(f) || /\.ya?ml$/.test(f)), [], 'the package carries a workflow or a gate');
}
