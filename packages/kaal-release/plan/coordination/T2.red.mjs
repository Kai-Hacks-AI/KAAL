// Case coordination/T2 tests: F5
import assert from 'node:assert/strict';
import { byTarget, analyzeFlow, declaration, facts, piece } from './fixtures.mjs';
const pending = { name: 'build', conclusion: 'pending' };
export const id = 'coordination/T2';
export const tests = ['coordination/F5'];
export const title = 'a piece whose version moved after its approval is REVIEW, naming both commits; approved at the current version with landing on approval off is LAND';
export async function run() {
  const moved = piece(10, { at: 'new', review: { state: 'approved', at: 'old' }, landsOnApproval: false });
  const result = await analyzeFlow(facts({ collectors: [], pieces: [moved] }), declaration({ promotions: [] }));
  const entries = result.actions.filter((a) => a.target === '#10');
  assert.equal(entries.length, 1, 'the piece does not yield exactly one entry');
  assert.equal(entries[0].action, 'REVIEW', 'an approval at an older version is accepted');
  assert.equal(entries[0].authority, 'reviewer', 'the review is not the reviewer\'s');
  const evidence = JSON.stringify(entries[0].evidence);
  assert.match(evidence, /old/, 'the commit that was approved is not shown');
  assert.match(evidence, /new/, 'the current version is not shown');

  const current = piece(11, { landsOnApproval: false });
  const again = await analyzeFlow(facts({ collectors: [], pieces: [current] }), declaration({ promotions: [] }));
  assert.equal(byTarget(again, '#11')?.action, 'LAND', 'an approval at the current version with landing on approval off does not yield LAND');
  assert.equal(byTarget(again, '#11')?.authority, 'author');

  const running = piece(12, { checks: [pending] });
  const waiting = await analyzeFlow(facts({ collectors: [], pieces: [running] }), declaration({ promotions: [] }));
  assert.equal(byTarget(waiting, '#12')?.action, 'WAIT', 'an approved piece with a CHECK still running does not WAIT');
  assert.match(String(byTarget(waiting, '#12')?.dependency), /CHECK/, 'the wait does not name the CHECK');
}
