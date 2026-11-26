// Case release/T1556 tests: release/D20
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const MODULE = join(repo, 'engineering/release-management/05-src/sync-review/applies.mjs');
export const id = 'release/T1556';
export const tests = ['release/D20'];
export const title = 'verify Sync decides what it applies to from the git content of the head: a merge of main into the collector is a SYNC whatever the title, any other head is not, and what cannot be read is unknown';
export async function run() {
  assert.ok(existsSync(MODULE), 'the applicability function is absent');
  const { appliesFromGit } = await import(MODULE);
  const dir = mkdtempSync(join(tmpdir(), 'sync-'));
  const git = (...a) => { const r = spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  const commit = (file, msg) => { writeFileSync(join(dir, file), msg); git('add', '-A'); git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', msg); return git('rev-parse', 'HEAD'); };
  git('init', '-q', '-b', 'main');
  commit('a', 'root');
  git('branch', 'collector');
  commit('m', 'main moves on');
  git('checkout', '-q', 'collector');
  const own = commit('c', 'collector work');
  const tip = (ref) => git('rev-parse', ref);
  const runIt = (head, extra = {}) => appliesFromGit({ git: (args) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8' }), baseTipRef: 'collector', mainRef: 'main', head, ...extra });

  const plain = commit('d', 'SYNC: a plain commit with the title of a SYNC');
  assert.equal((await runIt(plain)).applies, 'not-sync', 'a title does not make a SYNC');

  git('checkout', '-q', '-b', 'side', 'collector~1');
  commit('s', 'other collector work');
  git('checkout', '-q', 'collector');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '-q', '--no-ff', '-m', 'merge two collector lines', 'side');
  assert.equal((await runIt(tip('HEAD'))).applies, 'not-sync', 'a merge of two collector commits is not a SYNC');

  git('checkout', '-q', '-b', 'syncing', 'collector');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '-q', '--no-ff', '-m', 'whatever the title', 'main');
  const good = await runIt(tip('HEAD'), { baseTipRef: 'collector' });
  assert.equal(good.applies, 'sync', 'a merge of main into the collector is a SYNC'); assert.equal(good.valid, true);
  // Stale base: the SYNC was prepared against an older collector tip, then the collector advanced.
  const prepared = tip('HEAD');
  git('checkout', '-q', 'collector');
  commit('late', 'collector advances after the SYNC was prepared');
  const stale = await runIt(prepared, { baseTipRef: 'collector' });
  assert.equal(stale.applies, 'sync', 'a SYNC against an older tip stays a SYNC when the collector advances');
  assert.equal(stale.valid, false, 'a stale base is judged invalid, not passed'); assert.match(String(stale.reason), /stale base/);
  // Ambiguous shape: an octopus merge is unknown.
  // A real octopus: the second side line is not yet in the collector, or git would drop the redundant parent and leave a plain two-parent merge.
  git('checkout', '-q', '-b', 'side2', 'collector~1');
  commit('s2', 'a second collector line, not merged yet');
  git('checkout', '-q', '-b', 'octo', 'collector');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '-q', '--no-ff', '-m', 'octopus', 'main', 'side2');
  assert.equal(git('rev-list', '--parents', '-n', '1', 'HEAD').split(' ').length - 1, 3, 'the octopus has three parents');
  assert.equal((await runIt(tip('HEAD'))).applies, 'unknown', 'an ambiguous shape is unknown, never not-sync');

  assert.equal((await runIt('0'.repeat(40))).applies, 'unknown', 'an absent head is unknown');
}
