// Case release/T560 tests: C40 (the concept sentence and its place)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const file = join(repo, 'engineering/release-management/HOW-TO-WORK.md');
const read = () => { assert.ok(existsSync(file), 'HOW-TO-WORK.md is absent from engineering/release-management'); return readFileSync(file, 'utf8'); };
const draft = () => {
  const after = readFileSync(join(repo, 'engineering/release-management/00-changes/C40-how-to-work-concept/interface.md'), 'utf8').split(/^## Draft of HOW-TO-WORK\.md$/m)[1];
  const m = after?.match(/^````\n([\s\S]*?)\n````$/m);
  assert.ok(m, 'the fenced draft is absent');
  return `${m[1]}\n`;
};
export const id = 'release/T560';
export const tests = ['release/C40'];
export const title = 'the HOW TO WORK Definition is in release management with the exact sentence, says Orchestrates, and the old place holds none';
export function run() {
  const text = read();
  assert.match(text, /^---\nname: HOW TO WORK\ntype:\n  name: KAAL Definition\n/, 'the Definition frontmatter is absent');
  assert.ok(text.includes('Human Observes Work. Testing Orchestrates Worker, Owner, Reviewer, Knowledge.'), 'the sentence is not the agreed one');
  assert.ok(!/Orchestrated/.test(text), 'the wording says Orchestrated');
  assert.ok(!existsSync(join(repo, 'engineering/HOW-TO-WORK.md')), 'a second Definition exists at engineering/HOW-TO-WORK.md');
}
