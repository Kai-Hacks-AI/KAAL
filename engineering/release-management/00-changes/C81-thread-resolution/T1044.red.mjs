// Case release/T1044 tests: release/CTL10
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const IFACE = readFileSync(join(RM, '00-changes/C81-thread-resolution/interface.md'), 'utf8');
const draft = (name) => IFACE.split(new RegExp('^## Draft of ' + name.replace('.', '\\.') + '$', 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1044';
export const tests = ['release/CTL10'];
export const title = 'the Integrating declaration states the same thread setting as the source, the judge passes on the real sources, and a source that disagrees with the declaration is a finding';
export async function run() {
  const { judge, read } = await import(join(RM, '05-src/stages/judge.mjs'));
  const facts = structuredClone(read(repo));
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
