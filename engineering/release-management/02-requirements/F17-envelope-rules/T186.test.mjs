// Case release/T186 tests: F17
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const src = join(repo, 'engineering/release-management/05-src/plan-body');
export const id = 'release/T186';
export const tests = ['release/F17'];
export const title = 'a title DEFAULT: <description> is judged by the DEFAULT chapters like any registered TYPE; a specialized TYPE is never judged by them; without a DEFAULT template the TYPE is unsupported';
export async function run() {
  const { readTemplates } = await import(pathToFileURL(join(src, 'templates.mjs')).href);
  const { verifyEnvelope } = await import(pathToFileURL(join(src, 'envelope.mjs')).href);
  const chapters = (names) => names.map((c) => `## ${c}\n\n<!-- a hint -->\n`).join('\n');
  const files = [
    { path: '.github/pull_request_template.md', text: `<!-- KAAL-PR-template: DEFAULT -->\n\n${chapters(['Change', 'Because'])}` },
    { path: '.github/PULL_REQUEST_TEMPLATE/plan.md', text: `<!-- KAAL-PR-template: PLAN -->\n\n${chapters(['Change', 'From', 'To', 'Because'])}` },
  ];
  const { registry } = readTemplates(files);
  const defaultBody = '## Change\n\nSpelling of the readme.\n\n## Because\n\nIt reads better.\n';
  const planBody = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const facts = { title: 'DEFAULT: Fix the spelling of the readme', body: defaultBody, base: 'main', head: 'claude/x' };

  const judged = verifyEnvelope(facts, registry);
  assert.equal(judged.ok, true, 'a DEFAULT title with the DEFAULT chapters is rejected');
  assert.equal(judged.complete, false, 'a DEFAULT pull request is reported as completely judged');
  assert.ok(judged.notJudged.some((n) => /route/i.test(n) && /DEFAULT/.test(n)), 'the missing DEFAULT route row is not reported');
  assert.ok(judged.notJudged.some((n) => /identity/i.test(n) && /DEFAULT/.test(n)), 'the missing DEFAULT identity row is not reported');
  assert.ok(!judged.notJudged.some((n) => /unsupported/i.test(n)), 'DEFAULT is reported as an unsupported TYPE');
  assert.equal(verifyEnvelope({ ...facts, body: planBody }, registry).ok, false, 'a DEFAULT title with the PLAN chapters is accepted');
  assert.equal(verifyEnvelope({ ...facts, body: defaultBody + '\n---\nGenerated with Claude Code\n' }, registry).ok, false, 'the shared rules are not applied to a DEFAULT body');
  const plan = verifyEnvelope({ title: 'PLAN: Create a sample', body: defaultBody, base: 'kaal/release/sample', head: 'claude/x', commits: [] }, registry);
  assert.equal(plan.ok, false, 'a PLAN title written to the DEFAULT chapters is accepted');

  const without = verifyEnvelope(facts, readTemplates([files[1]]).registry);
  assert.ok(without.notJudged.some((n) => /unsupported/i.test(n)), 'a DEFAULT title without a DEFAULT template is not reported as unsupported');
  assert.equal(without.complete, false, 'a DEFAULT title without a DEFAULT template is reported as complete');
}
