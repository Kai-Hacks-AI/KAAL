// Case release/T52 tests: F3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const read = (p, what) => { assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
const checker = join(cap, '05-src/plan-body/check.mjs');
export const id = 'release/T52';
export const tests = ['release/F3'];
export const title = 'the PLAN body contract accepts four chapters with a complete Change and rejects extra chapters, a wrong order and a Change without id, name or a non-redundant description';
export async function run() {
  assert.ok(existsSync(checker), 'the body checker is absent');
  const { checkPlanBody } = await import(pathToFileURL(checker).href);
  const body = (change, from = 'PLANs are written ad hoc.', to = 'PLANs have one fixed structure.', because = 'Reviewers judge a PLAN sooner.') =>
    `## Change\n\n${change}\n\n## From\n\n${from}\n\n## To\n\n${to}\n\n## Because\n\n${because}\n`;
  const good = body('release/C3 create Plan: how a PLAN is written and handed on');
  assert.equal(checkPlanBody(good).ok, true, 'a complete body is rejected');
  assert.equal(checkPlanBody(good + '\n## Notes\n\nextra\n').ok, false, 'an extra chapter is accepted');
  assert.equal(checkPlanBody(good.replace('## From', '## Before')).ok, false, 'a renamed chapter is accepted');
  const swapped = good.replace('## From', '## TMP').replace('## To', '## From').replace('## TMP', '## To');
  assert.equal(checkPlanBody(swapped).ok, false, 'chapters in the wrong order are accepted');
  assert.equal(checkPlanBody(body('create Plan: how a PLAN is written')).ok, false, 'a Change without an id is accepted');
  assert.equal(checkPlanBody(body('release/C3: how a PLAN is written')).ok, false, 'a Change without a name is accepted');
  assert.equal(checkPlanBody(body('release/C3 create Plan')).ok, false, 'a Change without a description is accepted');
  assert.equal(checkPlanBody(body('release/C3 create Plan: PLANs are written ad hoc.')).ok, false, 'a description that repeats From is accepted');
}
