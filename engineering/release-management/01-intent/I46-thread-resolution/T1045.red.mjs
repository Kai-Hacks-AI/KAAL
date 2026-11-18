// Case release/T1045 tests: release/I46
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const folder = (dir, p) => readdirSync(join(RM, dir)).find((n) => n.startsWith(p + '-'));
const read = (dir, p) => { const f = folder(dir, p); assert.ok(f && existsSync(join(RM, dir, f, p + '.md')), p + ' is absent from ' + dir); return readFileSync(join(RM, dir, f, p + '.md'), 'utf8'); };
const flat = (s) => s.replace(/\s+/g, ' ');
export const id = 'release/T1045';
export const tests = ['release/I46'];
export const title = 'the Intent states the thread contract and the bot boundary, and no workflow a stage runs creates an inline review thread';
export async function run() {
  const text = flat(read('01-intent', 'I46'));
  assert.match(text, /does not merge while a review thread on it is unresolved/, 'the thread contract is not stated');
  assert.match(text, /plain comment or a check and never an inline review thread/, 'the bot boundary is not stated');
  const CALLS = /pulls\/[^\s'"]*\/comments|createReviewComment|create_review_comment|addPullRequestReviewThread|addPullRequestReviewComment|pulls\.createReview\b/;
  for (const d of [join(repo, '.github/workflows'), join(RM, '05-src/wiring/workflows')]) {
    for (const f of readdirSync(d).filter((n) => /\.ya?ml$/.test(n))) assert.doesNotMatch(readFileSync(join(d, f), 'utf8'), CALLS, `${f} creates an inline review thread`);
  }
}
