// Case release/T1045 tests: release/I46
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const IFACE = readFileSync(join(RM, '00-changes/C81-thread-resolution/interface.md'), 'utf8');
const draft = (name) => IFACE.split(new RegExp('^## Draft of ' + name.replace('.', '\\.') + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1045';
export const tests = ['release/I46'];
export const title = 'no workflow a stage runs creates an inline review thread, and the Intent and the control state that bot output is a comment or a check';
export async function run() {
  const dirs = [join(repo, '.github/workflows'), join(RM, '05-src/wiring/workflows')];
  const CALLS = /pulls\/[^\s'"]*\/comments|createReviewComment|create_review_comment|addPullRequestReviewThread|addPullRequestReviewComment|pulls\.createReview\b/;
  for (const d of dirs) {
    for (const f of readdirSync(d).filter((n) => /\.ya?ml$/.test(n))) {
      assert.doesNotMatch(readFileSync(join(d, f), 'utf8'), CALLS, `${f} creates an inline review thread`);
    }
  }
  const intent = readdirSync(join(RM, '01-intent')).find((n) => n.startsWith('I46-'));
  assert.ok(intent && existsSync(join(RM, '01-intent', intent, 'I46.md')), 'I46 is absent');
  assert.match(readFileSync(join(RM, '01-intent', intent, 'I46.md'), 'utf8').replace(/\s+/g, ' '), /plain comment or a check and never an inline review thread/, 'the Intent does not state the bot boundary');
  assert.match(readFileSync(join(RM, '04-controls/CTL10-approve-integration/CTL10.md'), 'utf8').replace(/\s+/g, ' '), /plain comment or a check and never an inline review thread/, 'the control does not state the bot boundary');
}
