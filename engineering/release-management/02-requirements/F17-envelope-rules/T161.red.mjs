// Case release/T161 tests: F17
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const judge = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const id = 'release/T161';
export const tests = ['release/F17'];
export const title = 'a clean envelope passes and a wrong title, a contaminated title, a wrong route and a disagreeing or doubled Driven-by are each rejected';
export async function run() {
  const { verifyEnvelope } = await import(pathToFileURL(judge).href);
  const body = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const commit = (...trailers) => ({ subject: 'x', message: `x\n\n${trailers.map((t) => `Driven-by: ${t}`).join('\n')}\n` });
  const good = { title: 'PLAN: Create a sample', body, base: 'kaal/release/sample', head: 'claude/x', commits: [commit('release/C99')] };
  assert.equal(verifyEnvelope(good).ok, true, 'a clean envelope is rejected');
  const bad = (change) => verifyEnvelope({ ...good, ...change }).ok;
  assert.equal(bad({ title: 'Create a sample' }), false, 'a title without a TYPE is accepted');
  assert.equal(bad({ title: 'PLAN:' }), false, 'a title without a description is accepted');
  assert.equal(bad({ title: 'FIX: Create a sample' }), false, 'an unknown TYPE is accepted');
  assert.equal(bad({ title: 'PLAN: release/C99 Create a sample' }), false, 'a Change id in the title is accepted');
  assert.equal(bad({ title: 'PLAN: Create a sample, generated with Claude Code' }), false, 'attribution in the title is accepted');
  assert.equal(bad({ base: 'main' }), false, 'a PLAN into main is accepted');
  assert.equal(verifyEnvelope({ ...good, title: 'PROMOTION: Make it available', base: 'main', head: 'kaal/release/sample' }).ok, true, 'a promotion from a collector into main is rejected');
  assert.equal(verifyEnvelope({ ...good, title: 'PROMOTION: Make it available', base: 'kaal/x', head: 'kaal/release/sample' }).ok, false, 'a promotion into a collector is accepted');
  assert.equal(bad({ commits: [commit('release/C98')] }), false, 'a commit driven by another Change is accepted');
  assert.equal(bad({ commits: [commit('release/C99', 'release/C99')] }), false, 'two Driven-by trailers are accepted');
  assert.equal(bad({ commits: [{ subject: 'x', message: 'x\n' }] }), false, 'a commit without Driven-by is accepted');
  assert.equal(bad({ body: body + '\n---\nGenerated with Claude Code\n' }), false, 'a contaminated body is accepted');
}
