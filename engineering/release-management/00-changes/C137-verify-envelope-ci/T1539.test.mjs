// Case release/T1539 tests: release/C137
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RUNNER = join(repo, 'engineering/release-management/05-src/plan-body/run-verify-envelope.mjs');
export const id = 'release/T1539';
export const tests = ['release/C137'];
export const title = 'the command line of verify Envelope says PASS, FAIL and UNKNOWN from files, and never passes what it could not read';
const BODY = '## Change\nx/C1 a thing: it does one thing\n\n## From\nA.\n\n## To\nB.\n\n## Because\nC.\n';
const TEMPLATE = '<!-- KAAL-PR-template: PLAN -->\n\n## Change\n\n## From\n\n## To\n\n## Because\n';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'envelope-'));
  const withTemplate = join(dir, 'with'); const without = join(dir, 'without');
  mkdirSync(join(withTemplate, '.github/PULL_REQUEST_TEMPLATE'), { recursive: true });
  mkdirSync(without);
  writeFileSync(join(withTemplate, '.github/PULL_REQUEST_TEMPLATE/plan.md'), TEMPLATE);
  const event = (over) => { const f = join(dir, `e${Math.random()}.json`); writeFileSync(f, JSON.stringify({ pull_request: { title: 'PLAN: a thing', body: BODY, base: { ref: 'kaal/x/y' }, head: { ref: 'claude/z' }, ...over } })); return f; };
  const log = join(dir, 'log.txt'); writeFileSync(log, 'abc\u001fa message\n\nDriven-by: x/C1\n\u001e');
  const go = (e, templates, flag, withLog = true) => spawnSync(process.execPath, [RUNNER, '--event', e, '--templates', templates, ...(withLog ? ['--log', log] : [])], { encoding: 'utf8', env: { PATH: process.env.PATH, ...(flag === undefined ? {} : { KAAL_FLAG: flag }), KAAL_PR: '7', KAAL_RUN_ID: '9' } });
  const record = (r) => JSON.parse(/^envelope-evidence (.*)$/m.exec(r.stdout)[1]);

  let r = go(event(), withTemplate, 'on');
  assert.match(r.stdout, /^PASS: verify Envelope/m, r.stdout); assert.equal(r.status, 0);
  assert.deepEqual(record(r), { kind: 'run', pr: 7, merge: null, run: 9, verdict: 'PASS', type: 'PLAN' });

  r = go(event({ base: { ref: 'main' } }), withTemplate, 'on'); // a provoked FAIL: a PLAN into main
  assert.match(r.stdout, /^FAIL: /m); assert.match(r.stdout, /route of a PLAN/); assert.equal(r.status, 1);
  assert.equal(go(event({ base: { ref: 'main' } }), withTemplate, 'ON').status, 0, 'only exactly on is live');
  assert.equal(go(event({ base: { ref: 'main' } }), withTemplate, undefined).status, 0, 'no flag is detective');

  r = go(event(), without, 'on'); // no templates at the base: never a PASS
  assert.match(r.stdout, /^UNKNOWN: /m); assert.equal(r.status, 1);
  assert.equal(go(event(), without, '').status, 0);
  r = go(event(), withTemplate, 'on', false); // no commits supplied: never a PASS
  assert.match(r.stdout, /^UNKNOWN: /m); assert.equal(r.status, 1);
  r = spawnSync(process.execPath, [RUNNER, '--event', join(dir, 'absent.json'), '--templates', withTemplate], { encoding: 'utf8', env: { PATH: process.env.PATH, KAAL_FLAG: 'on' } });
  assert.match(r.stdout, /^UNKNOWN: /m); assert.equal(r.status, 1);
}
