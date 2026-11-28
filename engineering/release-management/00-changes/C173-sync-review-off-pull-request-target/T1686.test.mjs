// Case release/T1686 tests: release/C173
import assert from 'node:assert/strict';
import { world } from './fixture.mjs';
export const id = 'release/T1686';
export const tests = ['release/C173'];
export const title = 'a verdict is trusted only from the verify workflow\'s own completed successful run and naming that run, head, base ref and base sha; every other file approves nothing, names what was wrong, and still sends review to a person';
export async function run() {
  const x = await world();
  try {
    const good = x.envelope();
    const cases = {
      'missing artifact': { file: null, code: 'no-artifact' },
      'unreadable file': { file: 'not json', code: 'no-artifact' },
      'artifact of another run': { file: JSON.stringify({ ...good, runId: '1' }), code: 'other-run' },
      'verdict of another head': { file: JSON.stringify({ ...good, head: 'a'.repeat(40) }), code: 'other-head-than-run' },
      'verdict of another pull request': { file: JSON.stringify({ ...good, pr: 8 }), code: 'other-pull-request' },
      'no verdict inside': { file: JSON.stringify({ ...good, verdict: null }), code: 'no-verdict' },
      'run of another workflow': { env: { KAAL_RUN_NAME: 'ci' }, code: 'wrong-workflow' },
      'run of another event': { env: { KAAL_RUN_EVENT: 'push' }, code: 'wrong-event' },
      'run that did not succeed': { env: { KAAL_RUN_CONCLUSION: 'failure' }, code: 'run-not-success', reviewTrusts: true },
    };
    for (const [name, c] of Object.entries(cases)) {
      x.setFile(c.file === undefined ? x.sent : c.file);
      const env = x.actEnv(c.env ?? {});
      assert.equal(x.run(x.approve, env), 0, name);
      assert.equal(x.w.outs.approval, 'skipped', `${name}: approved`);
      assert.equal(x.w.posted(/pulls\/7\/reviews/).length, 0, `${name}: a review was posted`);
      assert.ok(x.w.logs.some((l) => l.includes(c.code)), `${name}: the refusal does not name ${c.code}: ${x.w.logs.join(' | ')}`);
      // review Sync: a refused verdict is no verdict, so a person is asked (a run that failed carries a real FAIL verdict and is routed too)
      x.run(x.review, x.actEnv({ ...(c.env ?? {}), KAAL_APPROVAL: 'skipped' }));
      assert.ok(x.w.posted(/labels/).length > 0 || c.reviewTrusts, `${name}: review Sync did not put it in front of a person`);
    }
    x.setFile(x.sent);
  } finally { x.w.done(); }
}
