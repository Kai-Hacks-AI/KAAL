// Case release/T1147 tests: release/F69
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, loadDraft, green, facts, NOW } from '../../03-architecture/A64-verdict-from-evidence/fixtures.mjs';
export const id = 'release/T1147';
export const tests = ['release/F69'];
export const title = "readiness follows test evidence: RED means not ready, ACT before GREEN is reported, UNKNOWN never passes";
export async function run() {
  const { verdict, readiness } = await loadDraft('verdict.mjs');
  const CH = 'engineering/release-management/00-changes/C99-small/';
  const red = 'engineering/release-management/02-requirements/F1-x/T2.red.mjs';
  // The newest merge being an ACT proves nothing.
  const merged = [{ number: 7, title: 'ACT: small, 4L retrospective (release/C99)', body: '## Change\n\nrelease/C99\n' }];
  const r1 = verdict(facts({ merged, files: [CH + 'C99.md', CH + 'change.md', red] }), NOW);
  assert.equal(r1.verdict, 'not-ready');
  assert.match(r1.reason, /RED/);
  const r2 = verdict(facts({ merged: [], files: green }), NOW);
  assert.equal(r2.verdict, 'raisable');
  assert.equal(r2.title, 'PROMOTION: release/C99 (kaal/release/small-thing)');
  assert.ok(r2.body.startsWith('## Change\n\nrelease/C99\n'));
  const early = verdict(facts({ files: [...green, red] }), NOW);
  assert.equal(early.verdict, 'not-ready');
  assert.equal(early.reason, 'act-before-green');
  const pending = verdict(facts({ files: [CH + 'C99.md', 'x/T1.test.mjs'] }), NOW);
  assert.equal(pending.verdict, 'not-ready');
  assert.match(pending.reason, /act pending/);
  assert.equal(verdict(facts({ filesComplete: false }), NOW).verdict, 'unknown');
  assert.equal(readiness({ files: green, complete: undefined }).state, 'unknown');
  assert.equal(readiness({ files: green, complete: true }).state, 'ready');
}
