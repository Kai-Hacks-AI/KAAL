// Case release/T84 tests: release/G24
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T84';
export const tests = ['release/G24'];
export const title = 'gap release/G24 is closed: the context each ruleset needs is recorded, one per target';
export function run() {
  const needs = JSON.parse(read(join(cap, '00-changes/C5-dependency-review/ruleset-needs.json'), 'ruleset-needs.json'));
  const entries = needs.per_control_contexts ?? [];
  assert.equal(entries.length, 2, 'a context is not recorded for each of the two targets');
  assert.equal(new Set(entries.map((e) => e.context)).size, 2, 'the two contexts share a name');
  for (const e of entries) {
    assert.match(e.context, /\([^)]+\)$/, 'a context does not name its target in brackets');
    assert.ok(e.precondition, `no precondition is stated for ${e.context}`);
  }
  assert.match(entries.find((e) => /Promotion/.test(e.context))?.precondition ?? '', /A4/, 'the Promotion context does not wait for A4');
}
