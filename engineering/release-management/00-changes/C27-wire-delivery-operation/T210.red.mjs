// Case release/T210 tests: F22
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T210';
export const tests = ['release/F22'];
export const title = 'the install judge accepts only unchanged copies and declared moves, shown on good and bad installs';

// A collector CHECK Case: it judges the Engineering judge on fixtures and needs no install.
export async function run() {
  const mod = join(repo, 'engineering/release-management/05-src/wiring/wire-judge.mjs');
  assert.ok(existsSync(mod), 'the install judge is absent from the Engineering wiring sources');
  const { judge } = await import(pathToFileURL(mod).href);
  const sha = (s) => `sha:${s}`;
  const ctx = { onMain: (p) => p !== 'not-on-main', baseText: (p) => (p === '.githooks/pre-push' ? 'L' : undefined), hash: sha };
  const copy = { kind: 'copy', source: 's/dispatcher', target: '.githooks/pre-push', text: 'D' };
  const move = { kind: 'move', from: '.githooks/pre-push', target: '.githooks/old/pre-push', sha256: sha('L') };
  const good = [{ path: '.githooks/pre-push', text: 'D' }, { path: '.githooks/old/pre-push', text: 'L' }];
  const ok = (changed, pairs) => judge({ changed, pairs, ...ctx });
  assert.equal(ok(good, [copy, move]), true);
  assert.equal(ok([{ ...good[0], text: 'D2' }, good[1]], [copy, move]), false, 'a changed byte is accepted');
  assert.equal(ok([good[0], { ...good[1], text: 'L2' }], [copy, move]), false, 'a changed moved file is accepted');
  assert.equal(ok(good, [copy, { ...move, sha256: sha('X') }]), false, 'a move with the wrong preimage hash is accepted');
  assert.equal(ok(good, [copy, { ...move, from: '.githooks/other' }]), false, 'a move from a file with no preimage on main is accepted');
  assert.equal(ok([...good, { path: '.githooks/new/x', text: 'x' }], [copy, move]), false, 'an extra file is accepted');
  assert.equal(ok([good[0]], [copy, move]), false, 'a missing target is accepted');
  assert.equal(ok(good, [{ ...copy, source: 'not-on-main' }, move]), false, 'a source not on main is accepted');
  assert.equal(ok([{ path: 'engineering/x', text: 'D' }], [{ kind: 'copy', source: 's/d', target: 'engineering/x', text: 'D' }]), false, 'a target outside .githooks and .github is accepted');
}
