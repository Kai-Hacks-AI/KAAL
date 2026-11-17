// Case release/T742 tests: release/C57
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const MODULE = join(repo, 'engineering/release-management/05-src/vulnerability-scan/interpreter.mjs');
export const id = 'release/T742';
export const tests = ['release/C57'];
export const title = 'the interpreter of the scan says PASS only for a clean runtime audit, FAIL with each advisory, and UNKNOWN for anything it cannot read';
const audit = (counts, vulnerabilities = {}, total = 120) => JSON.stringify({
  auditReportVersion: 2,
  vulnerabilities,
  metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, ...counts }, dependencies: { total } },
});
export async function run() {
  assert.ok(existsSync(MODULE), 'the interpreter is absent');
  const { interpret } = await import(pathToFileURL(MODULE).href);
  const pass = interpret(audit({}));
  assert.equal(pass.outcome, 'PASS');
  assert.equal(pass.passes, true);
  assert.deepEqual(pass.analyzed, { lockfile: 'package-lock.json', scope: 'runtime', threshold: 'low', exemptions: 0, packages: 120 });
  assert.equal(interpret(audit({ info: 2 })).outcome, 'PASS', 'info is below the threshold');
  const fail = interpret(audit({ low: 1 }, {
    glob: { name: 'glob', severity: 'low', via: [{ source: 1, name: 'glob', url: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc', severity: 'low', range: '<10.5.0' }] },
    c8: { name: 'c8', severity: 'low', via: ['glob'] },
  }));
  assert.equal(fail.outcome, 'FAIL');
  assert.equal(fail.passes, false);
  assert.deepEqual(fail.findings, [{ package: 'glob', severity: 'low', advisory: 'https://github.com/advisories/GHSA-aaaa-bbbb-cccc', range: '<10.5.0' }]);
  const incomplete = (counts) => JSON.stringify({ auditReportVersion: 2, vulnerabilities: {}, metadata: { vulnerabilities: counts, dependencies: { total: 120 } } });
  for (const bad of [incomplete({}), incomplete({ low: 0, moderate: 0, high: 0 }), incomplete({ low: 0, moderate: 0, high: 0, critical: null }),
    incomplete({ low: 0, moderate: '0', high: 0, critical: 0 }), incomplete({ low: 0, moderate: 'x', high: 0, critical: 0 }), incomplete({ low: -1, moderate: 0, high: 0, critical: 0 }),
    incomplete({ low: 0, moderate: 0.5, high: 0, critical: 0 }), incomplete({ low: 0, moderate: 0, high: 0, critical: Number.NaN })]) {
    const r = interpret(bad);
    assert.equal(r.outcome, 'UNKNOWN', `${bad.slice(60, 140)} is not UNKNOWN`);
    assert.equal(r.passes, false);
  }
  assert.equal(interpret(incomplete({ low: 0, moderate: 0, high: 0, critical: 0 })).outcome, 'PASS', 'complete zero counts without info still pass');
  for (const bad of [undefined, '', 'not json', '[]', JSON.stringify({ error: { code: 'ENOAUDIT', summary: 'registry unreachable' } }), JSON.stringify({ auditReportVersion: 2 }), audit({ high: 1 }, {})]) {
    const r = interpret(bad);
    assert.equal(r.outcome, 'UNKNOWN', `${String(bad).slice(0, 30)} is not UNKNOWN`);
    assert.equal(r.passes, false);
  }
}
