// Case release/T1158 tests: release/F70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, WIRE, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1158';
export const tests = ['release/F70'];
export const title = "the raise accepts a collector, a hotfix branch and a wire branch as head, and no other branch";
export async function run() {
  const { readDecision } = await load('raise.mjs');
  const d = (head) => ({ action: 'raise', head, base: 'main', revision: 'f'.repeat(40), title: 'PROMOTION: x', body: '## Change\n\nx\n' });
  for (const head of ['kaal/release/some-thing', 'hotfix/the-fix', 'wire/the-copy']) assert.equal(readDecision(d(head)).ok, true, head + ' is accepted');
  for (const head of ['main', 'kaal/release', 'kaal/a/b/c', 'hotfix/a/b', 'hotfix/', 'wire/A', 'wire/x y', 'claude/x', 'feature/x', 'refs/heads/wire/x', 'wire/x\n']) assert.equal(readDecision(d(head)).ok, false, head + ' is refused');
  assert.equal(readDecision({ ...d('wire/the-copy'), title: 'x' }).ok, false, 'the title rule is unchanged');
  assert.equal(readDecision({ ...d('wire/the-copy'), base: 'wire/y' }).ok, false, 'the base is main');
  assert.equal(readDecision({ ...d('wire/the-copy'), revision: 'abc' }).ok, false, 'the revision is a commit');
}
