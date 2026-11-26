// Fixtures of the Cases of release/C123: the three folders of isolate Changes on disk (before, after, contained), no Git. Not a Case.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeTrees } from '../C122-act-judges-workflow/act-fixtures.mjs';

export const RM = fileURLToPath(import.meta.url).split('/00-changes/')[0];
export const RUNNER = join(RM, '05-src/phase/run-controls-act.mjs');
export const LIB = join(RM, '05-src/phase/lib/isolate-changes.mjs');
export const OWN_PATH = 'engineering/cap/00-changes/C2-first-thing/C2.md';   // outside the folders an ACT writes
export const RETRO_PATH = 'engineering/cap/02-learnings/retros/RT1.md';       // a folder an ACT writes

const put = (dir, path, text) => { if (text === null) { rmSync(join(dir, path), { force: true }); return; } mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); };

// `after` is the merge result of makeTrees; `before` and `contained` start as copies of it and each path of `specs` ({ path, before, after, contained }) says its text in the three
// folders (null: absent, undefined: as in `after`). `main` is the default branch the judges read their write map and scripts from.
export function makeFolders(specs, { retros } = {}) {
  const t = makeTrees(retros ? { retros } : undefined);
  const before = `${t.pr}-before`, contained = `${t.pr}-contained`;
  cpSync(t.pr, before, { recursive: true }); cpSync(t.pr, contained, { recursive: true });
  for (const s of specs) {
    if (s.after !== undefined) put(t.pr, s.path, s.after);
    put(before, s.path, s.before === undefined ? s.after : s.before);
    put(contained, s.path, s.contained === undefined ? s.after : s.contained);
  }
  return { main: t.main, after: t.pr, before, contained, cleanup: () => { rmSync(before, { recursive: true, force: true }); rmSync(contained, { recursive: true, force: true }); t.cleanup(); } };
}
