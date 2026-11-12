// Case release/T161 tests: F17
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const judge = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const id = 'release/T161';
export const tests = ['release/F17'];
export const title = 'the shared rules, the structure of a declared template and the rows keyed by TYPE are each judged; an unsupported TYPE is reported, never fully judged; no TYPE is listed by the judge';
export async function run() {
  const { verifyEnvelope } = await import(pathToFileURL(judge).href);
  const registry = {
    PLAN: ['Change', 'From', 'To', 'Because'], DO: ['Change', 'Implement', 'Refactor'], ACT: ['Change', 'Records'],
    SYNC: ['Change', 'Reason'], PROMOTION: ['Change', 'Why now'], HOTFIX: ['Change', 'Defect', 'Urgency', 'Approach'],
  };
  const body = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const commit = (...trailers) => ({ subject: 'x', message: `x\n\n${trailers.map((t) => `Driven-by: ${t}`).join('\n')}\n` });
  const good = { title: 'PLAN: Create a sample', body, base: 'kaal/release/sample', head: 'claude/x', commits: [commit('release/C99')] };
  const run = (change, reg = registry) => verifyEnvelope({ ...good, ...change }, reg);
  const bad = (change, reg) => run(change, reg).ok;

  // shared rules
  assert.equal(run({}).ok, true, 'a clean envelope is rejected');
  assert.equal(bad({ title: 'Create a sample' }), false, 'a title without a TYPE is accepted');
  assert.equal(bad({ title: 'PLAN:' }), false, 'a title without a description is accepted');
  assert.equal(bad({ title: 'PLAN: release/C99 Create a sample' }), false, 'a Change id in the title is accepted');
  assert.equal(bad({ title: 'PLAN: Create a sample, generated with Claude Code' }), false, 'attribution in the title is accepted');
  assert.equal(bad({ body: body + '\n---\nGenerated with Claude Code\n' }), false, 'a footer is accepted');
  assert.equal(bad({ body: '<!-- claude-projects-attribution: {} -->\n' + body }), false, 'a hidden attribution comment is accepted');
  assert.equal(bad({ body: '<!-- KAAL-PR-template: PLAN -->\n' + body }), false, 'a template declaration in the body is accepted');
  assert.equal(bad({ body: body.replace('## Because\n\nIt helps.', '## Because\n\n<!-- KAAL-PR-template: PLAN -->\nIt helps.') }), false, 'a template declaration inside a chapter is accepted');

  // structure derived from the declared template, for a type the judge does not name
  const doBody = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## Implement\n\nBuilt it.\n\n## Refactor\n\nNothing.\n';
  const doFacts = { title: 'DO: Deliver a sample', body: doBody };
  assert.equal(run(doFacts).ok, true, 'a DO body with the chapters of its template is rejected');
  assert.equal(bad({ ...doFacts, body: doBody.replace('## Refactor', '## Cleanup') }), false, 'a chapter that is not in the template is accepted');
  assert.equal(bad({ ...doFacts, body: doBody.replace('\n## Refactor\n\nNothing.\n', '') }), false, 'a missing chapter is accepted');
  assert.equal(bad({ title: 'PLAN: Create a sample', body: doBody }), false, 'the chapters of a DO are accepted for a PLAN');
  const extended = { ...registry, REVERT: ['Change', 'Reverted', 'Why'] };
  assert.equal(bad({ title: 'REVERT: Undo a sample', body: '## Change\n\nrelease/C99 sample\n\n## Reverted\n\nIt.\n\n## Why\n\nBecause.\n' }, extended), true, 'a type added as a template row is rejected');

  // an unsupported TYPE
  const unknown = run({ title: 'REVERT: Undo a sample', body: doBody });
  assert.equal(unknown.ok, true, 'a clean body under an unsupported TYPE is rejected for being unsupported');
  assert.ok(unknown.notJudged?.some((note) => /REVERT/.test(note) && /unsupported/i.test(note)), 'an unsupported TYPE is not reported');
  assert.equal(bad({ title: 'REVERT: Undo a sample', body: doBody + '\n---\nGenerated with Claude Code\n' }), false, 'the shared rules are not applied to an unsupported TYPE');

  // rows keyed by TYPE
  assert.equal(bad({ body: body.replace('release/C99 sample: a sample Change.', 'release/C99 sample') }), false, 'a PLAN Change line without a description is accepted');
  const shapes = {
    SYNC: '## Change\n\nrelease/C99 sample\n\n## Reason\n\nMain moved.\n',
    HOTFIX: '## Change\n\nrelease/C99 sample\n\n## Defect\n\nIt fails.\n\n## Urgency\n\nNow.\n\n## Approach\n\nFix it.\n',
    PROMOTION: '## Change\n\nrelease/C99 sample, PLAN DO ACT\nrelease/C98 other, PLAN DO\n\n## Why now\n\nReady.\n',
  };
  for (const [type, shape] of Object.entries(shapes)) {
    const promotion = type === 'PROMOTION';
    const result = run({ title: `${type}: Do a sample`, body: shape, base: promotion ? 'main' : 'kaal/release/sample', head: promotion ? 'kaal/release/sample' : 'claude/x' });
    assert.equal(result.ok, true, `a valid ${type} body is rejected for lacking a description or phases`);
  }

  // route
  assert.equal(bad({ base: 'main' }), false, 'a PLAN into main is accepted');
  assert.equal(run({ title: 'PROMOTION: Make it available', body: shapes.PROMOTION, base: 'main', head: 'kaal/release/sample' }).ok, true, 'a promotion from a collector into main is rejected');
  assert.equal(bad({ title: 'PROMOTION: Make it available', body: shapes.PROMOTION, base: 'kaal/x', head: 'kaal/release/sample' }), false, 'a promotion into a collector is accepted');
  const hotfix = run({ title: 'HOTFIX: Restore a sample', body: shapes.HOTFIX, base: 'main', head: 'claude/x' });
  assert.equal(hotfix.ok, true, 'a HOTFIX route is judged');
  assert.ok(hotfix.notJudged?.some((note) => /HOTFIX/.test(note) && /route/i.test(note)), 'the missing HOTFIX route row is not reported');

  // Change identity
  assert.equal(bad({ commits: [commit('release/C98')] }), false, 'a commit driven by another Change is accepted');
  assert.equal(bad({ commits: [commit('release/C99', 'release/C99')] }), false, 'two Driven-by trailers are accepted');
  assert.equal(bad({ commits: [{ subject: 'x', message: 'x\n' }] }), false, 'a commit without Driven-by is accepted');
  assert.equal(run({ title: 'SYNC: Prepare a sample', body: shapes.SYNC, commits: [commit('release/C1', 'release/C2')] }).ok, true, 'Driven-by agreement is judged for a SYNC');
}
