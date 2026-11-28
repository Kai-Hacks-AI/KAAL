// Case review/T1538 tests: review/F35. A change cannot modify what judges and signs it, and a signed verdict is bound to the revision it judged.
import assert from 'node:assert/strict';
import { kinds, loadProvenance } from './lib.mjs';
export const id = 'review/T1538';
export const tests = ['review/F35'];
export const title = 'a change that leaves the execution and signing surface alone may be signed as judged, and a change that touches that surface, evidence of another revision, base or run, evidence that is missing or malformed, and a verdict that did not come from the judge job of the same run are each never a pass and have their own finding';
const SURFACE = ['.github/workflows/inspector.yml', 'packages/kaal-review/13-source/workflows/', 'packages/kaal-review/13-source/scripts/judge-app.mjs', 'packages/kaal-review/13-source/github-apps/', 'packages/kaal-controls/skills/kaal-controls/scripts/'];
const HEAD = 'a'.repeat(40);
const BASE = 'b'.repeat(40);
const evidence = (more = {}) => ({ revision: HEAD, base: BASE, run: '77', job: 'judge', verdicts: [{ control: 'CTL1', verdict: 'pass' }], ...more });
const expected = { revision: HEAD, base: BASE, run: '77' };
export async function run() {
  const { judgeSelfModification, checkEvidence } = await loadProvenance();

  assert.deepEqual(judgeSelfModification(['packages/kaal-review/13-source/scripts/navigate.mjs', 'README.md'], SURFACE), { verdict: 'in', findings: [] });
  for (const path of SURFACE.map((s) => (s.endsWith('/') ? `${s}x.mjs` : s))) {
    const v = judgeSelfModification(['README.md', path], SURFACE);
    assert.equal(v.verdict, 'unknown', `${path}: a change to the surface must not be judged by it, so never a pass`);
    assert.deepEqual(kinds(v), ['touches-inspector'], path);
  }
  assert.equal(judgeSelfModification(['packages/kaal-review/13-source/workflows-other/x.yml'], SURFACE).verdict, 'in', 'a path that only shares a prefix of letters is not on the surface');
  assert.equal(judgeSelfModification(['docs/../.github/workflows/inspector.yml'], SURFACE).verdict, 'unknown', 'a path that reaches the surface through a dot segment is unknown, not a pass');
  assert.equal(judgeSelfModification('not a list', SURFACE).verdict, 'unknown', 'a malformed list of paths is unknown, not a pass and not an exception');
  assert.equal(judgeSelfModification([], []).verdict, 'unknown', 'no declared surface is unknown, not a pass');

  assert.deepEqual(checkEvidence(evidence(), expected), { verdict: 'in', findings: [] });
  const bad = (more, kind, why) => {
    const v = checkEvidence(evidence(more), expected);
    assert.notEqual(v.verdict, 'in', `${why}: must never be a pass`);
    assert.ok(kinds(v).includes(kind), `${why}: expected ${kind}, got ${kinds(v)}`);
  };
  bad({ revision: 'c'.repeat(40) }, 'stale-revision', 'evidence of another revision');
  bad({ revision: undefined }, 'unbound', 'evidence that names no revision');
  bad({ base: 'd'.repeat(40) }, 'stale-base', 'evidence judged against another base');
  bad({ run: '78' }, 'foreign-run', 'a verdict of another run');
  bad({ job: 'sign' }, 'foreign-run', 'a verdict that did not come from the judge job');
  bad({ verdicts: undefined }, 'malformed-evidence', 'evidence without verdicts');
  bad({ verdicts: [{ control: 'CTL1', verdict: 'maybe' }] }, 'malformed-evidence', 'a verdict that is neither pass nor fail nor unknown');
  assert.notEqual(checkEvidence(null, expected).verdict, 'in', 'missing evidence is never a pass');
  assert.notEqual(checkEvidence(evidence(), null).verdict, 'in', 'no expected revision is never a pass');
  const unknown = checkEvidence(evidence({ verdicts: [{ control: 'CTL1', verdict: 'unknown' }] }), expected);
  assert.notEqual(unknown.verdict, 'in', 'an UNKNOWN verdict never signs a pass');
}
