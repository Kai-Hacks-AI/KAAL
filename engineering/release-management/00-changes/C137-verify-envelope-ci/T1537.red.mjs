// Case release/T1537 tests: release/CTL11
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1537';
export const tests = ['release/CTL11'];
export const title = 'the runner of verify Envelope makes facts from an event and a log, and the flag decides the exit only when it is exactly on';
export async function run() {
  const file = join(repo, 'engineering/release-management/05-src/plan-body/run-verify-envelope.mjs');
  assert.ok(existsSync(file), 'the runner is absent');
  const m = await import(file);
  const event = { pull_request: { title: 'PLAN: a thing', body: '## Change\nx/C1 a thing\n', base: { ref: 'kaal/x/y' }, head: { ref: 'claude/z' } } };
  const log = 'abc\u001fa message\n\nDriven-by: x/C1\n\u001e';
  const facts = m.factsOf({ event, log });
  assert.equal(facts.title, 'PLAN: a thing');
  assert.equal(facts.base, 'kaal/x/y');
  assert.equal(facts.head, 'claude/z');
  assert.equal(facts.commits.length, 1);
  assert.match(facts.commits[0].message, /Driven-by: x\/C1/);
  assert.equal(m.factsOf({ event }).commits, undefined, 'no log must leave commits absent, not empty');
  for (const [flag, verdict, code] of [['on', 'FAIL', 1], ['on', 'UNKNOWN', 1], ['on', 'PASS', 0], ['ON', 'FAIL', 0], ['true', 'FAIL', 0], ['', 'UNKNOWN', 0], [undefined, 'FAIL', 0]]) {
    assert.equal(m.exitCodeOf({ verdict }, flag), code, `${flag} ${verdict}`);
  }
  const line = m.evidenceLine(m.recordOf({ pr: 7, merge: 'sha', run: 9, answer: { verdict: 'PASS' }, type: 'PLAN' }));
  assert.match(line, /^envelope-evidence \{/);
  assert.deepEqual(JSON.parse(line.slice('envelope-evidence '.length)), { kind: 'run', pr: 7, merge: 'sha', run: 9, verdict: 'PASS', type: 'PLAN' });
}
