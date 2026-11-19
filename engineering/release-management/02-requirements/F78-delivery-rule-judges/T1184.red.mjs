// Case release/T1184 tests: F78
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const draft = (name) => readFileSync(join(RM, '00-changes/C101-delivery-control/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { encoding: 'utf8' }).trim();
const CHECKER = 'engineering/change-isolation/check.mjs';
const READER = 'engineering/release-management/05-src/delivery/locations.mjs';
const DECL = 'engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json';
const put = (dir, rel, from) => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); copyFileSync(join(repo, from ?? rel), join(dir, rel)); };
export const id = 'release/T1184';
export const tests = ['release/F78'];
export const title = 'the Change Isolation wrapper, run as the CI job runs it on a scratch repository, reports a mix of delivery and solution and does not say cannot judge';
export async function run() {
  // A scratch origin whose main holds the checker, the reader and the declaration as the target's tip, and a topic branch that mixes a delivery path with a solution path.
  const origin = mkdtempSync(join(tmpdir(), 'c101-origin-'));
  execFileSync('git', ['init', '-q', '--bare', '-b', 'main', origin]);
  const work = mkdtempSync(join(tmpdir(), 'c101-work-'));
  git(work, 'init', '-q', '-b', 'main');
  git(work, 'remote', 'add', 'origin', origin);
  for (const f of [CHECKER, READER, DECL]) put(work, f);
  git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'base');
  const base = git(work, 'rev-parse', 'HEAD');
  git(work, 'push', '-q', 'origin', 'main');
  git(work, 'checkout', '-q', '-b', 'topic');
  mkdirSync(join(work, '.githooks'), { recursive: true }); writeFileSync(join(work, '.githooks/pre-push'), '#!/bin/sh\n');
  mkdirSync(join(work, 'src'), { recursive: true }); writeFileSync(join(work, 'src/y.txt'), 'solution\n');
  git(work, 'add', '-A'); git(work, 'commit', '-q', '-m', 'mix');
  const head = git(work, 'rev-parse', 'HEAD');
  git(work, 'push', '-q', 'origin', 'topic');
  const r = spawnSync('bash', [join(repo, 'engineering/github/change-isolation.sh')], { cwd: work, encoding: 'utf8', env: { ...process.env, GUARD_HEAD: head, GUARD_BASE: base, GUARD_BASE_REF: 'main', KAAL_DEFAULT: 'main' } });
  const out = r.stdout + r.stderr;
  assert.equal(r.status, 0, `the gate must still pass: ${out}`);
  assert.doesNotMatch(out, /cannot judge/, `the detective rule could not judge: ${out}`);
  assert.match(out, /detective \(not gating\): delivery travels apart from solution: src\/y\.txt is not a delivery path/);
}
