// Case pull/T13 tests: pull/F2, pull/F4 to pull/F11 on REAL recorded evidence
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { declaration, flow, judgment, pullPromotion, snapshotPath } from './fixtures.mjs';
export const id = 'pull/T13';
export const tests = ['pull/F2', 'pull/F4', 'pull/F5', 'pull/F6', 'pull/F7', 'pull/F8', 'pull/F9', 'pull/F10'];
export const title = 'the real collector kaal/release/wire-fallback-template, as the repository showed it on 12 Nov 2026, is BLOCKED by Release\'s Branching check; every other judgment passes, and the Change is incomplete without blocking its increment';
export async function run() {
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  const name = snapshot.collector;

  // the snapshot is what the host showed: the newest run of each check name is what the facts keep
  const newest = new Map();
  for (const r of snapshot.raw.checkRuns) if (!newest.has(r.name) || r.startedAt > newest.get(r.name).startedAt) newest.set(r.name, r);
  const promotionPiece = snapshot.facts.pieces.find((p) => p.type === 'PROMOTION');
  const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  assert.deepEqual([...promotionPiece.checks].sort(byName), [...newest.values()].map((r) => ({ name: r.name, conclusion: r.conclusion })).sort(byName), 'the facts do not hold the newest run of each check');
  assert.equal(snapshot.raw.checkRuns.filter((r) => r.name === 'Branching').length, 4, 'the snapshot lost the Branching runs');

  // the consumer's declaration (KAAL's, candidate allocation): who owns which check, what the increment carries, the Owner's hold
  const decl = declaration({
    promotions: [{ collector: 'kaal/release/wire-promotion', change: 'release/C10' }, { collector: name, change: 'release/C14' }],
    holds: [{ target: '#1461', reason: 'the Owner order: C14 has no promotion go yet' }],
  }, {
    owners: { increment: 'Change', verification: 'Testing', protection: 'Guard', sequencing: 'Release', validation: 'Review', attribution: 'Engineering adapter' },
    increments: [{ collector: name, change: 'release/C14', carries: ['DO'] }],
    changes: [{ id: 'release/C14', onTarget: ['PLAN', 'DO', 'ACT'] }],
    checkOwners: {
      'Branching': 'sequencing', 'Promotion Source': 'sequencing', 'Change Isolation': 'increment', 'Change Isolation (review)': 'validation',
      'Acceptance': 'verification', 'Acceptance (Windows)': 'verification', 'Acceptance (macOS)': 'verification', 'Engineering': 'verification', 'Workspaces': 'verification',
      'Hosting (Linux)': 'verification', 'Hosting (Windows)': 'verification', 'Hosting (macOS)': 'verification',
      'Guard': 'protection', 'Guard (Windows)': 'protection', 'Guard (macOS)': 'protection', 'CodeQL': 'protection', 'CodeQL (actions)': 'protection', 'CodeQL (javascript-typescript)': 'protection', 'Dependency Review': 'protection',
    },
  });
  // the lane is the Owner's standing order (C10 first), recorded; it is not computed here
  const result = await pullPromotion(snapshot.facts, decl, flow({ lane: { active: 'kaal/release/wire-promotion' } }), name);

  assert.equal(result.collector, name);
  assert.equal(result.verdict, 'BLOCKED', 'the red Branching check of the real promotion does not block');
  const sequencing = judgment(result, 'sequencing');
  assert.equal(sequencing.status, 'FAIL');
  assert.equal(sequencing.owner, 'Release', 'the red check is not traced to the control that owns it');
  assert.deepEqual(sequencing.evidence, ['Branching'], 'the evidence is not the one red check');
  assert.ok(!/auto-merge|merge method/i.test(JSON.stringify(result)), 'the Script claims a cause that only the check log holds');
  for (const id of ['increment', 'verification', 'protection', 'validation', 'attribution']) assert.equal(judgment(result, id).status, 'PASS', `${id} does not pass on the real evidence`);
  assert.equal(result.increment.landed.join(), '#1458', 'the increment is not the one landed DO');

  // three statements, three answers: the Change is incomplete on the target, its increment is complete, the collector is blocked
  assert.equal(result.change.status, 'incomplete');
  assert.deepEqual(result.change.missing, ['ACT', 'DO', 'PLAN']);

  // not the lane's turn, and an Owner hold: the recommendation is the owner's, nothing is executed
  assert.equal(result.turn.status, 'waiting');
  assert.equal(result.next.status, 'escalate');
  assert.equal(result.next.authority, 'owner');
  assert.equal(result.next.target, '#1461');
  assert.match(result.next.reason, /no promotion go/);

  // what the snapshot cannot show is reported, never filled in
  assert.ok(result.notJudged.some((n) => /#1447/.test(JSON.stringify(n))), 'the unread PLAN piece is not reported');
}
