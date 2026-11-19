// Case release/T382 tests: release/F71 (the after tree and the two runs read as data)
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const MOD = join(RM, '05-src/hotfix/verify-hotfix.mjs');
const load = () => import(pathToFileURL(MOD).href);

export const id = 'release/T382';
export const tests = ['release/F71'];
export const title = 'the Hotfix brings its own Defect and Case: they are read from the after tree, a Defect the Hotfix adds is found; the result of a Case is read from a run report; the command line takes two directories, prints PASS, FAIL or UNKNOWN as its first word and exits 0 whenever a report is produced';
const report = (tests) => ({ schema: 'kaal-testing/run-report@1', counts: {}, tests, diagnostics: [], execution: { complete: true, problems: [] } });
const t = (ns, n, actual) => ({ name: `${ns}/T${n}: x`, actual, case: { namespace: ns, number: n, raw: `${ns}/T${n}` } });
export async function run() {
  assert.ok(existsSync(MOD), 'the verify Hotfix module is absent');
  const { defectsOf, readFacts, caseResult, evidenceFrom, judgeHotfix } = await load();
  const body = '## Change\n\nhosting/C1 fix\n\n## Defect\n\n<!-- hosting/D99 in a comment -->\nhosting/D10 is broken in main.\n\n## Urgency\n\nhosting/D11 is mentioned outside the chapter\n';
  assert.deepEqual(defectsOf(body), ['hosting/D10'], 'the Defect chapter is not read alone, or a comment counts');
  assert.deepEqual(defectsOf('## Defect\n\nhosting/D10 and hosting/D11 and hosting/D10\n'), ['hosting/D10', 'hosting/D11']);
  assert.deepEqual(defectsOf('## Change\n\nx\n'), []);
  assert.deepEqual(defectsOf('## Defect\n\n<!-- hosting/D9\nhosting/D10\n'), [], 'an unterminated comment must run to the end');
  assert.deepEqual(defectsOf('## Defect\n\n<!-- hosting/D9 <!-- x -->\nhosting/D10\n'), ['hosting/D10']);

  // The result of a Case in a run report.
  assert.equal(caseResult(report([t('hosting', 201, 'RED'), t('hosting', 201, 'GREEN')]), 'hosting/T201'), 'RED');
  assert.equal(caseResult(report([t('hosting', 201, 'GREEN'), t('hosting', 201, 'GREEN')]), 'hosting/T201'), 'GREEN');
  assert.equal(caseResult(report([t('hosting', 201, 'GREEN'), t('hosting', 201, 'UNKNOWN')]), 'hosting/T201'), 'UNKNOWN');
  assert.equal(caseResult(report([t('hosting', 2010, 'RED'), t('other', 201, 'RED')]), 'hosting/T201'), undefined, 'another Case or namespace was attributed');
  assert.equal(caseResult({ schema: 'other', tests: [] }, 'hosting/T201'), undefined, 'a report of another schema was read');
  assert.equal(caseResult(undefined, 'hosting/T201'), undefined);

  // Two plain directories: no Git anywhere. The after tree holds the Defect record and the Cases the Hotfix brings.
  const root = mkdtempSync(join(tmpdir(), 'hotfix-'));
  const after = join(root, 'after');
  const put = (p, text) => { mkdirSync(join(after, p, '..'), { recursive: true }); writeFileSync(join(after, p), text); };
  const rec = (o) => `# x\n\n\`\`\`json\n${JSON.stringify(o)}\n\`\`\`\n`;
  put('packages/kaal-hosting/06-defects/D10-x.md', rec({ id: 'hosting/D10', tests: ['hosting/T201', 'hosting/T202'] }));
  put('packages/kaal-hosting/06-defects/D11-y.md', rec({ id: 'hosting/D11', tests: [] }));
  put('packages/kaal-hosting/06-defects/x.test.mjs', "test('hosting/T201: a', () => {});\ntest('hosting/T202: b', () => {});\n");
  put('node_modules/dep/x.mjs', "// hosting/T999 in a dependency\n");
  const f = readFacts({ after, body });
  assert.deepEqual(f.defects, ['hosting/D10']);
  assert.deepEqual(f.lookupDefect('hosting/D10'), { cases: ['hosting/T201', 'hosting/T202'] });
  assert.deepEqual(f.lookupDefect('hosting/D11'), { cases: [] });
  assert.equal(f.lookupDefect('hosting/D99'), undefined);
  assert.deepEqual(f.caseFiles('hosting/T201'), ['packages/kaal-hosting/06-defects/x.test.mjs']);
  assert.equal(f.caseExists('hosting/T20'), false, 'T20 matched as a prefix of T201');
  assert.equal(f.caseExists('hosting/T999'), false, 'a dependency was searched');
  const ev = evidenceFrom({ beforeRun: report([t('hosting', 201, 'RED'), t('hosting', 202, 'RED')]), afterRun: report([t('hosting', 201, 'GREEN'), t('hosting', 202, 'GREEN')]) });
  assert.deepEqual(ev('hosting/T201'), { before: 'RED', after: 'GREEN' });
  assert.equal(judgeHotfix({ ...f, caseEvidence: ev }).verdict, 'PASS');

  // The command line: the verdict is the first word and the exit status says only that a report was produced.
  const files = (name, r) => { const p = join(root, name); writeFileSync(p, JSON.stringify(r)); return p; };
  const cli = (extra, bodyText = body) => {
    writeFileSync(join(root, 'body.md'), bodyText);
    try { return { code: 0, out: execFileSync(process.execPath, [MOD, '--after', after, '--body-file', join(root, 'body.md'), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) }; } catch (e) { return { code: e.status, out: String(e.stdout) }; }
  };
  const red = files('red.json', report([t('hosting', 201, 'RED'), t('hosting', 202, 'RED')]));
  const green = files('green.json', report([t('hosting', 201, 'GREEN'), t('hosting', 202, 'GREEN')]));
  const none = cli([]);
  assert.equal(none.code, 0, 'a produced report must exit 0: the verdict is the report, not the execution result');
  assert.match(none.out, /^UNKNOWN: trace VALID, correction UNKNOWN/);
  const passed = cli(['--before-run', red, '--after-run', green]);
  assert.equal(passed.code, 0);
  assert.match(passed.out, /^PASS: trace VALID, correction VERIFIED/);
  assert.match(passed.out, /case hosting\/T201: VERIFIED\ncase hosting\/T202: VERIFIED/);
  const second = files('second.json', report([t('hosting', 201, 'GREEN'), t('hosting', 202, 'RED')]));
  const failing = cli(['--before-run', red, '--after-run', second]);
  assert.equal(failing.code, 0, 'a FAIL verdict is a produced report and exits 0');
  assert.match(failing.out, /^FAIL: trace VALID, correction NOT VERIFIED/);
  assert.match(failing.out, /finding: the Case hosting\/T202 is still RED after/, 'only the first Case was read');
  assert.match(cli(['--before-run', green, '--after-run', green]).out, /finding: the Case hosting\/T201 is GREEN before/, 'a Case GREEN before was taken as an issue');
  assert.match(cli(['--before-run', join(root, 'missing.json'), '--after-run', green]).out, /^UNKNOWN: trace VALID, correction UNKNOWN/, 'a missing run was read');
  const broken = cli([], '## Defect\n\nhosting/D13 only\n');
  assert.equal(broken.code, 0);
  assert.match(broken.out, /^FAIL: trace BROKEN/);
  assert.match(broken.out, /finding: the Defect hosting\/D13 has no record/);
  const unreadable = (() => { try { return execFileSync(process.execPath, [MOD, '--after', join(root, 'nowhere'), '--body-file', join(root, 'body.md')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { return String(e.stdout); } })();
  assert.match(unreadable, /^(UNKNOWN|FAIL)/, 'an unreadable tree gave no report');
  let usage;
  try { execFileSync(process.execPath, [MOD, '--after', after], { stdio: 'ignore' }); } catch (e) { usage = e.status; }
  assert.equal(usage, 2, 'a call that cannot produce a report must exit 2');
}
