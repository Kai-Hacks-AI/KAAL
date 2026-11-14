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
export const title = 'the ruleset sources are new rulesets that require, by name, only contexts a source workflow reports, without requiring the branch to be up to date';

// The judgment, kept apart from the repository so that it can be shown on rulesets of known shape.
export function judgeRuleset(json, reported) {
  let r;
  try { r = JSON.parse(json); } catch { return false; }
  const rule = (r.rules ?? []).find((x) => x.type === 'required_status_checks');
  const p = rule?.parameters;
  return typeof r.name === 'string' && !/^old\b/i.test(r.name)
    && Array.isArray(p?.required_status_checks) && p.required_status_checks.length > 0
    && p.strict_required_status_checks_policy === false
    && p.required_status_checks.every((c) => typeof c.context === 'string' && reported.includes(c.context));
}
const mk = (name, strict, contexts) => JSON.stringify({ name, target: 'branch', rules: [{ type: 'required_status_checks', parameters: { strict_required_status_checks_policy: strict, required_status_checks: contexts.map((context) => ({ context })) } }] });
const reported = ['analyze Vulnerabilities (Integration)', 'analyze Vulnerabilities (Promotion)'];
const fixtures = [
  ['a new ruleset that requires a reported context', mk('Promotion', false, [reported[1]]), true],
  ['a name with the prefix old', mk('old Promotion', false, [reported[1]]), false],
  ['a ruleset that requires the branch to be up to date', mk('Promotion', true, [reported[1]]), false],
  ['a context no workflow reports', mk('Promotion', false, ['analyze Vulnerabilities (Nowhere)']), false],
  ['a ruleset that is not JSON', '{', false],
];
export function run() {
  for (const [what, json, want] of fixtures) assert.equal(judgeRuleset(json, reported), want, `the judgment is wrong for ${what}`);
  const files = list(join(wiring, 'rulesets'), '.json');
  assert.ok(files.length > 0, 'no ruleset source is present');
  const names = list(join(wiring, 'workflows'), '.yml').flatMap((f) => [...readFileSync(join(wiring, 'workflows', f), 'utf8').matchAll(/^\s*name: (analyze Vulnerabilities \(\w+\))\s*$/gm)].map((m) => m[1]));
  for (const f of files) assert.ok(judgeRuleset(readFileSync(join(wiring, 'rulesets', f), 'utf8'), names), `${f} is not a new ruleset that requires only contexts a source workflow reports`);
}
