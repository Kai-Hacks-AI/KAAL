// Case release/T933 tests: release/C99. Feature: the unresolved review-thread count survives, read from the route a cloud session offers.
import assert from 'node:assert/strict';
import { standIn } from './helper.mjs';
export const id = 'release/T933';
export const tests = ['release/C99'];
export const title = 'with the review-thread route answering, the report counts the unresolved threads of a piece and does not call the fact not observed';
export async function run() {
  const gh = standIn('cloud', 'route');
  try {
    const out = gh.show();
    assert.equal(out.status, 0, `the command did not print a report (${out.stderr.trim()})`);
    assert.match(out.stdout, /^#7 .*WORK.*1 unresolved thread\b/m, 'piece #7 does not show its one unresolved thread');
    const eight = out.stdout.split('\n').find((line) => line.startsWith('#8 ')) ?? '';
    assert.ok(eight && !/not observed/.test(eight), `piece #8 says a fact was not observed: ${eight}`);
  } finally {
    gh.cleanup();
  }
}
