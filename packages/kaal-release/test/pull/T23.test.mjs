// Case pull/T23 tests: pull/F21, pull/F22 on REAL recorded evidence
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { snapshotPath, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T23';
export const tests = ['pull/F21', 'pull/F22'];
export const title = 'the real collector kaal/release/wire-fallback-template, as the repository showed it on 12 Nov 2026, does not qualify: its Change release/C14 has only the DO landed in it, and the Script names the missing PLAN and ACT';
export async function run() {
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  const name = snapshot.collector;
  const promotion = snapshot.facts.pieces.find((p) => p.type === 'PROMOTION');
  assert.ok(promotion && Array.isArray(promotion.checks) && promotion.checks.length > 0, 'the recording lost the checks of the promotion');
  // v1 reads the checks of the collector head; the recording holds them on the promotion of that head
  const facts = { collectors: snapshot.facts.collectors.map((c) => (c.name === name ? { ...c, checks: promotion.checks } : c)), pieces: snapshot.facts.pieces.filter((p) => p.type !== 'PROMOTION'), deliveries: snapshot.facts.deliveries };
  const declaration = {
    collectors: [{ name }],
    lifecycle: ['PLAN', 'DO', 'ACT'],
    checks: ['Acceptance', 'Acceptance (Windows)', 'Acceptance (macOS)', 'Engineering', 'Workspaces', 'Hosting (Linux)', 'Hosting (Windows)', 'Hosting (macOS)', 'Guard', 'Guard (Windows)', 'Guard (macOS)'],
  };
  const result = await walkCollectors(facts, declaration);
  const entry = result.collectors[0];
  assert.equal(entry.name, name);
  assert.equal(entry.status, 'does not qualify', 'the recorded collector qualified');
  assert.deepEqual(result.qualifiers, []);
  assert.ok(entry.missing.some((m) => /PLAN/.test(m) && /release\/C14/.test(m)), 'the missing PLAN of release/C14 is not named');
  assert.ok(entry.missing.some((m) => /ACT/.test(m) && /release\/C14/.test(m)), 'the missing ACT of release/C14 is not named');
  assert.ok(!entry.missing.some((m) => /Acceptance|Guard|Engineering|Workspaces|Hosting/.test(m)), 'a green Check check was reported as missing');
}
