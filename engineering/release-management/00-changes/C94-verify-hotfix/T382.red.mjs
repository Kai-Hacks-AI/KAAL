// Case release/T382 tests: release/F71 (the facts read as Git data)
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
export const title = 'the facts are read as Git data from the base: the Defect chapter, a recorded Defect and its Cases, a Case that exists; a Defect added by the Hotfix itself is not recorded; the command line prints FAIL or UNKNOWN, never PASS, and exits 0 whenever a report is produced and 2 only when none can be; an absent Run record is UNKNOWN; the Run record is read per Case';
export async function run() {
  assert.ok(existsSync(MOD), 'the verify Hotfix module is absent');
  const { defectsOf, readFacts, judgeHotfixTrace } = await load();
  const body = '## Change\n\nhosting/C1 fix\n\n## Defect\n\n<!-- hosting/D99 in a comment -->\nhosting/D10 is broken in main.\n\n## Urgency\n\nhosting/D11 is mentioned outside the chapter\n';
  assert.deepEqual(defectsOf(body), ['hosting/D10'], 'the Defect chapter is not read alone, or a comment counts');
  assert.deepEqual(defectsOf('## Defect\n\nhosting/D10 and hosting/D11 and hosting/D10\n'), ['hosting/D10', 'hosting/D11']);
  assert.deepEqual(defectsOf('## Change\n\nx\n'), []);

  const dir = mkdtempSync(join(tmpdir(), 'hotfix-'));
  const git = (...a) => execFileSync('git', ['-C', dir, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' });
  const put = (p, t) => { mkdirSync(join(dir, p, '..'), { recursive: true }); writeFileSync(join(dir, p), t); };
  git('init', '-q', '-b', 'main');
  const rec = (o) => `# hosting/D10\n\n\`\`\`json\n${JSON.stringify(o)}\n\`\`\`\n`;
  put('packages/kaal-hosting/06-defects/D10-x.md', rec({ id: 'hosting/D10', tests: ['hosting/T201', 'hosting/T202'] }));
  put('packages/kaal-hosting/06-defects/D11-y.md', rec({ id: 'hosting/D11', tests: [] }));
  put('packages/kaal-hosting/06-defects/D12-z.md', rec({ id: 'hosting/D12', tests: ['hosting/T20'] }));
  put('packages/kaal-hosting/06-defects/x.mjs', "test('hosting/T201: a', () => {});\ntest('hosting/T202: b', () => {});\n");
  put('packages/kaal-hosting/src/read.mjs', 'export const a = 1;\n');
  git('add', '-A'); git('commit', '-q', '-m', 'base');
  git('checkout', '-q', '-b', 'fix');
  put('packages/kaal-hosting/src/read.mjs', 'export const a = 2;\n');
  put('packages/kaal-hosting/06-defects/D13-new.md', rec({ id: 'hosting/D13', tests: ['hosting/T201'] }));
  git('add', '-A'); git('commit', '-q', '-m', 'fix');

  const f = readFacts({ root: dir, base: 'main', head: 'fix', body });
  assert.deepEqual(f.defects, ['hosting/D10']);
  assert.deepEqual(f.paths.sort(), ['packages/kaal-hosting/06-defects/D13-new.md', 'packages/kaal-hosting/src/read.mjs']);
  assert.deepEqual(f.lookupDefect('hosting/D10'), { cases: ['hosting/T201', 'hosting/T202'] });
  assert.deepEqual(f.lookupDefect('hosting/D11'), { cases: [] });
  assert.equal(f.lookupDefect('hosting/D13'), undefined, 'a Defect recorded only by the Hotfix itself is read as recorded');
  assert.equal(f.lookupDefect('hosting/D99'), undefined);
  assert.equal(f.caseExists('hosting/T201'), true);
  assert.equal(f.caseExists('hosting/T20'), false, 'T20 matched as a prefix of T201');
  assert.equal(f.caseExists('hosting/T999'), false);
  assert.throws(() => readFacts({ root: dir, base: 'main', head: 'nope', body }), 'an unresolvable head is read');

  const run = (extra, bodyText, head = 'fix') => {
    put('body.md', bodyText);
    try { return { code: 0, out: execFileSync(process.execPath, [MOD, '--root', dir, '--base', 'main', '--head', head, '--body-file', join(dir, 'body.md'), ...extra], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) }; } catch (e) { return { code: e.status, out: String(e.stdout) }; }
  };
  const noEvidence = run([], body);
  assert.equal(noEvidence.code, 0, 'a produced report must exit 0: the verdict is the report, not the execution result');
  assert.match(noEvidence.out, /^UNKNOWN: trace VALID, correction UNKNOWN/);
  assert.match(noEvidence.out, /not judged: .*minimal/);
  assert.doesNotMatch(noEvidence.out, /\bPASS\b/, 'the report says PASS');
  const rev = (r) => git('rev-parse', r).trim();
  const evFile = join(dir, 'ev.json');
  const ok = (c) => ({ baseline: { rev: rev('main'), result: 'RED' }, head: { rev: rev('fix'), result: c } });
  writeFileSync(evFile, JSON.stringify({ 'hosting/T201': ok('GREEN'), 'hosting/T202': ok('GREEN') }));
  const verified = run(['--evidence', evFile], body);
  assert.equal(verified.code, 0, 'a verified correction is still a report that exits 0');
  assert.match(verified.out, /^UNKNOWN: trace VALID, correction VERIFIED/);
  assert.match(verified.out, /case hosting\/T201: VERIFIED\ncase hosting\/T202: VERIFIED/);
  writeFileSync(evFile, JSON.stringify({ 'hosting/T201': ok('GREEN'), 'hosting/T202': ok('RED') }));
  const second = run(['--evidence', evFile], body);
  assert.equal(second.code, 0, 'a FAIL verdict is a produced report and exits 0');
  assert.match(second.out, /^FAIL: trace VALID, correction NOT VERIFIED/);
  assert.match(second.out, /finding: the Case hosting\/T202 is still RED/, 'only the first Case was read');
  writeFileSync(evFile, JSON.stringify({ 'hosting/T201': ok('GREEN') }));
  assert.match(run(['--evidence', evFile], body).out, /^UNKNOWN: trace VALID, correction UNKNOWN[\s\S]*not judged: .*hosting\/T202/, 'a Case without evidence is taken as verified');
  const broken = run([], '## Defect\n\nhosting/D13 only\n');
  assert.equal(broken.code, 0);
  assert.match(broken.out, /^FAIL: trace BROKEN/);
  assert.match(broken.out, /finding: the Defect hosting\/D13 is not recorded/);
  const unreadable = run([], body, 'nope');
  assert.equal(unreadable.code, 0, 'an unreadable ref is an UNKNOWN report');
  assert.match(unreadable.out, /^UNKNOWN: trace UNREAD/);
  let usage;
  try { execFileSync(process.execPath, [MOD, '--base', 'main'], { stdio: 'ignore' }); } catch (e) { usage = e.status; }
  assert.equal(usage, 2, 'a call that cannot produce a report must exit 2');
  assert.equal(judgeHotfixTrace({ defects: ['a/D1'], paths: ['x'] }).verdict, 'FAIL');
}
