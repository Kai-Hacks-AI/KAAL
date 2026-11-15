// Case release/T442 tests: F23
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T442';
export const tests = ['release/F23'];
export const title = 'HOW TO WORK definition and trailers: mnemonics defined once, every template source ends with its trailer';

const SOURCES = ['plan', 'do', 'act', 'promotion', 'default', 'wire', 'sync-template'];
export function trailer(text) {
  const i = text.lastIndexOf('\n## HOW TO WORK\n');
  return i < 0 ? null : text.slice(i + 1).trimEnd();
}
export function run() {
  const def = join(repo, 'engineering/HOW-TO-WORK.md');
  assert.ok(existsSync(def), 'the HOW TO WORK definition is absent');
  const text = readFileSync(def, 'utf8');
  for (const k of ['Human Observes Work', 'Testing Orchestrated', 'Worker, Owner, Reviewer, Knowledge']) {
    assert.ok(text.includes(k), `the definition lacks "${k}"`);
  }
  assert.ok(text.includes('HOW ARE WE DOING?'), 'HOW must be named by its Definition');
  assert.ok(!text.includes('Are we heading in the right direction'), 'HOW ARE WE DOING? must not be copied');
  const dir = join(repo, 'engineering/release-management/05-src/wiring/templates');
  for (const s of SOURCES) {
    const f = join(dir, `${s}.md`);
    assert.ok(existsSync(f), `the template source ${s} is absent`);
    const t = trailer(readFileSync(f, 'utf8'));
    assert.ok(t, `${s} does not end with the HOW TO WORK chapter`);
    assert.ok(!/https?:|packages\//.test(t), `${s} trailer holds a link or a packages path`);
    assert.ok(t.split('\n').length <= 5, `${s} trailer is not short`);
  }
}
