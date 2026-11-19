// Case release/T930 tests: release/C99. Feature: Show WIP runs where GitHub GraphQL is refused.
import assert from 'node:assert/strict';
import { standIn } from './helper.mjs';
export const id = 'release/T930';
export const tests = ['release/C99'];
export const title = 'Show WIP prints its report in a session where GitHub GraphQL is refused, and never asks GraphQL';
export async function run() {
  const gh = standIn('cloud');
  try {
    const out = gh.show();
    assert.equal(out.status, 0, `the command did not print a report (${out.stderr.trim()})`);
    assert.match(out.stdout, /^#7 /m, 'piece #7 is not in the report');
    assert.match(out.stdout, /^#8 /m, 'piece #8 is not in the report');
    assert.ok(!gh.calls().some((args) => args.includes('graphql')), 'the command asked GraphQL');
  } finally {
    gh.cleanup();
  }
}
