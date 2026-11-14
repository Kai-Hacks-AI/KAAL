// Case release/T199 tests: G56
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const id = 'release/T199';
export const tests = ['release/G56'];
export const title = 'gap release/G56 is closed: the envelope check accepts exactly the cue before the first chapter and rejects any other text there';
const facts = (body) => ({ title: 'DO: add a thing', body, base: 'kaal/release/x', head: 'claude/x', commits: [], registry: { DO: ['Change', 'Implement', 'Refactor'] } });
const chapters = '## Change\n\nrelease/C24 envelope cue: the cue.\n\n## Implement\n\nIt.\n\n## Refactor\n\nNone.\n';
export async function run() {
  const mod = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs')).href);
  assert.equal(typeof mod.verifyEnvelope, 'function', 'the envelope judge is not exported');
  const judge = (f) => mod.verifyEnvelope(f, f.registry);
  const text = (result) => JSON.stringify(result);
  assert.doesNotMatch(text(judge(facts(`${CUE}\n\n${chapters}`))), /text before the first chapter/, 'the exact cue is rejected before the first chapter');
  const plan = { title: 'PLAN: add a thing', body: `${CUE}\n\n## Change\n\nrelease/C24 envelope cue: the cue.\n\n## From\n\nNo cue.\n\n## To\n\nA cue.\n\n## Because\n\nReaders find the files.\n`, base: 'kaal/release/x', head: 'claude/x', commits: [], registry: { PLAN: ['Change', 'From', 'To', 'Because'] } };
  assert.equal(text(judge(plan)).includes('before the first'), false, 'the exact cue is rejected before the first chapter of a PLAN');
  assert.match(text(judge(facts(`${CUE} Extra words.\n\n${chapters}`))), /text before the first chapter/, 'a changed cue is accepted');
  assert.match(text(judge(facts(`Some note.\n\n${chapters}`))), /text before the first chapter/, 'other text before the first chapter is accepted');
  assert.match(text(judge(facts(`${CUE}\n\nSome note.\n\n${chapters}`))), /text before the first chapter/, 'text beside the cue is accepted');
}
