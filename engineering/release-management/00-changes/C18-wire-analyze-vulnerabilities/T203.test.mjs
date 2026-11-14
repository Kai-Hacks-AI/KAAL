// Case release/T203 tests: A44
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : []);
export const id = 'release/T203';
export const tests = ['release/A44'];
export const title = 'the ruleset sources are new rulesets that require, by name, only contexts a source workflow reports, on the merge group where they have a merge queue, without requiring the branch to be up to date';

// The judgment, kept apart from the repository so that it can be shown on rulesets of known shape.
// `reported` names the contexts a source workflow reports for pull requests, `onMergeGroup` those it also reports for the merge group.
export function judgeRuleset(json, reported, onMergeGroup) {
  let r;
  try { r = JSON.parse(json); } catch { return false; }
  const rules = r.rules ?? [];
  const p = rules.find((x) => x.type === 'required_status_checks')?.parameters;
  const queued = rules.some((x) => x.type === 'merge_queue');
  return typeof r.name === 'string' && !/^old\b/i.test(r.name)
    && Array.isArray(p?.required_status_checks) && p.required_status_checks.length > 0
    && p.strict_required_status_checks_policy === false
    && p.required_status_checks.every((c) => typeof c.context === 'string' && reported.includes(c.context) && (!queued || onMergeGroup.includes(c.context)));
}
const mk = (name, strict, contexts, queue) => JSON.stringify({ name, target: 'branch', rules: [...(queue ? [{ type: 'merge_queue', parameters: {} }] : []), { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: strict, required_status_checks: contexts.map((context) => ({ context })) } }] });
const I = 'analyze Vulnerabilities (Integration)';
const P = 'analyze Vulnerabilities (Promotion)';
const fixtures = [
  ['Integration without a merge queue', mk('Integration', false, [I], false), [I, P], [P], true],
  ['Promotion with a merge queue and the context on the merge group', mk('Promotion', false, [P], true), [I, P], [P], true],
  ['a merge queue and a context that is not on the merge group', mk('Integration', false, [I], true), [I, P], [P], false],
  ['a name with the prefix old', mk('old Promotion', false, [P], true), [I, P], [P], false],
  ['a ruleset that requires the branch to be up to date', mk('Promotion', true, [P], true), [I, P], [P], false],
  ['a context no workflow reports', mk('Promotion', false, ['analyze Vulnerabilities (Nowhere)'], true), [I, P], [P], false],
  ['a ruleset that is not JSON', '{', [I, P], [P], false],
];
export function run() {
  for (const [what, json, reported, merge, want] of fixtures) assert.equal(judgeRuleset(json, reported, merge), want, `the judgment is wrong for ${what}`);
  const files = list(join(wiring, 'rulesets'), '.json');
  assert.ok(files.length > 0, 'no ruleset source is present');
  const reported = [];
  const onMergeGroup = [];
  for (const f of list(join(wiring, 'workflows'), '.yml')) {
    const text = readFileSync(join(wiring, 'workflows', f), 'utf8');
    for (const m of text.matchAll(/^\s*name: (analyze Vulnerabilities \(\w+\))\s*$/gm)) { reported.push(m[1]); if (/^ {2}merge_group:/m.test(text)) onMergeGroup.push(m[1]); }
  }
  for (const f of files) assert.ok(judgeRuleset(readFileSync(join(wiring, 'rulesets', f), 'utf8'), reported, onMergeGroup), `${f} is not a new ruleset that requires only contexts a source workflow reports, on the merge group where it has a merge queue`);
}
