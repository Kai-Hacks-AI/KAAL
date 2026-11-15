// Case release/T106 tests: F13
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const checker = join(repo, 'engineering/release-management/05-src/plan-body/verify.mjs');
export const id = 'release/T106';
export const tests = ['release/F13'];
export const title = 'a clean PLAN body passes and the contamination seen on #1406, #1407 and #1411 is rejected, including a hidden metadata comment';
export async function run() {
  const { verifyBody: checkPlanBody } = await import(pathToFileURL(checker).href);
  const clean = '## Change\n\nrelease/C8 check PR Body: find contamination in a PLAN body.\n\n## From\n\nThe body is only required to be text.\n\n## To\n\nContamination of the body is found and named.\n\n## Because\n\nReviewers stop correcting bodies by hand.\n';
  const hidden = '<!-- claude-projects-attribution: {"github_login":"someone"} -->\n';
  const requested = '_Requested by **Someone** · [project thread](https://claude.ai/code/project/x?thread=y)_\n\n';
  const footer = '\n---\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nhttps://claude.ai/code/session_x\n';
  assert.equal(checkPlanBody(clean).ok, true, 'a clean body is rejected');
  assert.equal(checkPlanBody(clean.replace('## Because\n\nReviewers stop correcting bodies by hand.', '## Because\n\n<!-- one hint -->\nReviewers stop correcting bodies by hand.')).ok, true, 'a template hint inside a chapter is rejected');
  assert.equal(checkPlanBody(hidden + requested + clean).ok, false, '#1406: attribution before the first chapter is accepted');
  assert.equal(checkPlanBody(hidden + clean).ok, false, 'a hidden attribution comment alone is accepted');
  assert.equal(checkPlanBody(clean + footer).ok, false, '#1407, #1411: a generated footer is accepted');
  assert.equal(checkPlanBody(clean + '<!-- session: x -->\n').ok, false, 'a metadata comment after the last chapter is accepted');
}
