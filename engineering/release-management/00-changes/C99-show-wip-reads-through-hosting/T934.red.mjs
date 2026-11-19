// Case release/T934 tests: release/C99. Feature: where no route gives the thread state, the fact is not observed, never guessed as zero.
import assert from 'node:assert/strict';
import { standIn } from './helper.mjs';
export const id = 'release/T934';
export const tests = ['release/C99'];
export const title = 'with no review-thread route, the report lists threads as not observed for every piece and never as zero unresolved';
export async function run() {
  const gh = standIn('cloud', 'absent');
  try {
    const out = gh.show();
    assert.equal(out.status, 0, `the command did not print a report (${out.stderr.trim()})`);
    for (const n of [7, 8]) {
      const line = out.stdout.split('\n').find((l) => l.startsWith(`#${n} `)) ?? '';
      assert.match(line, /not observed: .*threads/, `piece #${n} does not list threads as not observed: ${line}`);
    }
    assert.ok(!/0 unresolved/.test(out.stdout), 'a thread count of zero was guessed');
  } finally {
    gh.cleanup();
  }
}
