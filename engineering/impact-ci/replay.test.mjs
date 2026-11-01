import { test } from 'node:test';
import assert from 'node:assert/strict';
import captured from './fixtures/pr773-actions.json' with { type: 'json' };
import { fixture, snapshot, time } from './full-fixtures.mjs';
import { establishFullMatrix } from './full-policy.mjs';
import { replayActions } from './replay.mjs';
const headSha = captured.headSha;
function authority() {
  const f = fixture();
  return establishFullMatrix({ ...f.context, headSha, parents: [f.context.baseSha, headSha],
    pr: 773, startedAt: time }, snapshot());
}
test('#773 cannot be full-matrix green at its recorded merge instant', () => {
  const r = replayActions(authority(), captured, Date.parse(captured.mergedAt));
  assert.equal(r.verdict, 'unresolved');
  assert.equal(r.completionReady, false);
  assert.ok(r.incomplete.some(j => j.check === 'Guard (Windows)' && j.state === 'in_progress'));
  assert.ok(r.incomplete.some(j => j.check === 'Guard'));
  assert.ok(r.incomplete.some(j => j.check === 'Acceptance'));
  assert.ok(r.findings.some(s => s.includes('duplicate workflow')));
});
test('later completion cannot fill absent raw provenance with invented fixture attestations', () => {
  const r = replayActions(authority(), captured, Date.parse('2026-11-01T12:00:00Z'));
  assert.equal(r.verdict, 'unresolved');
  assert.ok(r.findings.some(s => s.includes('revision')));
  assert.equal(r.ledger.filter(j => j.check === 'Guard (Windows)').length, 2);
});
test('a captured full page declaring further pages stays unresolved', () => {
  const c = structuredClone(captured); c.captures[0].jobs.total_count = 101;
  assert.ok(replayActions(authority(), c, Date.now()).findings.some(s => s.includes('pagination')));
});
test('another candidate head cannot borrow #773 history', () => {
  const f = fixture();
  assert.equal(replayActions(f.authority, captured, Date.now()).ledger.length, 0);
});
