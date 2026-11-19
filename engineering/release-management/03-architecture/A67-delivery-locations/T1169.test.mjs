// Case release/T1169 tests: release/A67
import assert from 'node:assert/strict';
import { loadSrc } from './fixtures.mjs';
export const id = 'release/T1169';
export const tests = ['release/A67'];
export const title = 'the declaration names every delivery location and the root files, and the reader says what is delivery';
export async function run() {
  const { parseLocations, readLocations, isDelivery } = await loadSrc('delivery/locations.mjs');
  const l = readLocations();
  assert.deepEqual([...l.roots].sort(), ['.agents', '.claude', '.github', '.githooks', '.kaal'].sort());
  assert.deepEqual([...l.wirable].sort(), ['.agents', '.claude', '.github', '.githooks', '.kaal'].sort());
  assert.deepEqual([...l.files].sort(), ['package-lock.json', 'package.json'].sort());
  for (const p of ['.github/workflows/a.yml', '.agents/skills/x/SKILL.md', '.claude/skills/x/SKILL.md', '.kaal/core/x', 'package.json', 'package-lock.json']) assert.equal(isDelivery(p, l), true, p + ' is delivery');
  for (const p of ['engineering/x.md', 'packages/x/package.json', 'packages/x/src/y.mjs', '.agents', '.githubx/y', 'package.jsonx', 'README.md']) assert.equal(isDelivery(p, l), false, p + ' is not delivery');
  const f = (files) => ({ locations: [{ root: '.a', wirable: true }], files });
  for (const [name, files] of [['not a list', 'x'], ['a path with a slash', [{ path: 'a/b', wirable: false }]], ['a dot-dot', [{ path: '..', wirable: false }]], ['no wirable', [{ path: 'a' }]], ['a duplicate', [{ path: 'a', wirable: false }, { path: 'a', wirable: false }]], ['a root named again', [{ path: '.a', wirable: false }]]]) assert.throws(() => parseLocations(f(files)), name + ' is refused');
  assert.deepEqual(parseLocations({ locations: [{ root: '.a', wirable: true }] }).files, [], 'a declaration without files has none');
}
