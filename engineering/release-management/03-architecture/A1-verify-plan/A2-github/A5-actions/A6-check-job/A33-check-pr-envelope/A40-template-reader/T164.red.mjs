// Case release/T164 tests: A40
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/templates.mjs');
export const id = 'release/T164';
export const tests = ['release/A40'];
export const title = 'the template reader sorts templates into declared KAAL templates, the known default and others, reports malformed, duplicate and chapterless declarations, and raises a decision point for other templates without judging them';
export async function run() {
  const { readTemplates } = await import(pathToFileURL(reader).href);
  const file = (path, text) => ({ path, text });
  const dir = '.github/PULL_REQUEST_TEMPLATE/';
  const template = (type, chapters) => `<!-- KAAL-PR-template: ${type} -->\n\n${chapters.map((c) => `## ${c}\n\n<!-- a hint -->\n`).join('\n')}`;
  const plain = (chapters) => chapters.map((c) => `## ${c}\n`).join('\n');

  // declared KAAL templates
  const ok = readTemplates([file(`${dir}plan.md`, template('PLAN', ['Change', 'From', 'To', 'Because'])), file(`${dir}sync.md`, template('SYNC', ['Change', 'Reason']))]);
  assert.deepEqual(ok.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the chapters of a declared template are not derived');
  assert.deepEqual(ok.registry.SYNC, ['Change', 'Reason'], 'a second declared template is not derived');
  assert.equal(ok.findings.length, 0, 'a valid template set has findings');
  assert.equal(ok.decisions.length, 0, 'a valid template set raises a decision point');
  assert.equal(ok.fallback, undefined, 'a fallback is reported where there is none');

  // the known default
  const withDefault = readTemplates([file('.github/pull_request_template.md', plain(['Intent', 'Design', 'Verified by', 'Validated by'])), file(`${dir}plan.md`, template('PLAN', ['Change', 'From']))]);
  assert.equal(withDefault.fallback?.path, '.github/pull_request_template.md', 'the default file is not recognised');
  assert.equal(withDefault.registry.Intent, undefined, 'the default is in the registry');
  assert.equal(withDefault.decisions.length, 0, 'the default is reported as a template that is not KAAL');
  for (const path of ['PULL_REQUEST_TEMPLATE.md', 'docs/Pull_Request_Template.txt', '.github/PULL_REQUEST_TEMPLATE.md']) {
    assert.equal(readTemplates([file(path, plain(['Intent']))]).fallback?.path, path, `the default file ${path} is not recognised`);
  }

  // other templates: reported, not ignored, not judged, not invalid
  const other = readTemplates([file(`${dir}plan.md`, template('PLAN', ['Change', 'From'])), file(`${dir}release.md`, plain(['Summary', 'Testing']) + '\n<!-- some-other-marker: 1 -->\n')]);
  assert.equal(other.decisions.length, 1, 'templates that are not KAAL templates are not raised as a decision point');
  const decision = other.decisions[0];
  assert.ok(decision.paths.includes(`${dir}release.md`), 'the decision point does not list the path');
  assert.ok(/not KAAL templates/i.test(decision.question), 'the decision point does not ask what to do with them');
  assert.deepEqual(decision.facts[`${dir}release.md`].headings, ['Summary', 'Testing'], 'the decision point does not carry the facts');
  assert.equal(other.findings.length, 0, 'a template that is not a KAAL template is called invalid');
  assert.equal(other.registry.Summary, undefined, 'a template that is not a KAAL template is in the registry');
  assert.deepEqual(Object.keys(other.registry), ['PLAN'], 'the registry holds more than the declared template');

  // malformed, chapterless, duplicate and ambiguous declarations
  const find = (files) => readTemplates(files);
  assert.ok(find([file(`${dir}m.md`, template('plan', ['Change', 'From']))]).findings.length > 0, 'a lower-case TYPE is accepted');
  assert.ok(find([file(`${dir}m.md`, '<!-- KAAL-PR-template: -->\n## Change\n')]).findings.length > 0, 'an empty declaration is accepted');
  assert.ok(find([file(`${dir}m.md`, template('PLAN', ['Change']) + '<!-- KAAL-PR-template: DO -->\n')]).findings.length > 0, 'two declarations in one template are accepted');
  assert.ok(find([file(`${dir}m.md`, template('PLAN', ['From', 'To']))]).findings.length > 0, 'a template whose first chapter is not Change is accepted');
  const dup = find([file(`${dir}a.md`, template('DO', ['Change', 'Implement'])), file(`${dir}b.md`, template('DO', ['Change', 'Refactor']))]);
  assert.ok(dup.findings.some((f) => /duplicate|ambiguous/i.test(f)), 'a duplicate TYPE is not reported');
  assert.equal(dup.registry.DO, undefined, 'an ambiguous TYPE is in the registry');
}
