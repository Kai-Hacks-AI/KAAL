// Case release/T185 tests: A40
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const reader = join(repo, 'engineering/release-management/05-src/plan-body/templates.mjs');
export const id = 'release/T185';
export const tests = ['release/A40'];
export const title = 'the template reader registers DEFAULT as a TYPE when the single default file declares it on its first line and starts with Change';
export async function run() {
  const { readTemplates } = await import(pathToFileURL(reader).href);
  const file = (path, text) => ({ path, text });
  const dir = '.github/PULL_REQUEST_TEMPLATE/';
  const chapters = (names) => names.map((c) => `## ${c}\n\n<!-- a hint -->\n`).join('\n');
  const typed = file(`${dir}plan.md`, `<!-- KAAL-PR-template: PLAN -->\n\n${chapters(['Change', 'From', 'To', 'Because'])}`);
  const dflt = (text) => file('.github/pull_request_template.md', text);
  const declared = `<!-- KAAL-PR-template: DEFAULT -->\n\n${chapters(['Change', 'Because'])}`;

  const ok = readTemplates([dflt(declared), typed]);
  assert.deepEqual(ok.registry.DEFAULT, ['Change', 'Because'], 'DEFAULT is not in the registry');
  assert.deepEqual(ok.registry.PLAN, ['Change', 'From', 'To', 'Because'], 'the specialized TYPE is lost beside DEFAULT');
  assert.equal(ok.findings.length, 0, 'a valid template set has findings');
  assert.equal(ok.decisions.length, 0, 'a valid template set raises a decision point');

  // the contract of A40 stays: first line, one default file, Change first
  const later = readTemplates([dflt(chapters(['Change', 'Because']) + '<!-- KAAL-PR-template: DEFAULT -->\n')]);
  assert.equal(later.registry.DEFAULT, undefined, 'a DEFAULT declaration that is not on the first line is registered');
  assert.ok(later.findings.some((f) => /first line/i.test(f)), 'a late DEFAULT declaration is not reported');
  const two = readTemplates([dflt(declared), file('docs/pull_request_template.md', chapters(['Summary']))]);
  assert.equal(two.registry.DEFAULT, undefined, 'DEFAULT is registered while several default files exist');
  assert.ok(two.findings.some((f) => /several default/i.test(f)), 'several default files are not reported');
  const wrongStart = readTemplates([dflt(`<!-- KAAL-PR-template: DEFAULT -->\n\n${chapters(['Intent', 'Design'])}`)]);
  assert.equal(wrongStart.registry.DEFAULT, undefined, 'a DEFAULT template that does not start with Change is registered');
  assert.ok(wrongStart.findings.some((f) => /Change/.test(f)), 'a DEFAULT template that does not start with Change is not reported');
  const undeclared = readTemplates([dflt(chapters(['Change', 'Because']))]);
  assert.equal(undeclared.registry.DEFAULT, undefined, 'an undeclared default file is registered');
  assert.equal(undeclared.decisions.length, 1, 'an undeclared default file raises no decision point');
  const elsewhere = readTemplates([file(`${dir}x.md`, declared)]);
  assert.equal(elsewhere.registry.DEFAULT, undefined, 'DEFAULT declared outside a default path is registered');
  assert.ok(elsewhere.findings.length > 0, 'DEFAULT declared outside a default path is not reported');
}
