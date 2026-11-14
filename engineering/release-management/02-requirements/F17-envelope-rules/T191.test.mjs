// Case release/T191 tests: F17
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const judge = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const id = 'release/T191';
export const tests = ['release/F17'];
export const title = 'a pull request from a hotfix/ head must be a HOTFIX, a HOTFIX needs content in Defect, Urgency and Approach and a one-line Change, and what the envelope cannot show stays unjudged';
export async function run() {
  const { verifyEnvelope } = await import(pathToFileURL(judge).href);
  const registry = {
    PLAN: ['Change', 'From', 'To', 'Because'], DO: ['Change', 'Implement', 'Refactor'],
    HOTFIX: ['Change', 'Defect', 'Urgency', 'Approach'],
  };
  const body = (change, defect = 'It fails.', urgency = 'Now.', approach = 'Fix it.') => `## Change\n\n${change}\n\n## Defect\n\n${defect}\n\n## Urgency\n\n${urgency}\n\n## Approach\n\n${approach}\n`;
  const hotfix = { title: 'HOTFIX: Restore a sample', body: body('release/C99 sample'), base: 'main', head: 'hotfix/restore-sample' };

  // the head of a hotfix/ branch fixes the TYPE
  const doBody = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## Implement\n\nIt.\n\n## Refactor\n\nNone.\n';
  const wrong = verifyEnvelope({ title: 'DO: Do a sample', body: doBody, base: 'kaal/release/sample', head: 'hotfix/restore-sample', commits: [{ subject: 'x', message: 'x\n\nDriven-by: release/C99\n' }] }, registry);
  assert.equal(wrong.verdict, 'FAIL', 'a DO from a hotfix/ head is not a finding');
  assert.ok(wrong.problems.some((p) => /hotfix\//.test(p) && /HOTFIX/.test(p)), 'the finding does not name the hotfix/ head and the TYPE HOTFIX');
  assert.equal(verifyEnvelope({ ...hotfix, title: 'DEFAULT: Do a sample' }, { ...registry, DEFAULT: ['Change'] }).verdict, 'FAIL', 'a DEFAULT from a hotfix/ head is not a finding');
  assert.notEqual(verifyEnvelope(hotfix, registry).verdict, 'FAIL', 'a HOTFIX from a hotfix/ head is a finding');

  // the chapters need content
  for (const [name, args] of [['Defect', ['release/C99 sample', ' ']], ['Urgency', ['release/C99 sample', 'It fails.', '']], ['Approach', ['release/C99 sample', 'It fails.', 'Now.', '\n']]]) {
    const result = verifyEnvelope({ ...hotfix, body: body(...args) }, registry);
    assert.equal(result.verdict, 'FAIL', `an empty ${name} chapter of a HOTFIX is not a finding`);
    assert.ok(result.problems.some((p) => p.includes(name)), `the finding does not name the ${name} chapter`);
  }

  // the Change chapter is one line, id then name
  for (const change of ['release/C99', 'sample without an id', 'release/C99 sample\n\nrelease/C98 other']) {
    assert.equal(verifyEnvelope({ ...hotfix, body: body(change) }, registry).verdict, 'FAIL', `the Change chapter "${change}" is not a finding`);
  }
  // the whole line is judged, not its start: a name may have several words and nothing else
  for (const change of ['release/C99 sample: a description', 'release/C99 sample\tname', 'release/C99 sample  name', 'release/C99 sample\u200b', 'release/C99 **sample**', 'release/C99 <b>sample</b>', 'release/C99 sample\u0007', 'release/C99 [sample](x)', 'release/C99 -sample', 'release/C99  sample']) {
    const result = verifyEnvelope({ ...hotfix, body: body(change) }, registry);
    assert.equal(result.verdict, 'FAIL', `the Change line ${JSON.stringify(change)} is not a finding`);
  }
  for (const change of ['release/C99 check PR Envelope', "release/C99 maker's (v2) restore", 'release/C99 Restore 2-pass a/b & c+d', 'release/C99 Zażółć naïve']) {
    assert.equal(verifyEnvelope({ ...hotfix, body: body(change) }, registry).problems.length, 0, `the legitimate Change line ${JSON.stringify(change)} is a finding`);
  }
  assert.equal(verifyEnvelope(hotfix, registry).problems.length, 0, 'a well-formed HOTFIX has a finding');

  // what the envelope cannot show stays unjudged, and the verdict stays UNKNOWN
  const good = verifyEnvelope(hotfix, registry);
  assert.equal(good.verdict, 'UNKNOWN', 'a well-formed HOTFIX does not read UNKNOWN');
  for (const part of [/base/i, /only (its|the) defect|defect only|corrects only/i, /Defect.*(true|real)|Urgency/i]) {
    assert.ok(good.notJudged.some((n) => part.test(n)), `a HOTFIX result does not list under not judged: ${part}`);
  }
  assert.ok(!good.notJudged.some((n) => /Change chapter shape of HOTFIX has no row/.test(n)), 'the Change shape of a HOTFIX is still reported as having no row');
}
