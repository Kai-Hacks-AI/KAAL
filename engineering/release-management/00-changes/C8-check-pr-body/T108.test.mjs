// Case release/T108 tests: G34
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
export const id = 'release/T108';
export const tests = ['release/G34'];
export const title = 'gap release/G34 is closed: F13 is present, a hidden comment is found and the check runs by hand';
export async function run() {
  assert.ok(existsSync(join(cap, '02-requirements/F13-body-contamination/F13.md')), 'F13 is absent');
  assert.ok(existsSync(join(cap, '05-src/plan-body/verify.mjs')), 'the runner is absent');
  const { verifyBody: checkPlanBody } = await import(pathToFileURL(join(cap, '05-src/plan-body/verify.mjs')).href);
  const body = '<!-- claude-projects-attribution: {} -->\n## Change\n\nrelease/C8 x: y z.\n\n## From\n\na\n\n## To\n\nb\n\n## Because\n\nc\n';
  assert.equal(checkPlanBody(body).ok, false, 'a hidden attribution comment is accepted');
}
