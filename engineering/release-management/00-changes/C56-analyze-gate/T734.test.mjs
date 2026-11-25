// Case release/T734 tests: release/CTL5
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, requiredChecks } from './fixtures.mjs';
export const id = 'release/T734';
export const tests = ['release/CTL5'];
export const title = 'no other ruleset source requires analyze Vulnerabilities, and the table of controls lists the Promoting check as required by the promoting ruleset (release/CTL5) and the Integrating check as detective';
export async function run() {
  for (const name of ['integrating', 'collecting', 'hotfixing', 'wiring']) {
    const contexts = requiredChecks(name).map((c) => c.context);
    assert.ok(!contexts.some((c) => c.startsWith('analyze Vulnerabilities')), `${name} requires analyze Vulnerabilities`);
  }
  const text = readFileSync(join(RM, '05-src/wiring/rulesets/controls.md'), 'utf8');
  const rows = text.split('\n').filter((l) => l.trim().startsWith('|'));
  const promoting = rows.find((l) => /^\|\s*30 - promoting\s*\|/.test(l));
  assert.ok(promoting?.includes('analyze Vulnerabilities (Promoting)') && promoting.includes('release/CTL5'), 'the promoting row does not list the check and release/CTL5');
  const integrating = rows.find((l) => l.includes('analyze Vulnerabilities') && l.includes('Integrating') && l.includes('detective'));
  assert.ok(integrating, 'the Integrating check is not listed as detective');
  assert.ok(!rows.some((l) => l.includes('analyze Vulnerabilities (Promoting)') && l.includes('required by no ruleset')), 'the Promoting check is still listed as required by no ruleset');
}
