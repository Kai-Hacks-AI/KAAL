// Case pull/T35 tests: pull/F36
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
export const id = 'pull/T35';
export const tests = ['pull/F36'];
export const title = 'the history of a synchronized collector is its first-parent line, a SYNC brings no evidence, and a history that is not one line fails closed';

const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd, encoding: 'utf8' }).trim();
const commit = (cwd, name) => { writeFileSync(join(cwd, name), name); git(cwd, 'add', '-A'); git(cwd, 'commit', '-q', '-m', name); return git(cwd, 'rev-parse', 'HEAD'); };

// The host's records for a branch against main, as git itself reports them.
const records = (cwd, branch) => {
  const ids = git(cwd, 'rev-list', '--reverse', branch, '^main').split('\n').filter(Boolean);
  return {
    commits: ids.map((sha) => ({ sha, parents: git(cwd, 'rev-list', '--parents', '-n', '1', sha).split(' ').slice(1).map((p) => ({ sha: p })) })),
    mergeBase: git(cwd, 'merge-base', 'main', branch),
    head: git(cwd, 'rev-parse', branch),
  };
};

export async function run() {
  const read = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/pull-promotion/read.mjs')).href);
  const dir = mkdtempSync(join(tmpdir(), 'kaal-history-'));
  try {
    // main m1; collector c1 c2; main m2; SYNC pull request 1 (a branch from the collector tip that merges main, merged with a merge commit);
    // c3; main m3; SYNC pull request 2 the same way; c4; main m4; a SYNC by a direct merge of main; c5.
    git(dir, 'init', '-q', '-b', 'main');
    const m1 = commit(dir, 'm1');
    git(dir, 'checkout', '-q', '-b', 'collector');
    const c1 = commit(dir, 'c1'); const c2 = commit(dir, 'c2');
    const syncPr = (n) => {
      git(dir, 'checkout', '-q', 'main'); const m = commit(dir, `m${n}`);
      git(dir, 'checkout', '-q', '-b', `sync${n}`, 'collector'); git(dir, 'merge', '-q', '--no-ff', '-m', `s${n}b`, 'main'); const branchTip = git(dir, 'rev-parse', 'HEAD');
      git(dir, 'checkout', '-q', 'collector'); git(dir, 'merge', '-q', '--no-ff', '-m', `s${n}`, `sync${n}`); return { m, branchTip, merge: git(dir, 'rev-parse', 'HEAD') };
    };
    const p1 = syncPr(2); const c3 = commit(dir, 'c3');
    const p2 = syncPr(3); const c4 = commit(dir, 'c4');
    git(dir, 'checkout', '-q', 'main'); const m4 = commit(dir, 'm4');
    git(dir, 'checkout', '-q', 'collector'); git(dir, 'merge', '-q', '--no-ff', '-m', 's4', 'main'); const s4 = git(dir, 'rev-parse', 'HEAD');
    const c5 = commit(dir, 'c5');
    const s1 = p1.merge; const s2 = p2.merge;
    const { commits, mergeBase, head } = records(dir, 'collector');
    const line = [c1, c2, s1, c3, s2, c4, s4, c5];
    const m2 = p1.m; const m3 = p2.m;
    // The line, oldest first, ending at the head; no commit of main; the same whatever order the host lists them.
    assert.deepEqual(read.historyOf(commits, mergeBase, head), line, 'the first-parent line of a synchronized collector was not read');
    assert.deepEqual(read.historyOf([...commits].reverse(), mergeBase, head), line, 'the order the host listed the commits changed the history');
    for (const m of [m1, m2, m3, m4, p1.branchTip, p2.branchTip]) assert.ok(!read.historyOf(commits, mergeBase, head).includes(m), 'a commit of main, or the branch of a SYNC, was read as collector work');

    // A SYNC brings no paths: its place stays, its files are not read.
    const fake = (cs, mb, hd, mainHas = () => true) => async (path) => {
      if (path.includes('/branches/')) return { commit: { sha: hd } };
      const against = /\/compare\/main\.\.\.([0-9a-f]{40})$/.exec(path);
      if (against && against[1] !== hd) return { status: mainHas(against[1]) ? 'behind' : 'diverged' };
      if (path.includes('/compare/')) return { files: [], total_commits: cs.length, commits: cs, merge_base_commit: { sha: mb } };
      if (path.includes('/git/trees/')) return { tree: [] };
      if (path.includes('/check-runs')) return { check_runs: [] };
      const sha = path.split('/commits/')[1];
      return { files: [{ filename: sha === s1 || sha === s2 || sha === s4 ? 'from-main.txt' : `own-${sha.slice(0, 4)}.txt`, status: 'added' }] };
    };
    const decl = { collectors: [{ name: 'collector' }], evidence: {} };
    const facts = await read.readFacts('o/r', decl, fake(commits, mergeBase, head), async () => '');
    const byId = Object.fromEntries(facts.collectors[0].history.map((h) => [h.id, h.paths]));
    assert.deepEqual(facts.collectors[0].history.map((h) => h.id), line, 'the facts do not carry the first-parent line');
    assert.deepEqual(byId[s1], [], 'a SYNC brought paths into the evidence');
    assert.deepEqual(byId[s2], [], 'a SYNC brought paths into the evidence');
    assert.deepEqual(byId[s4], [], 'a SYNC brought paths into the evidence');
    assert.equal(byId[c1].length, 1, 'a collector commit lost its paths');

    // A merge is not a SYNC by its parent count. A real development branch (not main) merged into the collector carries work: it fails closed.
    git(dir, 'checkout', '-q', '-b', 'dev', c5); const d1 = commit(dir, 'd1');
    git(dir, 'checkout', '-q', 'collector'); git(dir, 'merge', '-q', '--no-ff', '-m', 'dev', 'dev'); const devMerge = git(dir, 'rev-parse', 'HEAD');
    const withDev = records(dir, 'collector');
    assert.throws(() => read.historyOf(withDev.commits, withDev.mergeBase, withDev.head), /could not order the history/, 'a development branch merged into the collector was read as a SYNC');
    const warned = [];
    const devFacts = await read.readFacts('o/r', decl, fake(withDev.commits, withDev.mergeBase, withDev.head), async () => '', (w) => warned.push(w));
    assert.ok(!devFacts.collectors[0].history && /could not order the history/.test(warned.join()), 'the work of a merged development branch was dropped, not refused');
    assert.ok(withDev.commits.some((c) => c.sha === d1) && withDev.commits.some((c) => c.sha === devMerge), 'the fixture did not merge the development branch');
    git(dir, 'reset', '-q', '--hard', c5);
    // A merge of the collector's own earlier commit is the collector's work: its files are read, not discarded.
    const own2 = git(dir, 'commit-tree', '-p', c5, '-p', c2, '-m', 'own', `${c5}^{tree}`);
    git(dir, 'update-ref', 'refs/heads/collector', own2);
    const ownRec = records(dir, 'collector');
    const ownFacts = await read.readFacts('o/r', decl, fake(ownRec.commits, ownRec.mergeBase, ownRec.head), async () => '');
    assert.equal(ownFacts.collectors[0].history.find((h) => h.id === own2).paths.length, 1, 'a merge of the collector\'s own commit was taken as a SYNC');
    // A purported SYNC whose second parent main does not contain is refused.
    const forged = []; const forgedFacts = await read.readFacts('o/r', decl, fake(commits, mergeBase, head, (p) => p !== m4), async () => '', (w) => forged.push(w));
    assert.ok(!forgedFacts.collectors[0].history && /main does not contain it/.test(forged.join()), 'a purported SYNC that main does not contain was accepted');
    git(dir, 'update-ref', 'refs/heads/collector', c5);

    // Fail closed.
    const closed = /could not order the history/;
    assert.throws(() => read.historyOf(commits, mergeBase, 'f'.repeat(40)), closed, 'a head that is not listed was accepted');
    assert.throws(() => read.historyOf(commits.filter((c) => c.sha !== c3), mergeBase, head), closed, 'a commit the host left out was accepted');
    assert.throws(() => read.historyOf(commits.map((c) => (c.sha === c4 ? { sha: c.sha } : c)), mergeBase, head), closed, 'a commit without parents was accepted');
    const own = 'b'.repeat(40);
    assert.throws(() => read.historyOf([...commits, { sha: own, parents: [{ sha: c1 }] }].map((c) => (c.sha === s2 ? { ...c, parents: [...c.parents, { sha: own }] } : c)), mergeBase, head), closed, 'a collector commit that is not a merge of main, on a merged branch, was accepted');
    assert.throws(() => read.historyOf(commits.map((c) => (c.sha === p1.branchTip ? { ...c, parents: [{ sha: m1 }, ...c.parents.slice(1)] } : c)), mergeBase, head), closed, 'a merged branch that does not grow from the line was accepted');
    assert.throws(() => read.historyOf([...commits, { sha: 'a'.repeat(40), parents: [{ sha: m1 }] }], mergeBase, head), closed, 'a commit that is not an ancestor of the head was accepted');

    // An unsynchronized, linear collector keeps its history.
    git(dir, 'checkout', '-q', '-b', 'linear', m1); const l1 = commit(dir, 'l1'); const l2 = commit(dir, 'l2');
    const lin = records(dir, 'linear');
    assert.deepEqual(read.historyOf(lin.commits, lin.mergeBase, lin.head), [l1, l2], 'a linear collector changed its history');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
