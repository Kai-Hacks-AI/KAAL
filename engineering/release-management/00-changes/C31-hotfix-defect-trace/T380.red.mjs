// Case release/T380 tests: G66
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T380';
export const tests = ['release/G66'];
export const title = 'the HOTFIX trace judge marks a broken link from HOTFIX to Defect to reproducing Case, flags several roots without failing, and never answers PASS';

export async function run() {
  const mod = join(repo, 'engineering/release-management/05-src/plan-body/hotfix-trace.mjs');
  assert.ok(existsSync(mod), 'the HOTFIX trace judge is absent');
  const { judgeHotfixTrace } = await import(pathToFileURL(mod).href);
  const base = {
    defects: ['hosting/D10'],
    paths: ['packages/kaal-hosting/src/read.mjs'],
    lookupDefect: (d) => (d === 'hosting/D10' ? { cases: ['hosting/T12'] } : d === 'hosting/D11' ? { cases: [] } : undefined),
    caseExists: (c) => c === 'hosting/T12',
    caseResult: () => 'GREEN',
  };
  const j = (over) => judgeHotfixTrace({ ...base, ...over });
  // An unchanged Case that reproduces the Defect is enough: the diff holds no test file.
  const good = j({});
  assert.equal(good.verdict, 'UNKNOWN', 'a complete trace must stay UNKNOWN, never PASS');
  assert.deepEqual(good.findings, [], 'a complete trace has no finding');
  for (const re of [/minimal/, /unrelated work/, /corresponds to the Defect/, /genuinely repairs/]) {
    assert.ok(good.notJudged.some((s) => re.test(s)), `not judged is missing ${re}`);
  }
  // Several roots are listed for justification and never change the verdict.
  const wide = j({ paths: [...base.paths, 'engineering/guard/check.mjs'] });
  assert.equal(wide.verdict, 'UNKNOWN', 'several roots must not fail the HOTFIX');
  assert.deepEqual(wide.findings, []);
  assert.ok(wide.attention.some((s) => /capability root/.test(s)), 'several roots are not flagged for justification');
  assert.deepEqual(good.attention, [], 'one root needs no attention');
  // Each broken link is a finding.
  const fails = [
    [{ defects: [] }, /Defect/, 'no Defect'],
    [{ defects: ['hosting/D10', 'hosting/D11'] }, /one Defect/, 'two Defects'],
    [{ defects: ['hosting/D99'] }, /not recorded/, 'an unrecorded Defect'],
    [{ defects: ['hosting/D11'] }, /reproducing Case/, 'a Defect without a Case'],
    [{ caseExists: () => false }, /does not exist/, 'a missing Case'],
    [{ caseResult: () => 'RED' }, /RED/, 'a RED Case'],
    [{ paths: [] }, /empty/, 'an empty diff'],
  ];
  for (const [over, re, what] of fails) {
    const r = j(over);
    assert.equal(r.verdict, 'FAIL', `${what} is accepted`);
    assert.ok(r.findings.some((s) => re.test(s)), `${what} gives no matching finding`);
  }
  // A result that is not supplied is not judged, not a finding.
  const noResult = j({ caseResult: () => undefined });
  assert.equal(noResult.verdict, 'UNKNOWN');
  assert.ok(noResult.notJudged.some((s) => /result/.test(s)), 'a missing Case result is not listed as not judged');
}
