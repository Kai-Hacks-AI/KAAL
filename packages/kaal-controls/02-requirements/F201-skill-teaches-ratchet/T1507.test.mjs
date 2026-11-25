// Case controls/T1507 tests: controls/F201
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const skill = join(repo, 'packages/kaal-controls/skills/kaal-controls');
export const id = 'controls/T1507';
export const tests = ['controls/F201'];
export const title = 'the declaration fields of a ratchet are taught in declaring-controls.md only, and the ratchet text does not repeat them';
export async function run() {
  const refs = join(skill, 'references');
  const modes = join(refs, 'modes.md'), declaring = join(refs, 'declaring-controls.md');
  assert.ok(existsSync(modes) && existsSync(declaring), 'a reference is absent');
  const fields = ['strategy: ratchet', 'baseline-source', 'exit:', 'owner:'];
  const m = readFileSync(modes, 'utf8'), d = readFileSync(declaring, 'utf8');
  for (const f of fields) assert.ok(!m.includes(f), `the ratchet text repeats "${f}"`);
  assert.ok(d.includes('strategy: ratchet') && d.includes('baseline-source'), 'declaring-controls.md no longer teaches the declaration');
}
