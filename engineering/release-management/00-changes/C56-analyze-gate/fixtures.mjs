// Fixtures of release/C56: where the sources live and how a job and a ruleset are read from them.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const RM = join(repo, 'engineering/release-management');
export const WORKFLOW = join(RM, '05-src/wiring/workflows/analyze-vulnerabilities.yml');
export const RULESETS = join(RM, '05-src/wiring/rulesets');
export const ruleset = (name) => JSON.parse(readFileSync(join(RULESETS, `${name}.json`), 'utf8'));
export const requiredChecks = (name) => ruleset(name).rules.find((r) => r.type === 'required_status_checks').parameters.required_status_checks;
// The text of one job of the workflow source: from its key to the next job key or the end.
export function job(name) {
  const text = readFileSync(WORKFLOW, 'utf8');
  const m = text.match(new RegExp(`^  ${name}:\\n([\\s\\S]*?)(?=^  [a-z]+:\\n|(?![\\s\\S]))`, 'm'));
  return m ? m[1] : null;
}
