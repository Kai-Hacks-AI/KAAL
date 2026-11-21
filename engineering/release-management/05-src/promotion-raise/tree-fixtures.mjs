// Fixtures of the Cases of release/C116: a collector tree and a main tree on disk, and the facts read from them. Not a Case.
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { readTree, RETRO_SCRIPTS, WRITE_MAP } from './tree.mjs';
import { decideFromTree } from './final-tree.mjs';

export const REPO = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const TEMPLATE_TEXT = readFileSync(join(REPO, 'engineering/release-management/05-src/wiring/templates/promotion.md'), 'utf8');
export const SHA = 'a'.repeat(40);
export const BASE = 'kaal/cap/small-thing';
const ROOT = 'engineering/cap';
// A well-formed 4L retro (the form of kaal-retro), with its id and what it reflects filled in.
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

const put = (path, text) => { mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, text); };
const change = (tree, n, name, { plan = true, doRecord = true, id = `cap/C${n}` } = {}) => {
  const dir = join(tree, ROOT, `00-changes/C${n}-${name}`);
  put(join(dir, `C${n}.md`), `---\nid: ${id}\ntitle: ${name}\n---\n# ${name}\n`);
  if (plan) put(join(dir, 'change.md'), '# change\n\n## PLAN\n\nthe plan\n');
  if (doRecord) put(join(dir, 'do.md'), '# do\n');
};

// A collector with the Changes given (each { n, name, plan, doRecord, id }), the retros given (each { n, reflects, text }) and main with Change 1 only.
export function makeTree({ changes = [{ n: 2, name: 'first-thing' }], retros = [{ n: 1, reflects: ['cap/C2'] }] } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'kaal-tree-'));
  const main = join(dir, 'main'), collector = join(dir, 'collector');
  change(main, 1, 'old-thing'); change(collector, 1, 'old-thing');
  for (const c of changes) change(collector, c.n, c.name, c);
  for (const r of retros) put(join(collector, ROOT, `02-learnings/retros/RT${r.n}.md`), r.text ?? retroText(r.n, r.reflects));
  return { main, collector, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export const GOOD_PATHS = [`${ROOT}/02-learnings/retros/RT1.md`];
export async function factsOf(tree, changed = GOOD_PATHS) {
  return readTree({ main: tree.main, collector: tree.collector, changed, scripts: join(REPO, RETRO_SCRIPTS), mapFile: join(REPO, WRITE_MAP) });
}
export async function decide(over = {}, treeSpec, changed) {
  const tree = makeTree(treeSpec);
  try {
    return decideFromTree({ merged: true, base: BASE, mergeSha: SHA, number: 77, template: TEMPLATE_TEXT, tree: await factsOf(tree, changed), ...over });
  } finally { tree.cleanup(); }
}
