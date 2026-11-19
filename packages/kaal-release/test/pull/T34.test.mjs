// Case pull/T34 tests: pull/F35
// Self-contained: it does not load the gatherer. It pins the log-line shape the gatherer reads
// (a timestamp, then a mark and a scoped id) and shows that the Cases file produces it for a success, a RED Case and a Case with no id.
// Compatibility with the real gatherer is shown by integration evidence (test/pull/evidence/), not by an import.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T34';
export const tests = ['pull/F35'];
export const title = 'CI runs every engineering Case, logs it under its scoped id as a success or a failure, and a RED Case stays visible';

// The shape of an execution line in a job log, as pull/F33 reads it: timestamp, mark, scoped id.
const LINE = /^(\d{4}-\d\d-\d\dT[\d:.]+Z)\s+\s*(✔|✖|√|×)\s+([a-z][a-z-]*\/T\d+)\b/u;
const read = (out) => out.split('\n').map((l) => `2026-01-01T00:00:00.0000000Z ${l}`).map((l) => LINE.exec(l)).filter(Boolean).map((m) => ({ case: m[3], ok: m[2] === '✔' || m[2] === '√' }));

const file = join(repo, 'engineering/cases/cases.test.mjs');
const discover = (root) => {
  // A child of a node:test run must not inherit its context, or it reports to the parent instead of printing the log lines.
  const env = { ...process.env, KAAL_CASES_ROOT: root };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=spec', file], { cwd: repo, encoding: 'utf8', env });
  return { out: r.stdout + r.stderr, status: r.status };
};

export async function run() {
  assert.ok(existsSync(file), 'engineering/cases/cases.test.mjs is absent');
  const pkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
  assert.match(pkg.scripts['test:engineering'], /engineering\/cases\/cases\.test\.mjs/, 'test:engineering does not name the Cases file');

  // Every real Case has a logged execution, and each passing one reads as a success (execution evidence, not only success).
  const dir = join(repo, 'engineering');
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  const expected = [];
  for (const scope of readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    for (const part of readdirSync(join(dir, scope.name), { withFileTypes: true })) {
      if (!part.isDirectory() || !/^0[0-6]-/.test(part.name)) continue;
      for (const f of walk(join(dir, scope.name, part.name))) {
        const m = /\/T\d+\.test\.mjs$/.test(f) && /export const id = '([^']+)'/.exec(readFileSync(f, 'utf8'));
        if (m) expected.push(m[1]);
      }
    }
  }
  assert.ok(expected.length > 0, 'no engineering Case files found');
  const real = discover(dir);
  const logged = read(real.out);
  for (const caseId of expected) {
    const e = logged.find((x) => x.case === caseId);
    assert.ok(e, `${caseId} has no logged execution`);
    assert.ok(e.ok, `${caseId} is logged but not as a success`);
  }
  assert.equal(real.status, 0, 'the real Cases do not all pass');

  // A deliberately failing Case is still an execution: logged as a failure next to a passing one, and the file fails.
  const fx = mkdtempSync(join(tmpdir(), 'kaal-cases-'));
  try {
    const put = (name, body) => { mkdirSync(join(fx, 'demo/00-changes/C1-x'), { recursive: true }); writeFileSync(join(fx, 'demo/00-changes/C1-x', name), body); };
    const head = (caseId) => `export const id = '${caseId}'; export const tests = ['demo/F1']; export const title = 'fixture';\n`;
    put('T901.test.mjs', head('demo/T901') + 'export async function run() {}\n');
    put('T902.test.mjs', head('demo/T902') + "export async function run() { throw new Error('RED'); }\n");
    put('T903.test.mjs', "export const title = 'no id'; export async function run() {}\n");
    const ran = discover(fx);
    const got = read(ran.out);
    assert.equal(got.find((x) => x.case === 'demo/T901')?.ok, true, 'a passing Case is not a success');
    assert.equal(got.find((x) => x.case === 'demo/T902')?.ok, false, 'a RED Case is not recognized as a failure');
    assert.notEqual(ran.status, 0, 'a RED Case does not fail the file, so it cannot block');
    assert.ok(!got.some((x) => x.case.endsWith('T903') && x.ok), 'a Case without a scoped id was accepted');
  } finally { rmSync(fx, { recursive: true, force: true }); }
}
