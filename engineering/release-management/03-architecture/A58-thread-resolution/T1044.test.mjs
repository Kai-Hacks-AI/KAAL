// Case release/T1044 tests: release/A58
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const folder = (dir, p) => readdirSync(join(RM, dir)).find((n) => n.startsWith(p + '-'));
const read = (dir, p) => { const f = folder(dir, p); assert.ok(f && existsSync(join(RM, dir, f, p + '.md')), p + ' is absent from ' + dir); return readFileSync(join(RM, dir, f, p + '.md'), 'utf8'); };
const flat = (s) => s.replace(/\s+/g, ' ');
export const id = 'release/T1044';
export const tests = ['release/A58'];
export const title = 'the Integrating declaration states the same thread setting as the source, the judge passes on the real sources, and a source that disagrees with the declaration is a finding';
export async function run() {
  read('03-architecture', 'A58');
  const { judge, read: readFacts } = await import(join(RM, '05-src/stages/judge.mjs'));
  const facts = structuredClone(readFacts(repo));
  const declared = facts.stages.stages.find((s) => s.name === 'Integrating').rules.find((r) => r.type === 'pull_request');
  assert.equal(declared.parameters.required_review_thread_resolution, true, 'the declaration does not state thread resolution');
  const ok = judge(facts);
  assert.equal(ok.kind, 'pass', 'the judge does not pass on the real sources: ' + JSON.stringify(ok.findings));
  const bad = structuredClone(facts);
  bad.rulesets.Integrating.rules.find((r) => r.type === 'pull_request').parameters.required_review_thread_resolution = false;
  const out = judge(bad);
  assert.notEqual(out.kind, 'pass', 'a source that drops the setting passes');
  assert.match(JSON.stringify(out.findings), /Integrating/, 'the finding does not name the stage');
}
