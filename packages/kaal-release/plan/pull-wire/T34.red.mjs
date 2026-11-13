// Case pull/T34 tests: pull/F35
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T34';
export const tests = ['pull/F35'];
export const title = 'CI runs every engineering Case, logs it under its scoped id as a success or a failure, and a RED Case stays visible';
export async function run() {
  const file = join(repo, 'engineering/cases/cases.test.mjs');
  assert.ok(existsSync(file), 'engineering/cases/cases.test.mjs is absent');
  const pkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
  assert.match(pkg.scripts['test:engineering'], /engineering\/cases\/cases\.test\.mjs/, 'test:engineering does not name the Cases file');
  const { executionsOf } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/pull-promotion/read.mjs')).href);
  const read = (out) => executionsOf([{ job: 'Engineering', text: out.split('\n').map((l) => `2026-01-01T00:00:00.0000000Z ${l}`).join('\n') }], 'head');
  const discover = (root) => { const r = spawnSync(process.execPath, ['--test', '--test-reporter=spec', file], { cwd: repo, encoding: 'utf8', env: { ...process.env, KAAL_CASES_ROOT: root } }); return { out: r.stdout + r.stderr, status: r.status }; };

  // Execution evidence is not success: every real Case is logged, and each passing one reads as a success.
  const dir = join(repo, 'engineering');
  const expected = [];
  for (const scope of readdirSync(dir)) {
    const changes = join(dir, scope, '00-changes');
    if (!existsSync(changes)) continue;
    for (const change of readdirSync(changes)) for (const f of readdirSync(join(changes, change))) if (/^T\d+\.test\.mjs$/.test(f)) expected.push(join(changes, change, f));
  }
  assert.ok(expected.length > 0, 'no engineering Case files found');
  const real = read(discover(dir).out);
  for (const f of expected) {
    const m = await import(pathToFileURL(f).href);
    const e = real.find((x) => x.case === m.id);
    assert.ok(e, `${m.id} has no logged execution`);
    assert.equal(e.conclusion, 'success', `${m.id} is logged but not as a success`);
  }

  // A deliberately failing Case is still an execution: logged as a failure next to a passing one, and the file fails.
  const fx = mkdtempSync(join(tmpdir(), 'kaal-cases-'));
  try {
    const put = (name, body) => { mkdirSync(join(fx, 'demo/00-changes/C1-x'), { recursive: true }); writeFileSync(join(fx, 'demo/00-changes/C1-x', name), body); };
    const head = (id) => `export const id = '${id}'; export const tests = ['demo/F1']; export const title = 'fixture';\n`;
    put('T901.test.mjs', head('demo/T901') + 'export async function run() {}\n');
    put('T902.test.mjs', head('demo/T902') + "export async function run() { throw new Error('RED'); }\n");
    put('T903.test.mjs', "export const title = 'no id'; export async function run() {}\n");
    const ran = discover(fx);
    const got = read(ran.out);
    assert.equal(got.find((x) => x.case === 'demo/T901')?.conclusion, 'success', 'a passing Case is not a success');
    assert.equal(got.find((x) => x.case === 'demo/T902')?.conclusion, 'failure', 'a RED Case is not recognized as a failure');
    assert.notEqual(ran.status, 0, 'a RED Case does not fail the file, so it cannot block');
    assert.ok(!got.some((x) => x.case === 'demo/T903' && x.conclusion === 'success'), 'a Case without a scoped id was accepted');
  } finally { rmSync(fx, { recursive: true, force: true }); }
}
