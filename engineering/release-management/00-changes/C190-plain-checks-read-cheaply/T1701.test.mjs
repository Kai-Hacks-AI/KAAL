// Case release/T1701 tests: release/C190. The interval stretches and the total wait is kept.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const DIR = join(repo, 'engineering/release-management/05-src/promotion-source');
export const id = 'release/T1701';
export const tests = ['release/C190'];
export const title = 'the intervals are the stretching series, the total wait is not shorter than 30 times 20 seconds, and the two overrides still apply';
export async function run() {
  const lib = await import(pathToFileURL(join(DIR, 'lib/run.mjs')).href);
  const evidence = await import(pathToFileURL(join(DIR, 'judge-head-evidence.mjs')).href);
  const head = '0123456789abcdef0123456789abcdef01234567';
  const baseEnv = { KAAL_REPO: 'o/r', KAAL_DEFAULT: 'main', KAAL_HEAD_REPO: 'o/r', KAAL_HEAD_REF: 'kaal/release/x', KAAL_HEAD_SHA: head };
  const argv = ['--base-ref', 'main'];
  const rules = [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'Engineering' }] } }];
  const runOf = (status, conclusion) => [{ id: 1, name: 'Engineering', status, conclusion, appId: 15368, headSha: head }];
  const go = (env, ghRead, extra = {}) => { const out = []; const waits = []; return lib.run({ label: 'Promotion Source: head evidence', check: evidence.check, read: evidence.makeRead(ghRead), again: (a) => a.kind === 'fail' && a.findings.some((x) => x.includes('(pending)')), argv, env: { ...baseEnv, ...env }, out: (l) => out.push(l), wait: async (s) => { waits.push(s); }, ...extra }).then((code) => ({ code, out, waits })); };
  const series = lib.waitsFor({});
  assert.deepEqual(series.slice(0, 7), [20, 20, 30, 30, 45, 45, 60], 'the series stretches');
  assert.ok(series.every((s, i) => i === 0 || s >= series[i - 1]), 'it never shortens');
  assert.ok(series.reduce((a, b) => a + b, 0) >= 30 * 20, 'the total is not shorter than 30 times 20 seconds');
  assert.ok(series.length + 1 < 30, 'it reads fewer times than 30');
  assert.deepEqual(lib.waitsFor({ KAAL_ATTEMPTS: '4' }), [20, 20, 20], 'KAAL_ATTEMPTS gives the old constant interval');
  assert.deepEqual(lib.waitsFor({ KAAL_INTERVAL: '5' }).slice(0, 2), [5, 5], 'KAAL_INTERVAL gives its interval');
  assert.equal(lib.waitsFor({ KAAL_INTERVAL: '5' }).length, 29, 'with 30 reads');
  // a check that stays pending waits through the whole series and then reports, never passes
  const reads = { runs: 0 };
  const r = await go({}, (args) => (args[0].includes('/rules/') ? rules : (reads.runs += 1, runOf('in_progress', null))));
  assert.deepEqual(r.waits, series, 'the entry waits the series');
  assert.equal(reads.runs, series.length + 1);
  assert.ok(!r.out.some((l) => /: PASS/.test(l)), 'a check that never finishes is not a pass'); assert.ok(r.out.some((l) => /: REPORT/.test(l)));
}
