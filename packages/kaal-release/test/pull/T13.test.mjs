// Case pull/T13 tests: pull/F2, pull/F4 to pull/F11 on REAL recorded evidence
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { declaration, flow, judgment, pullPromotion, snapshotPath } from './fixtures.mjs';
export const id = 'pull/T13';
export const tests = ['pull/F2', 'pull/F4', 'pull/F5', 'pull/F6', 'pull/F7', 'pull/F8', 'pull/F9', 'pull/F10'];
export const title = 'the real collector kaal/release/wire-fallback-template, as the repository showed it on 12 Nov 2026, is BLOCKED: its one Change, a legacy record, has not completed its lifecycle in the collector (only the DO landed there), and Release\'s Branching check is red; every other judgment passes';
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

  // the consumer's declaration (KAAL's; the Owner keeps analyze Vulnerabilities and CodeQL evidence in Release for now, 12 Nov)
  const decl = declaration({
    promotions: [{ collector: 'kaal/release/wire-promotion', change: 'release/C10' }, { collector: name, change: 'release/C14' }],
    holds: [{ target: '#1461', reason: 'the Owner order: C14 has no promotion go yet' }],
  }, {
    owners: { lifecycle: 'Change', verification: 'Testing', protection: 'Guard', sequencing: 'Release', validation: 'Review', attribution: 'Engineering adapter' },
    lifecycle: ['PLAN', 'DO', 'ACT'],
    dependencies: [],
    // release/C14 and release/C10 predate the rule of 12 Nov that a Change lives in one collector: their records are legacy, never retroactively compliant
    legacy: [
      { change: 'release/C14', reason: 'predates the one-collector rule: its PLAN is in kaal/release/fallback-template and its DO here' },
      { change: 'release/C10', reason: 'predates the one-collector rule: its .github half and its engineering half travelled as a pair of promotions' },
    ],
    checkOwners: {
      'Branching': 'sequencing', 'Promotion Source': 'sequencing', 'Change Isolation': 'lifecycle', 'Change Isolation (review)': 'validation',
      'Acceptance': 'verification', 'Acceptance (Windows)': 'verification', 'Acceptance (macOS)': 'verification', 'Engineering': 'verification', 'Workspaces': 'verification',
      'Hosting (Linux)': 'verification', 'Hosting (Windows)': 'verification', 'Hosting (macOS)': 'verification',
      'Guard': 'protection', 'Guard (Windows)': 'protection', 'Guard (macOS)': 'protection',
      'CodeQL': 'sequencing', 'CodeQL (actions)': 'sequencing', 'CodeQL (javascript-typescript)': 'sequencing', 'Dependency Review': 'sequencing',
    },
  });
  // the lane is the Owner's standing order (C10 first), recorded; it is not computed here
  const result = await pullPromotion(snapshot.facts, decl, flow({ lane: { active: 'kaal/release/wire-promotion' } }), name);

  assert.equal(result.collector, name);
  assert.equal(result.verdict, 'BLOCKED', 'the real collector is promotable');

  // the one Change in the collector has not completed its lifecycle THERE: only its DO landed; its PLAN is in another collector and no ACT exists, and neither is borrowed
  const lifecycle = judgment(result, 'lifecycle');
  assert.equal(lifecycle.status, 'FAIL');
  assert.equal(lifecycle.owner, 'Change');
  assert.deepEqual(result.changes.map((c) => c.id), ['release/C14']);
  assert.equal(result.changes[0].status, 'incomplete');
  assert.deepEqual(result.changes[0].missing, ['ACT', 'PLAN'], 'the lifecycle gaps of the Change are not named');
  assert.equal(result.changes[0].legacy, true, 'the legacy record is not identified');
  assert.match(result.changes[0].legacyReason, /one-collector rule/);

  // Release's red Branching check, traced to its owner, from the conclusion only
  const sequencing = judgment(result, 'sequencing');
  assert.equal(sequencing.status, 'FAIL');
  assert.equal(sequencing.owner, 'Release', 'the red check is not traced to the control that owns it');
  assert.deepEqual(sequencing.evidence, ['Branching'], 'the evidence is not the one red check');
  assert.ok(!/auto-merge|merge method/i.test(JSON.stringify(result)), 'the Script claims a cause that only the check log holds');
  for (const id of ['verification', 'protection', 'validation', 'attribution']) assert.equal(judgment(result, id).status, 'PASS', `${id} does not pass on the real evidence`);

  // not the lane's turn, and an Owner hold: the recommendation is the owner's, nothing is executed
  assert.equal(result.turn.status, 'waiting');
  assert.equal(result.next.status, 'escalate');
  assert.equal(result.next.authority, 'owner');
  assert.equal(result.next.target, '#1461');
  assert.match(result.next.reason, /no promotion go/);

  // what the snapshot cannot show is reported, never filled in
  assert.ok(result.notJudged.some((n) => /#1447/.test(JSON.stringify(n))), 'the unread PLAN piece is not reported');
}
