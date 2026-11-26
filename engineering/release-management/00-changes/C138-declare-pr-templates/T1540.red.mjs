// Case release/T1540 tests: release/C138
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SOURCES = join(repo, 'engineering/release-management/05-src/wiring/templates');
const TYPES = ['PLAN', 'DO', 'ACT', 'SYNC', 'PROMOTION', 'HOTFIX', 'WIRE'];
export const id = 'release/T1540';
export const tests = ['release/C138'];
export const title = 'the template sources declare one TYPE each and the reader derives the seven TYPEs from them without a finding';
export async function run() {
  assert.ok(existsSync(SOURCES), 'the template sources are absent');
  const { readTemplates } = await import(join(repo, 'engineering/release-management/05-src/plan-body/templates.mjs'));
  const files = readdirSync(SOURCES).filter((f) => f.endsWith('.md')).map((f) => ({ path: `.github/PULL_REQUEST_TEMPLATE/${f}`, text: readFileSync(join(SOURCES, f), 'utf8') }));
  const { registry, findings } = readTemplates(files);
  assert.deepEqual(findings, [], 'the reader found a fault in the sources');
  assert.deepEqual(Object.keys(registry).sort(), [...TYPES].sort(), 'the sources do not declare exactly the seven TYPEs');
  assert.deepEqual(registry.WIRE, ['Source', 'Target', 'Verification'], 'the WIRE keeps its three chapters');
  for (const t of TYPES.filter((x) => x !== 'WIRE')) assert.equal(registry[t][0], 'Change', `${t} keeps the chapter Change its template declares`);
  const def = readTemplates([{ path: '.github/pull_request_template.md', text: '## Change\n' }]);
  assert.ok(def.findings.length > 0 && /DEFAULT/.test(def.findings.join(' ')), 'a default template file is judged as an invalid route, not skipped');
  for (const f of files) assert.equal(f.text.split('\n')[0].startsWith('<!-- KAAL-PR-template: '), true, `${f.path} must open with its declaration`);
}
