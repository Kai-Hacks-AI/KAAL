// PROVISIONAL, Change lifecycle over a KAAL directory: find the Changes, seal
// one, and answer which are closed. Identity is change-id.ts alone. A Change is
// closed exactly when the ID of its current tree has a seal; there is no status.
// The seal is an empty marker named by the ID, outside the tree it seals.
import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { changeId, namedTreeId } from "./change-id.js";
import { markers } from "./sealing.js";

/** Where Change seals live, relative to the KAAL directory; Node seals (seals/<ID>) are not touched. */
export const SEALS = "seals/changes";
/** Where named-tree seals live, beside Change seals and likewise outside the tree they seal. */
export const TREE_SEALS = "seals/trees";
/** The Work of a Change is its directory work/, its review is the rounds in review/, and its retrospectives are retro-work.md (from the
 * Work's seat) and retro-review.md (from the review's seat). retro-observe.md and retro.md are historical forms, valid only in Changes
 * closed before them: retro-observe.md was the second retrospective before review was a step, retro.md the single one before that. */
export const WORK = "work";
export const REVIEW = "review";
export const RETRO_WORK = "retro-work.md";
export const RETRO_REVIEW = "retro-review.md";
export const RETRO_OBSERVE = "retro-observe.md";
export const RETRO = "retro.md";

const dirs = (path: string): string[] => (existsSync(path) ? readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);

/** Every Change directory, changes/<name>/YY/MM/DD/CC/, relative to the KAAL directory, in order. */
export function changes(kaalDir: string): string[] {
  const found: string[] = [];
  const base = join(kaalDir, "changes");
  for (const name of dirs(base).filter((n) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n)))
    for (const yy of dirs(join(base, name)).filter((n) => /^\d{2}$/.test(n)))
      for (const mm of dirs(join(base, name, yy)).filter((n) => /^\d{2}$/.test(n)))
        for (const dd of dirs(join(base, name, yy, mm)).filter((n) => /^\d{2}$/.test(n)))
          for (const cc of dirs(join(base, name, yy, mm, dd)).filter((n) => /^(0[1-9]|[1-9]\d)$/.test(n))) found.push(`changes/${name}/${yy}/${mm}/${dd}/${cc}`);
  return found;
}

/** The Change IDs sealed in this KAAL directory. */
export const sealedIds = (kaalDir: string): string[] => markers.sealed(join(kaalDir, SEALS));

/** The named-tree IDs sealed in this KAAL directory. */
export const sealedTreeIds = (kaalDir: string): string[] => markers.sealed(join(kaalDir, TREE_SEALS));

const isChange = (kaalDir: string, change: string): boolean => changes(kaalDir).includes(change.replace(/\/$/, ""));

/** The named-tree ID of a Change's current work/, or undefined when it has none or none can be identified. */
export function currentWorkId(kaalDir: string, change: string): string | undefined {
  const work = join(kaalDir, change, WORK);
  if (!existsSync(work) || !lstatSync(work).isDirectory()) return undefined;
  try {
    return namedTreeId(work);
  } catch {
    return undefined;
  }
}

/** Seal the Work of one Change: record the ID of its current work/ tree. Returns the ID; sealing again changes nothing. */
export function sealWork(kaalDir: string, change: string): string {
  if (!isChange(kaalDir, change)) throw new Error(`${change} is not a Change directory of ${kaalDir}`);
  const work = join(kaalDir, change, WORK);
  if (!existsSync(work)) throw new Error(`${change} has no ${WORK}/`);
  const id = namedTreeId(work);
  markers.seal(join(kaalDir, TREE_SEALS), id);
  return id;
}

/** Seal one Change: record the ID of its complete current tree. Returns the ID; sealing again changes nothing. */
export function sealChange(kaalDir: string, change: string): string {
  if (!isChange(kaalDir, change)) throw new Error(`${change} is not a Change directory of ${kaalDir}`);
  const id = changeId(join(kaalDir, change));
  markers.seal(join(kaalDir, SEALS), id);
  return id;
}

/** The closed Changes: each Change whose current tree has a seal, as {path, id}. Open or unreadable Changes are not closed. */
export function closedChanges(kaalDir: string): { path: string; id: string }[] {
  const sealed = new Set(sealedIds(kaalDir));
  const closed: { path: string; id: string }[] = [];
  for (const path of changes(kaalDir)) {
    let id: string;
    try {
      id = changeId(join(kaalDir, path));
    } catch {
      continue;
    }
    if (sealed.has(id)) closed.push({ path, id });
  }
  return closed;
}

/**
 * The problems with this KAAL directory's Change and Work seals; empty means
 * none. A seal that no Change (or Change's work/) currently matches means
 * sealed history was altered or removed; a closed Change that has a work/ whose
 * seal is gone means the same.
 */
export function checkChanges(kaalDir: string): string[] {
  const closed = closedChanges(kaalDir);
  const live = new Set(closed.map((c) => c.id));
  const problems = sealedIds(kaalDir).filter((id) => !live.has(id)).map((id) => `${SEALS}/${id} matches no Change: a sealed Change was altered or removed`);
  const works = changes(kaalDir).map((c) => ({ change: c, id: currentWorkId(kaalDir, c) }));
  const sealedWork = new Set(sealedTreeIds(kaalDir));
  const present = new Set(works.map((w) => w.id));
  for (const id of sealedWork) if (!present.has(id)) problems.push(`${TREE_SEALS}/${id} matches no work/: sealed work was altered or removed`);
  for (const c of closed) {
    const w = works.find((x) => x.change === c.path);
    if (w && existsSync(join(kaalDir, w.change, WORK)) && !(w.id && sealedWork.has(w.id))) problems.push(`${c.path} is closed but its ${WORK}/ is not sealed`);
  }
  return problems;
}
