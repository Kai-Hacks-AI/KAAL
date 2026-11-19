// Case release/T1168 tests: release/F74
import assert from 'node:assert/strict';
import { text } from '../../03-architecture/A67-delivery-locations/fixtures.mjs';
export const id = 'release/T1168';
export const tests = ['release/F74'];
export const title = 'Pull Promotion spells no delivery root of its own, and its command composes the evidence from the declaration';
export async function run() {
  const d = JSON.parse(text('05-src/pull-promotion/declaration.json'));
  assert.doesNotMatch(d.evidence.do.join('\n'), /\.github|\.githooks|\.kaal|\.agents|\.claude/, 'evidence.do spells a delivery root');
  const run = text('05-src/pull-promotion/run.mjs').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
  assert.match(run, /from '\.\/delivery-evidence\.mjs'/);
  assert.match(run, /from '\.\.\/delivery\/locations\.mjs'/);
  assert.match(run, /withDelivery\(/);
}
