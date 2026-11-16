// Case release/T573 tests: C41
import assert from 'node:assert/strict';
import { GOOD, body, load, row } from './fixtures.mjs';
export const id = 'release/T573';
export const tests = ['release/C41'];
export const title = 'a Dependency row needs a #<number> reference, the wording of a step is not judged, a URL in Details still fails, and verifyEnvelope reports the findings';
export async function run() {
  const { howToWorkProblems, verifyEnvelope } = await load();
  const dep = (details) => [GOOD[0], row(1, 'Dependency', 'SYNC of main', 'pending', details), row(2, 'Successor', 'ACT, starts on merge', '—', '#131')];
  assert.deepEqual(howToWorkProblems(body(dep('#118'))), [], 'a Dependency with a reference is rejected');
  assert.ok(howToWorkProblems(body(dep('—'))).length > 0, 'a Dependency without a reference is accepted');
  assert.ok(howToWorkProblems(body(dep('118'))).length > 0, 'a Dependency with a bare number is accepted');
  const other = GOOD.map((r) => r.replace('does something', 'Anything else entirely, in other words'));
  assert.deepEqual(howToWorkProblems(body(other)), [], 'the wording of an Action changed the verdict');
  const free = GOOD.map((r) => r.replace('| open |', '| whatever it says |').replace('| — |', '| see the PR #7 |'));
  assert.deepEqual(howToWorkProblems(body(free)), [], 'Status or Details are judged');

  const registry = { DO: ['Change', 'HOW TO WORK'] };
  const facts = (rows) => ({ title: 'DO: x', body: body(rows), base: 'kaal/release/a', head: 'work' });
  const findings = (rows) => verifyEnvelope(facts(rows), registry).problems.filter((p) => /HOW TO WORK|Predecessor|Successor|Dependency|column/i.test(p));
  assert.deepEqual(findings(GOOD), [], 'verifyEnvelope rejects a well-formed chapter');
  assert.ok(findings(GOOD.slice(1)).length > 0, 'verifyEnvelope does not report the findings of the rule');
  const url = GOOD.map((r) => r.replace('#131', 'https://example.com/131'));
  assert.ok(verifyEnvelope(facts(url), registry).problems.some((p) => /link/.test(p)), 'a URL in Details is no longer a link finding');
}
