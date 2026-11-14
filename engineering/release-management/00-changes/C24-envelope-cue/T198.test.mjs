// Case release/T198 tests: G56
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const id = 'release/T198';
export const tests = ['release/G56'];
export const title = 'gap release/G56 is closed: the capability texts of the pull request templates open their body with the one Change envelope cue, as the envelope judge reads visible text';
// The capability texts, named. A missing one fails the Case. The templates installed under .github are release/C25.
const TEXTS = [
  '03-architecture/A34-sync-template/sync-template.md',
  '03-architecture/A41-fallback-template/fallback-template.md',
];
export async function run() {
  // The visible text is read by the same function the envelope judge uses, not by a copy.
  const { stripComments } = await import(pathToFileURL(join(cap, '05-src/plan-body/comments.mjs')).href);
  const envelope = await import(pathToFileURL(join(cap, '05-src/plan-body/envelope.mjs')).href);
  for (const text of TEXTS) {
    const path = join(cap, text);
    assert.ok(existsSync(path), `the capability text ${text} is absent`);
    const lines = stripComments(readFileSync(path, 'utf8')).split('\n').map((line) => line.trimEnd()).filter((line) => line !== '');
    assert.equal(lines[0], CUE, `${text} does not open its body with the Change envelope cue`);
    assert.equal(lines.filter((line) => line === CUE).length, 1, `${text} holds the cue more than once`);
  }
  assert.equal(envelope.CUE, CUE, 'the envelope judge does not export the cue it accepts, or accepts another one');
}
