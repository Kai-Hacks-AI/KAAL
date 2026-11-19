// Case release/T732 tests: release/CTL5
import assert from 'node:assert/strict';
import { job } from './fixtures.mjs';
export const id = 'release/T732';
export const tests = ['release/CTL5'];
export const title = 'both jobs of the analyze Vulnerabilities workflow state severity low and scope runtime and exempt no advisory, Integrating is warn-only and does not fail, and Promoting is neither';
export async function run() {
  for (const name of ['integrating', 'promoting']) {
    const text = job(name);
    assert.ok(text, `the ${name} job is absent`);
    assert.match(text, /^\s+fail-on-severity: low$/m, `${name}: severity is not stated as low`);
    assert.match(text, /^\s+fail-on-scopes: runtime$/m, `${name}: scope is not stated as runtime`);
    assert.ok(!/allow-ghsas/.test(text), `${name}: an advisory is exempted`);
  }
  const integrating = job('integrating');
  assert.match(integrating, /^\s+warn-only: true$/m, 'Integrating is not warn-only');
  assert.match(integrating, /Interpret the result\n\s+continue-on-error: true$/m, 'the Integrating interpreting step can fail the job');
  const promoting = job('promoting');
  assert.ok(!/warn-only: true/.test(promoting), 'Promoting is warn-only');
  assert.ok(!/Interpret the result\n\s+continue-on-error/.test(promoting), 'the Promoting interpreting step cannot fail the job');
}
