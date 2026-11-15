// Case release/T443 tests: F23
import assert from 'node:assert/strict';
import { readTemplates } from '../../05-src/plan-body/templates.mjs';
import { verifyEnvelope, CUE } from '../../05-src/plan-body/envelope.mjs';
export const id = 'release/T443';
export const tests = ['release/F23'];
export const title = 'the envelope check requires the exact HOW TO WORK trailer as the final chapter';

const CHAPTERS = '## Change\n\nrelease/C1 x: y\n\n## From\n\na\n\n## To\n\nb\n\n## Because\n\nc';
const TRAILER = '## HOW TO WORK\n\nWork and review of a PLAN: engineering/a.md\nHOW TO WORK: engineering/HOW-TO-WORK.md';
const template = (trailer) => `<!-- KAAL-PR-template: PLAN -->\n${CUE}\n\n${CHAPTERS}\n\n${trailer}\n`;
export function run() {
  // The reader strips the trailer from the type's chapters and records its visible text.
  const read = readTemplates([{ path: '.github/PULL_REQUEST_TEMPLATE/plan.md', text: template(TRAILER) }]);
  assert.deepEqual(read.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the trailer is counted as a chapter of the type');
  assert.equal(read.trailers?.PLAN, TRAILER, 'the trailer text is not recorded');
  // The check requires the body to end with exactly that trailer.
  const check = (tail) => verifyEnvelope({ title: 'PLAN: x', body: `${CUE}\n\n${CHAPTERS}${tail}` }, read.registry, { trailers: read.trailers })
    .problems.filter((p) => /HOW TO WORK|chapters/.test(p));
  assert.deepEqual(check(`\n\n${TRAILER}`), [], 'the exact trailer is rejected');
  assert.ok(check('').length > 0, 'a missing trailer is accepted');
  assert.ok(check(`\n\n${TRAILER.replace('PLAN', 'DO')}`).length > 0, 'an altered trailer is accepted');
  assert.ok(check(`\n\n${TRAILER}\n\n${TRAILER}`).length > 0, 'a repeated trailer is accepted');
  assert.ok(check(`\n\n${TRAILER}\n\n## Because\n\nd`).length > 0, 'a non-final trailer is accepted');
}
