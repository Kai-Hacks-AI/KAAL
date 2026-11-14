// Case release/T210 tests: F22
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T210';
export const tests = ['release/F22'];
export const title = 'an install changes only its targets, each an unchanged copy of a source on main';

// An install is right when every changed file is a declared target, each target equals its source (a moved legacy
// file equals its old content), the source is on main, and the target is under .githooks/ or .github/.
export function judge({ changed, pairs, onMain }) {
  const byTarget = new Map(pairs.map((p) => [p.target, p]));
  return changed.every((c) => {
    const p = byTarget.get(c.path);
    return Boolean(p) && /^\.(githooks|github)\//.test(c.path) && onMain(p.source) && c.text === p.text;
  }) && pairs.every((p) => changed.some((c) => c.path === p.target));
}
export function run() {
  const onMain = (s) => s !== 'not-on-main';
  const pairs = [{ source: 's/dispatcher', target: '.githooks/pre-push', text: 'D' }, { source: 's/legacy', target: '.githooks/old/pre-push', text: 'L' }];
  const good = [{ path: '.githooks/pre-push', text: 'D' }, { path: '.githooks/old/pre-push', text: 'L' }];
  assert.equal(judge({ changed: good, pairs, onMain }), true);
  assert.equal(judge({ changed: [{ ...good[0], text: 'D2' }, good[1]], pairs, onMain }), false, 'a changed byte is accepted');
  assert.equal(judge({ changed: [...good, { path: '.githooks/new/x', text: 'x' }], pairs, onMain }), false, 'an extra file is accepted');
  assert.equal(judge({ changed: [good[0]], pairs, onMain }), false, 'a missing target is accepted');
  assert.equal(judge({ changed: good, pairs: [{ ...pairs[0], source: 'not-on-main' }, pairs[1]], onMain }), false, 'a source not on main is accepted');
  assert.equal(judge({ changed: [{ path: 'engineering/x', text: 'D' }], pairs: [{ source: 's/d', target: 'engineering/x', text: 'D' }], onMain }), false, 'a target outside the danger zone is accepted');
  // The real tree: the first install this operation serves is the dispatcher, whose source is not yet on main.
  const src = join(repo, 'engineering/release-management/05-src/wiring/hooks/pre-push-dispatcher');
  assert.ok(existsSync(src), 'the dispatcher source is absent from the Engineering wiring sources');
  assert.equal(readFileSync(join(repo, '.githooks/pre-push'), 'utf8'), readFileSync(src, 'utf8'), '.githooks/pre-push differs from its source');
}
