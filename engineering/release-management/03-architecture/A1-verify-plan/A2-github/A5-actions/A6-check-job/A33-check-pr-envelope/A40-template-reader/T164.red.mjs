// Case release/T164 tests: A40
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/templates.mjs');
export const id = 'release/T164';
export const tests = ['release/A40'];
export const title = 'the template reader derives a type and its chapters from a declared template and reports undeclared, malformed, duplicate and chapterless templates';
export async function run() {
  const { readTemplates } = await import(pathToFileURL(reader).href);
  const file = (name, text) => ({ name, text });
  const template = (type, chapters) => `<!-- KAAL-PR-template: ${type} -->\n\n${chapters.map((c) => `## ${c}\n\n<!-- a hint -->\n`).join('\n')}`;
  const ok = readTemplates([file('plan.md', template('PLAN', ['Change', 'From', 'To', 'Because'])), file('sync.md', template('SYNC', ['Change', 'Reason']))]);
  assert.deepEqual(ok.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the chapters of a declared template are not derived');
  assert.deepEqual(ok.registry.SYNC, ['Change', 'Reason'], 'a second declared template is not derived');
  assert.equal(ok.findings.length, 0, 'a valid template set has findings');
  const find = (files) => readTemplates(files);
  const undeclared = find([file('x.md', '## Change\n\n## Why\n')]);
  assert.ok(undeclared.findings.some((f) => /x\.md/.test(f) && /declar/i.test(f)), 'an undeclared template is not reported');
  assert.deepEqual(Object.keys(undeclared.registry), [], 'an undeclared template is in the registry');
  assert.ok(find([file('m.md', template('plan', ['Change', 'From']))]).findings.length > 0, 'a lower-case TYPE is accepted');
  assert.ok(find([file('m.md', '<!-- KAAL-PR-template: -->\n## Change\n')]).findings.length > 0, 'an empty declaration is accepted');
  assert.ok(find([file('m.md', template('PLAN', ['Change']) + '<!-- KAAL-PR-template: DO -->\n')]).findings.length > 0, 'two declarations in one template are accepted');
  assert.ok(find([file('m.md', template('PLAN', ['From', 'To']))]).findings.length > 0, 'a template whose first chapter is not Change is accepted');
  const dup = find([file('a.md', template('DO', ['Change', 'Implement'])), file('b.md', template('DO', ['Change', 'Refactor']))]);
  assert.ok(dup.findings.some((f) => /duplicate|ambiguous/i.test(f)), 'a duplicate TYPE is not reported');
  assert.equal(dup.registry.DO, undefined, 'an ambiguous TYPE is in the registry');
}
