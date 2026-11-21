// Fixtures of the Cases of release/C122: a main tree and a pull request's merge result on disk. Not a Case.
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const REPO = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const RM = join(REPO, 'engineering/release-management');
export const RUNNER = join(RM, '05-src/phase/run-controls-act.mjs');
export const ROOT = 'engineering/cap';
export const RETROS = `${ROOT}/02-learnings/retros`;

export const retroText = (n, reflects) => `---
id: cap/RT${n}
format: 4L
reflects: [${reflects.join(', ')}]
---
Account of: I am the cap thread. This is my account only.

## Liked
- subject: a small thing that worked
  keeps: the Case runs the thing and names what it protects.

## Learned
- subject: what the run showed
  source: the log of the run, read directly.

## Lacked
- subject: nothing said how the thing is carried
  decision-point: placing the thing.
  cost: one extra push and a wait.
  findable: no
  address: Skill

## Longed For
- subject: a check before the push
  worked-anyway: I ran the single Case.

Decisions: none made, the owner decides.
`;

const put = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };
const change = (tree, n, name) => {
  const dir = join(tree, ROOT, `00-changes/C${n}-${name}`);
  put(join(dir, `C${n}.md`), `---\nid: cap/C${n}\ntitle: ${name}\n---\n# ${name}\n`);
  put(join(dir, 'change.md'), '# change\n\n## PLAN\n\nthe plan\n');
  put(join(dir, 'do.md'), '# do\n');
};

// The default branch (Change 1, the write map and the scripts of kaal-retro as judges) and the merge result (Change 2 and the retros given, each { n, reflects, text }).
export function makeTrees({ retros = [{ n: 1, reflects: ['cap/C2'] }] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'kaal-act-'));
  const main = join(dir, 'main'), pr = join(dir, 'pr');
  for (const t of [main, pr]) change(t, 1, 'old-thing');
  change(pr, 2, 'first-thing');
  for (const r of retros) put(join(pr, RETROS, `RT${r.n}.md`), r.text ?? retroText(r.n, r.reflects));
  for (const p of ['packages/kaal-retro/skills/kaal-retro/scripts', 'engineering/release-management/05-src/phase/write-map.json']) cpSync(join(REPO, p), join(main, p), { recursive: true });
  return { main, pr, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export const ACT_PATHS = [`${RETROS}/RT1.md`];

// The pull request as Git has it: the merge result (two parents, the base first) of a branch that adds the retros to main's tree.
export function gitMerge(trees) {
  const git = (cwd, ...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
  const repo = mkdtempSync(join(tmpdir(), 'kaal-git-'));
  cpSync(trees.main, repo, { recursive: true });
  git(repo, 'init', '-q', '-b', 'main'); git(repo, 'add', '-A'); git(repo, 'commit', '-qm', 'base');
  git(repo, 'checkout', '-qb', 'pr');
  cpSync(trees.pr, repo, { recursive: true, force: true });
  git(repo, 'add', '-A'); git(repo, 'commit', '-qm', 'pr');
  git(repo, 'checkout', '-q', 'main');
  put(join(repo, 'unrelated.txt'), 'x'); git(repo, 'add', '-A'); git(repo, 'commit', '-qm', 'base moved');
  git(repo, 'merge', '-q', '--no-ff', '-m', 'merge', 'pr');
  return { repo, cleanup: () => rmSync(repo, { recursive: true, force: true }) };
}
