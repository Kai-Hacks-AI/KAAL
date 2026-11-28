// Case release/T1702 tests: release/C190. A failed read inside the wait is retried, and never becomes a pass.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const DIR = join(repo, 'engineering/release-management/05-src/promotion-source');
export const id = 'release/T1702';
export const tests = ['release/C190'];
export const title = 'a read that fails at one tick and succeeds at the next gives the verdict of the facts, three failures in a row give UNKNOWN and say each failure';
export async function run() {
  const lib = await import(pathToFileURL(join(DIR, 'lib/run.mjs')).href);
  const evidence = await import(pathToFileURL(join(DIR, 'judge-head-evidence.mjs')).href);
  const head = '0123456789abcdef0123456789abcdef01234567';
  const baseEnv = { KAAL_REPO: 'o/r', KAAL_DEFAULT: 'main', KAAL_HEAD_REPO: 'o/r', KAAL_HEAD_REF: 'kaal/release/x', KAAL_HEAD_SHA: head };
  const argv = ['--base-ref', 'main'];
  const rules = [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'Engineering' }] } }];
  const runOf = (status, conclusion) => [{ id: 1, name: 'Engineering', status, conclusion, appId: 15368, headSha: head }];
  const go = (env, ghRead, extra = {}) => { const out = []; const waits = []; return lib.run({ label: 'Promotion Source: head evidence', check: evidence.check, read: evidence.makeRead(ghRead), again: (a) => a.kind === 'fail' && a.findings.some((x) => x.includes('(pending)')), argv, env: { ...baseEnv, ...env }, out: (l) => out.push(l), wait: async (s) => { waits.push(s); }, ...extra }).then((code) => ({ code, out, waits })); };
  // one failure, then success: the verdict of the facts
  let k = 0;
  const flaky = (args) => { if (args[0].includes('/rules/')) return rules; k += 1; if (k === 1) throw new Error('check-runs cannot be read'); return runOf('completed', 'success'); };
  const ok = await go({}, flaky);
  assert.equal(ok.code, 0, 'the verdict is that of the facts');
  assert.equal(ok.out.filter((l) => l.includes('cannot be read')).length, 1, 'the failure is said');
  assert.ok(ok.out.some((l) => /: PASS/.test(l)));
  // red facts after a failure stay red
  k = 0;
  const redAfter = await go({}, (args) => { if (args[0].includes('/rules/')) return rules; k += 1; if (k === 1) throw new Error('boom'); return runOf('completed', 'failure'); });
  assert.ok(!redAfter.out.some((l) => /: PASS/.test(l))); assert.ok(redAfter.out.some((l) => /: REPORT/.test(l)));
  // three failures in a row: UNKNOWN, each failure said, and never a pass
  let m = 0;
  const dead = await go({}, (args) => { if (args[0].includes('/rules/')) return rules; m += 1; throw new Error(`down ${m}`); });
  assert.equal(m, 3, 'the third failure in a row ends it');
  assert.equal(dead.out.filter((l) => l.includes('cannot be read')).length, 3, 'each failure is said');
  assert.ok(dead.out.some((l) => l.includes('UNKNOWN')), 'the verdict is UNKNOWN');
  assert.equal(dead.code, 2);
  // failures that are not in a row do not add up
  let q = 0;
  const alt = await go({}, (args) => { if (args[0].includes('/rules/')) return rules; q += 1; if (q % 2 === 1 && q < 6) throw new Error('x'); return q < 6 ? runOf('in_progress', null) : runOf('completed', 'success'); });
  assert.equal(alt.code, 0);
  // a failed rules read is not kept: it is read again
  let r1 = 0;
  const rulesFlaky = await go({}, (args) => { if (args[0].includes('/rules/')) { r1 += 1; if (r1 === 1) throw new Error('rules'); return rules; } return runOf('completed', 'success'); });
  assert.equal(rulesFlaky.code, 0); assert.equal(r1, 2);
  // the wait ending on a failure is UNKNOWN too
  const short = await go({ KAAL_ATTEMPTS: '2' }, (args) => { if (args[0].includes('/rules/')) return rules; throw new Error('down'); });
  assert.equal(short.code, 2);
}
