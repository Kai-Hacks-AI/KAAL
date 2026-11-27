// Case release/T1559 tests: release/C152. The product contract of a SYNC (CPO, #2641): the target after the SYNC is in the state it would have reached had its own work started from current main.
// Git ancestry identifies the revisions and supplies evidence; it does not by itself make a SYNC valid, and a comparison of the folders of main and the target is no test either, because the
// work of the target is legitimate. Over real throwaway repositories: the work of the target is preserved, the work of main is incorporated, a change neither side made is not silently
// accepted, a conflict is surfaced and never passed, and what cannot be read is unknown. Applicability and validity stay two answers.
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const SRC = join(repo, 'engineering/release-management/05-src/sync-review');
export const id = 'release/T1559';
export const tests = ['release/C152'];
export const title = 'a SYNC is valid when its result is the target\'s own work on current main: the work of the target preserved, the work of main incorporated, an unintended change, a dropped change and a resolved conflict never pass, an unreadable fact is unknown, and a stale attempt stays a SYNC that is not valid';
export async function run() {
  for (const f of ['applies.mjs', 'facts.mjs', 'verify.mjs']) assert.ok(existsSync(join(SRC, f)), `${f} is absent`);
  const { appliesFromGit } = await import(join(SRC, 'applies.mjs'));
  const { gatherFacts } = await import(join(SRC, 'facts.mjs'));
  const { verifySync } = await import(join(SRC, 'verify.mjs'));
  const dir = mkdtempSync(join(tmpdir(), 'sync-contract-'));
  try {
    const run = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
    const git = (...a) => { const r = run('-c', 'user.name=t', '-c', 'user.email=t@t', ...a); assert.equal(r.status, 0, `git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
    const put = (f, t) => writeFileSync(join(dir, f), t);
    const commit = (msg) => { git('add', '-A'); git('commit', '-q', '-m', msg); return git('rev-parse', 'HEAD'); };
    const show = (rev, f) => { const r = run('show', `${rev}:${f}`); return r.status === 0 ? r.stdout : null; };

    git('init', '-q', '-b', 'main');
    put('shared.txt', 'one\ntwo\nthree\n'); put('conflict.txt', 'base\n'); commit('root');
    git('branch', 'collector');
    put('main-only.txt', 'from main\n'); put('shared.txt', 'ONE\ntwo\nthree\n'); put('conflict.txt', 'main side\n'); commit('main moves on');
    git('checkout', '-q', 'collector');
    put('own.txt', 'the work of the target\n'); put('shared.txt', 'one\ntwo\nTHREE\n'); commit('collector work');

    const judge = (head, { base = 'collector', body = '## Reason\nthe collector takes main.\n' } = {}) => {
      const g = (args) => run(...args);
      const applies = appliesFromGit({ git: g, baseTipRef: base, mainRef: 'main', head });
      const facts = gatherFacts({ git: g, baseRef: 'kaal/release/x', baseTipRef: base, mainRef: 'main', headSha: head, currentHead: head, body });
      return { applies, verdict: verifySync(facts) };
    };
    const sync = (name, tweak, from = 'collector') => { // a merge of main into the collector, optionally tampered with before it is committed
      git('checkout', '-q', '-b', name, from);
      const r = run('-c', 'user.name=t', '-c', 'user.email=t@t', 'merge', '--no-commit', '--no-ff', 'main');
      if (tweak) tweak(r.status !== 0);
      git('add', '-A'); git('commit', '-q', '-m', `${name}`);
      const sha = git('rev-parse', 'HEAD'); git('checkout', '-q', 'collector'); return sha;
    };

    // (1) and (2): the clean result of main into the target keeps both. It is a SYNC and valid, whatever the folder of main says.
    const clean = sync('clean');
    assert.equal(show(clean, 'own.txt'), 'the work of the target\n', 'the work of the target is preserved');
    assert.equal(show(clean, 'main-only.txt'), 'from main\n', 'the work of main is incorporated');
    assert.equal(show(clean, 'shared.txt'), 'ONE\ntwo\nTHREE\n', 'both edits of the shared file are kept');
    assert.notEqual(show(clean, 'own.txt'), show('main', 'own.txt'), 'the folder of main is not the target: the work of the target is legitimate');
    let r = judge(clean);
    assert.equal(r.applies.applies, 'sync'); assert.equal(r.applies.valid, true);
    assert.equal(r.verdict.outcome, 'PASS', JSON.stringify(r.verdict.reasons));

    // (3) not silently accepted: a change that neither side made, the work of the target dropped, the work of main dropped. The shape (two right parents) is the same each time and none passes.
    const tamper = (name, change) => sync(name, change);
    for (const [what, head] of [
      ['an unrelated file added in the merge', tamper('extra', () => put('unrelated.txt', 'nobody asked\n'))],
      ['an unrelated edit of a file neither side changed', tamper('edit', () => put('shared.txt', 'ONE\ntwo\nTHREE\nsneaked\n'))],
      ['the work of the target dropped', tamper('dropped-own', () => rmSync(join(dir, 'own.txt')))],
      ['the work of main dropped', tamper('dropped-main', () => rmSync(join(dir, 'main-only.txt')))],
    ]) {
      r = judge(head);
      assert.equal(r.applies.applies, 'sync', `${what}: still a SYNC attempt`);
      assert.notEqual(r.verdict.outcome, 'PASS', `${what}: must not pass`);
      assert.equal(r.verdict.outcome, 'FAIL', `${what}`);
    }

    // (4) a conflict is surfaced: both sides changed the same line, whoever resolved it, the verdict names the conflict and never passes
    git('checkout', '-q', '-b', 'collector2', 'collector'); put('conflict.txt', 'collector side\n'); commit('the target changes the same line'); git('checkout', '-q', 'collector');
    const resolved = sync('resolved', (conflicted) => { assert.equal(conflicted, true, 'both sides changed the same line, so git cannot merge it'); put('conflict.txt', 'a human chose\n'); }, 'collector2');
    r = judge(resolved, { base: 'collector2' });
    assert.equal(r.applies.applies, 'sync');
    assert.equal(r.verdict.outcome, 'FAIL'); assert.ok(r.verdict.reasons.some((x) => x.code === 'merge-conflicts'), JSON.stringify(r.verdict.reasons));
    // uncertain facts: an object that does not exist is unknown, never a pass and never not-sync
    r = judge('0'.repeat(40));
    assert.notEqual(r.applies.applies, 'not-sync'); assert.notEqual(r.verdict.outcome, 'PASS');

    // applicability and validity are two answers: the collector advances after the SYNC was prepared. It stays a SYNC attempt and is not valid.
    git('checkout', '-q', 'collector'); put('later.txt', 'collector moved\n'); commit('collector moves on');
    r = judge(clean);
    assert.equal(r.applies.applies, 'sync', 'a stale attempt is still an attempt'); assert.equal(r.applies.valid, false);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
