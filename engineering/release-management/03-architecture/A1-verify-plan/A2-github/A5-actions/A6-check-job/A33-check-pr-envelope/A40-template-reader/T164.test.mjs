// Case release/T164 tests: A40
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/templates.mjs');
export const id = 'release/T164';
export const tests = ['release/A40'];
export const title = 'the template reader sorts templates into declared KAAL templates, the DEFAULT TYPE and others, reports malformed, duplicate and chapterless declarations, and raises a decision point for other templates without judging them';
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
  assert.equal(ok.registry.DEFAULT, undefined, 'DEFAULT is registered where there is no default file');

  // DEFAULT is a TYPE: only a default file that declares it, and that starts with Change
  const withDefault = readTemplates([file('.github/pull_request_template.md', '<!-- KAAL-PR-template: DEFAULT -->\n' + plain(['Change', 'Because'])), file(`${dir}plan.md`, template('PLAN', ['Change', 'From']))]);
  assert.deepEqual(withDefault.registry.DEFAULT, ['Change', 'Because'], 'DEFAULT is not in the registry');
  assert.equal(withDefault.registry.Change, undefined, 'the chapters of DEFAULT are TYPEs of the registry');
  assert.deepEqual(Object.keys(withDefault.registry).sort(), ['DEFAULT', 'PLAN'], 'the registry holds more than DEFAULT and the declared typed template');
  assert.equal(withDefault.decisions.length, 0, 'DEFAULT is reported as a template that is not KAAL');
  assert.equal(withDefault.findings.length, 0, 'a declared DEFAULT has findings');
  for (const path of ['pull_request_template.md', 'PULL_REQUEST_TEMPLATE.md', 'docs/Pull_Request_Template.txt', '.github/PULL_REQUEST_TEMPLATE.md']) {
    assert.equal(readTemplates([file(path, '<!-- KAAL-PR-template: DEFAULT -->\n' + plain(['Change']))]).registry.DEFAULT?.[0], 'Change', `the default file ${path} is not recognised`);
  }
  const undeclaredDefault = readTemplates([file('.github/pull_request_template.md', plain(['Intent', 'Design']))]);
  assert.equal(undeclaredDefault.registry.DEFAULT, undefined, 'a default file without a declaration is registered as DEFAULT');
  assert.deepEqual(undeclaredDefault.decisions[0]?.paths, ['.github/pull_request_template.md'], 'a default file without a declaration is not raised as a decision point');

  // DEFAULT is declared only at the default path
  assert.ok(readTemplates([file(`${dir}x.md`, template('DEFAULT', ['Change']))]).findings.length > 0, 'DEFAULT in a template of the directory is accepted');
  assert.ok(readTemplates([file('.github/pull_request_template.md', '<!-- KAAL-PR-template: DEFAULT -->\n<!-- KAAL-PR-template: DEFAULT -->\n## Change\n')]).findings.length > 0, 'a second DEFAULT is accepted');
  assert.ok(readTemplates([file('.github/pull_request_template.md', '<!-- KAAL-PR-template: DEFAULT -->\n## Change\n'), file('docs/pull_request_template.md', '<!-- KAAL-PR-template: DEFAULT -->\n## Change\n')]).findings.length > 0, 'two default files are accepted');
  assert.ok(readTemplates([file('.github/pull_request_template.md', template('PLAN', ['Change']))]).findings.length > 0, 'a typed declaration in the default path is accepted');
  assert.ok(readTemplates([file(`${dir}plan.md`, template('PLAN', ['Change']) + '<!-- KAAL-PR-template: DEFAULT -->\n')]).findings.length > 0, 'a typed template that also declares DEFAULT is accepted');

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

  // the DEFAULT declaration opens the default file; several default files are ambiguous
  const later = readTemplates([file('.github/pull_request_template.md', plain(['Intent']) + '<!-- KAAL-PR-template: DEFAULT -->\n')]);
  assert.equal(later.registry.DEFAULT, undefined, 'a DEFAULT declaration that is not on the first line is registered');
  assert.ok(later.findings.some((f) => /first line/i.test(f)), 'a late DEFAULT declaration is not reported');
  const blank = readTemplates([file('.github/pull_request_template.md', '\n<!-- KAAL-PR-template: DEFAULT -->\n' + plain(['Intent']))]);
  assert.equal(blank.registry.DEFAULT, undefined, 'a DEFAULT declaration after a blank line is registered');
  const two = readTemplates([file('.github/pull_request_template.md', '<!-- KAAL-PR-template: DEFAULT -->\n' + plain(['Intent'])), file('docs/pull_request_template.md', plain(['Summary']))]);
  assert.equal(two.registry.DEFAULT, undefined, 'two default files, one declaring DEFAULT, still register DEFAULT');
  assert.ok(two.findings.some((f) => /several default/i.test(f) && /ambiguous/i.test(f)), 'several default files are not reported as ambiguous');
}
