// Case release/T382 tests: release/F71 (the facts read as Git data from the head; the runs read as data)
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
const draft = (name) => readFileSync(join(RM, '00-changes/C94-verify-hotfix/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T382';
export const tests = ['release/F71'];
export const title = 'the Hotfix brings its own Defect and Case: they are read from the head, a Defect added by the Hotfix is recorded; the result of a Case is read from a run report per Case; a run bound to another revision, a missing run and a Case with no test are UNKNOWN; the command line prints FAIL or UNKNOWN, never PASS, and exits 0 whenever a report is produced';
const report = (tests) => ({ schema: 'kaal-testing/run-report@1', counts: {}, tests, diagnostics: [], execution: { complete: true, problems: [] } });
const t = (ns, n, actual) => ({ name: `${ns}/T${n}: x`, actual, case: { namespace: ns, number: n, raw: `${ns}/T${n}` } });
export async function run() {
  assert.ok(existsSync(MOD), 'the verify Hotfix module is absent');
  const { defectsOf, readFacts, judgeHotfixTrace, caseResult, evidenceFrom } = await load();
  const body = '## Change\n\nhosting/C1 fix\n\n## Defect\n\n<!-- hosting/D99 in a comment -->\nhosting/D10 is broken in main.\n\n## Urgency\n\nhosting/D11 is mentioned outside the chapter\n';
  assert.deepEqual(defectsOf(body), ['hosting/D10'], 'the Defect chapter is not read alone, or a comment counts');
  assert.deepEqual(defectsOf('## Defect\n\nhosting/D10 and hosting/D11 and hosting/D10\n'), ['hosting/D10', 'hosting/D11']);
  assert.deepEqual(defectsOf('## Change\n\nx\n'), []);

  // The result of a Case in a run report.
  assert.equal(caseResult(report([t('hosting', 201, 'RED'), t('hosting', 201, 'GREEN')]), 'hosting/T201'), 'RED');
  assert.equal(caseResult(report([t('hosting', 201, 'GREEN'), t('hosting', 201, 'GREEN')]), 'hosting/T201'), 'GREEN');
  assert.equal(caseResult(report([t('hosting', 201, 'GREEN'), t('hosting', 201, 'UNKNOWN')]), 'hosting/T201'), 'UNKNOWN');
  assert.equal(caseResult(report([t('hosting', 2010, 'RED'), t('other', 201, 'RED')]), 'hosting/T201'), undefined, 'another Case or namespace was attributed');
  assert.equal(caseResult({ schema: 'other', tests: [] }, 'hosting/T201'), undefined, 'a report of another schema was read');
  assert.equal(caseResult(undefined, 'hosting/T201'), undefined);

  const dir = mkdtempSync(join(tmpdir(), 'hotfix-'));
  const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const put = (p, text) => { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), text); };
  git('init', '-q', '-b', 'main');
  const rec = (o) => `# x\n\n\`\`\`json\n${JSON.stringify(o)}\n\`\`\`\n`;
  put('packages/kaal-hosting/src/read.mjs', 'export const a = 1;\n');
  put('packages/kaal-hosting/06-defects/D12-z.md', rec({ id: 'hosting/D12', tests: ['hosting/T20'] }));
  git('add', '-A'); git('commit', '-q', '-m', 'main');
  git('checkout', '-q', '-b', 'fix');
  // the Hotfix brings its Defect record and its Cases itself
  put('packages/kaal-hosting/src/read.mjs', 'export const a = 2;\n');
  put('packages/kaal-hosting/06-defects/D10-x.md', rec({ id: 'hosting/D10', tests: ['hosting/T201', 'hosting/T202'] }));
  put('packages/kaal-hosting/06-defects/D11-y.md', rec({ id: 'hosting/D11', tests: [] }));
  put('packages/kaal-hosting/06-defects/x.test.mjs', "test('hosting/T201: a', () => {});\ntest('hosting/T202: b', () => {});\n");
  git('add', '-A'); git('commit', '-q', '-m', 'fix');

  const f = readFacts({ root: dir, base: 'main', baseline: 'main', head: 'fix', body });
  assert.deepEqual(f.defects, ['hosting/D10']);
  assert.equal(f.baseRev, git('rev-parse', 'main').trim());
  assert.equal(f.headRev, git('rev-parse', 'fix').trim());
  assert.deepEqual(f.paths.sort(), ['packages/kaal-hosting/06-defects/D10-x.md', 'packages/kaal-hosting/06-defects/D11-y.md', 'packages/kaal-hosting/06-defects/x.test.mjs', 'packages/kaal-hosting/src/read.mjs']);
  assert.deepEqual(f.lookupDefect('hosting/D10'), { cases: ['hosting/T201', 'hosting/T202'] }, 'a Defect the Hotfix itself brings is read as not recorded');
  assert.deepEqual(f.lookupDefect('hosting/D11'), { cases: [] });
  assert.equal(f.lookupDefect('hosting/D99'), undefined);
  assert.deepEqual(f.caseFiles('hosting/T201'), ['packages/kaal-hosting/06-defects/x.test.mjs'], 'a Case the Hotfix brings is not found on the head');
  assert.equal(f.caseExists('hosting/T20'), false, 'T20 matched as a prefix of T201');
  assert.equal(f.caseExists('hosting/T999'), false);
  assert.throws(() => readFacts({ root: dir, base: 'main', head: 'nope', body }), 'an unresolvable head is read');

  // The Run record of the judge: bound to the revision, per Case, both sides.
  const green = report([t('hosting', 201, 'GREEN'), t('hosting', 202, 'GREEN')]);
  const red = report([t('hosting', 201, 'RED'), t('hosting', 202, 'RED')]);
  const ev = evidenceFrom({ baselineRun: { rev: f.baseRev, report: red }, headRun: { rev: f.headRev, report: green } });
  assert.deepEqual(ev('hosting/T201'), { baseline: { rev: f.baseRev, result: 'RED' }, head: { rev: f.headRev, result: 'GREEN' } });
  const facts = { ...f, caseEvidence: ev };
  assert.equal(judgeHotfixTrace(facts).correction, 'VERIFIED');
  const noBaseline = judgeHotfixTrace({ ...f, caseEvidence: evidenceFrom({ headRun: { rev: f.headRev, report: green } }) });
  assert.equal(noBaseline.correction, 'UNKNOWN', 'GREEN on the head alone was taken as a proof');
  const stale = judgeHotfixTrace({ ...f, caseEvidence: evidenceFrom({ baselineRun: { rev: 'other', report: red }, headRun: { rev: f.headRev, report: green } }) });
  assert.equal(stale.correction, 'UNKNOWN', 'a run bound to another revision was read');

  // The command line: the report is the verdict; the exit status says only that a report was produced.
  const files = (rev, report, name) => { const p = join(dir, name); writeFileSync(p, JSON.stringify({ rev, report })); return p; };
  const cli = (extra, bodyText = body, head = 'fix') => {
    put('body.md', bodyText);
    try { return { code: 0, out: execFileSync(process.execPath, [MOD, '--root', dir, '--base', 'main', '--baseline', 'main', '--head', head, '--body-file', join(dir, 'body.md'), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) }; } catch (e) { return { code: e.status, out: String(e.stdout) }; }
  };
  const none = cli([]);
  assert.equal(none.code, 0, 'a produced report must exit 0: the verdict is the report, not the execution result');
  assert.match(none.out, /^UNKNOWN: trace VALID, correction UNKNOWN/);
  assert.match(none.out, /not judged: .*honest/);
  assert.doesNotMatch(none.out, /\bPASS\b/, 'the report says PASS');
  const b = files(f.baseRev, red, 'b.json');
  const h = files(f.headRev, green, 'h.json');
  const verified = cli(['--baseline-run', b, '--head-run', h]);
  assert.equal(verified.code, 0, 'a verified correction is still a report that exits 0');
  assert.match(verified.out, /^UNKNOWN: trace VALID, correction VERIFIED/);
  assert.match(verified.out, /case hosting\/T201: VERIFIED\ncase hosting\/T202: VERIFIED/);
  const secondRed = files(f.headRev, report([t('hosting', 201, 'GREEN'), t('hosting', 202, 'RED')]), 'h2.json');
  const failing = cli(['--baseline-run', b, '--head-run', secondRed]);
  assert.equal(failing.code, 0, 'a FAIL verdict is a produced report and exits 0');
  assert.match(failing.out, /^FAIL: trace VALID, correction NOT VERIFIED/);
  assert.match(failing.out, /finding: the Case hosting\/T202 is still RED/, 'only the first Case was read');
  const mainGreen = files(f.baseRev, green, 'b2.json');
  assert.match(cli(['--baseline-run', mainGreen, '--head-run', h]).out, /finding: the Case hosting\/T201 is GREEN at the baseline/, 'a Case GREEN on the default branch was taken as an issue');
  const wrongRev = files('0000000000000000000000000000000000000000', red, 'b3.json');
  assert.match(cli(['--baseline-run', wrongRev, '--head-run', h]).out, /^UNKNOWN: trace VALID, correction UNKNOWN/, 'a run of another revision was read');
  const broken = cli([], '## Defect\n\nhosting/D13 only\n');
  assert.equal(broken.code, 0);
  assert.match(broken.out, /^FAIL: trace BROKEN/);
  assert.match(broken.out, /finding: the Defect hosting\/D13 is not recorded/);
  const unreadable = cli([], body, 'nope');
  assert.equal(unreadable.code, 0, 'an unreadable ref is an UNKNOWN report');
  assert.match(unreadable.out, /^UNKNOWN: trace UNREAD/);
  let usage;
  try { execFileSync(process.execPath, [MOD, '--base', 'main'], { stdio: 'ignore' }); } catch (e) { usage = e.status; }
  assert.equal(usage, 2, 'a call that cannot produce a report must exit 2');
}
