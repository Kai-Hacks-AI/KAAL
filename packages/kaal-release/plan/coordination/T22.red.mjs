// Case coordination/T22 tests: F17 (acceptance on the real host, run on the Owner's device)
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { repo } from './fixtures.mjs';
export const id = 'coordination/T22';
export const tests = ['coordination/F17'];
export const title = 'the command reads the real repository through the host reader and prints actionable findings, or fails naming what it could not read';
// Needs the host reader signed in, so it is not part of CI: run by hand, `KAAL_LIVE=<owner/repo> node -e "import('./T22.red.mjs').then(m => m.run())"`.
export async function run() {
  const live = process.env.KAAL_LIVE;
  assert.ok(live, 'KAAL_LIVE=<owner/repo> is required: this Case runs against the real host and is not simulated');
  const declared = join(repo, 'engineering/release-management/05-src/analyze-flow/declaration.json');
  const out = execFileSync('node', [join(repo, 'engineering/release-management/05-src/analyze-flow/run.mjs'), live, declared], { encoding: 'utf8' });
  const result = JSON.parse(out);
  assert.ok(Array.isArray(result.actions) && Array.isArray(result.notJudged), 'the command did not print findings');
  const real = result.actions.filter((a) => /^#\d+$/.test(a.target));
  assert.ok(real.length > 0, 'no finding names a real piece of the real repository');
  assert.ok(result.actions.every((a) => ['OPEN', 'REVIEW', 'REVISE', 'LAND', 'WAIT'].includes(a.action)), 'an action outside the five');
  assert.ok(result.actions.filter((a) => a.status === 'ready' && a.layer === 'promotion').length <= 1, 'more than one promotion is ready');
  let failed = false;
  try { execFileSync('node', [join(repo, 'engineering/release-management/05-src/analyze-flow/run.mjs'), 'no-such-owner-xyz/none', declared], { encoding: 'utf8', stdio: 'pipe' }); } catch (e) { failed = e.status !== 0 && /could not|cannot|not read|unreach/i.test(String(e.stderr)); }
  assert.ok(failed, 'an unreadable host did not fail naming what could not be read');
}
