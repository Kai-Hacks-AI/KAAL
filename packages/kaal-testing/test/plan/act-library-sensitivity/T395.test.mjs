// Case testing/T395 tests: testing/F170, testing/F171. The pilot record is pinned and complete. Structure only, never prose.
import assert from 'node:assert/strict';
import { KINDS, claims, pilot } from './lib.mjs';

export const id = 'testing/T395';
export const tests = ['testing/F170', 'testing/F171'];
export const title = 'the pilot record names a pinned commit, holds at least twelve complete mutant rows and covers every registered claim';

export function run() {
  const { text, sha, rows } = pilot();
  assert.ok(sha, 'the record names no 40-hex commit SHA');
  assert.ok(rows.length >= 12, `at least twelve mutant rows, found ${rows.length}`);
  assert.equal(new Set(rows.map((r) => r.id)).size, rows.length, 'mutant ids are unique');
  for (const r of rows) {
    assert.equal(r.cells.length, 5, `${r.id}: the five columns Authoritative claim, Mutation, Witness, Observation, Judgment`);
    assert.ok(r.cells.every((c) => c !== ''), `${r.id}: no empty cell`);
    assert.ok(KINDS.some((k) => r.observation.startsWith(k)), `${r.id}: the observation starts with one of ${KINDS.join(', ')}`);
  }
  const covered = new Set(rows.map((r) => r.claim));
  for (const k of claims()) {
    const untested = new RegExp(`^- ${k} untested: \\S`, 'm').test(text);
    assert.ok(covered.has(k) || untested, `claim ${k} has no mutant row and is not listed untested with a reason`);
  }
}
