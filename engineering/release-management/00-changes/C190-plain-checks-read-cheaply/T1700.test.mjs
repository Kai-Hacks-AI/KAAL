// Case release/T1700 tests: release/C190. The rules cannot change inside the wait: the head evidence entry reads them once.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const DIR = join(repo, 'engineering/release-management/05-src/promotion-source');
export const id = 'release/T1700';
export const tests = ['release/C190'];
export const title = 'the head evidence entry reads the rules once and the check runs once per tick over a wait of several ticks';
export async function run() {
  const lib = await import(pathToFileURL(join(DIR, 'lib/run.mjs')).href);
  const evidence = await import(pathToFileURL(join(DIR, 'judge-head-evidence.mjs')).href);
  const head = '0123456789abcdef0123456789abcdef01234567';
  const baseEnv = { KAAL_REPO: 'o/r', KAAL_DEFAULT: 'main', KAAL_HEAD_REPO: 'o/r', KAAL_HEAD_REF: 'kaal/release/x', KAAL_HEAD_SHA: head };
  const argv = ['--base-ref', 'main'];
  const rules = [{ type: 'required_status_checks', parameters: { required_status_checks: [{ context: 'Engineering' }] } }];
  const runOf = (status, conclusion) => [{ id: 1, name: 'Engineering', status, conclusion, appId: 15368, headSha: head }];
  const go = (env, ghRead, extra = {}) => { const out = []; const waits = []; return lib.run({ label: 'Promotion Source: head evidence', check: evidence.check, read: evidence.makeRead(ghRead), again: (a) => a.kind === 'fail' && a.findings.some((x) => x.includes('(pending)')), argv, env: { ...baseEnv, ...env }, out: (l) => out.push(l), wait: async (s) => { waits.push(s); }, ...extra }).then((code) => ({ code, out, waits })); };
  const calls = { rules: 0, runs: 0 };
  let n = 0;
  const ghRead = (args) => {
    if (args[0].includes('/rules/')) { calls.rules += 1; return rules; }
    calls.runs += 1; n += 1;
    return n < 4 ? runOf('in_progress', null) : runOf('completed', 'success');
  };
  const r = await go({}, ghRead);
  assert.equal(calls.runs, 4, 'the check runs are read once per tick');
  assert.equal(calls.rules, 1, 'the rules of the head ref are read once for the whole wait');
  assert.equal(r.waits.length, 3);
  assert.equal(r.code, 0, 'the wait ends green');
}
