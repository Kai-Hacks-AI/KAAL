// PROVISIONAL, Change lifecycle over a KAAL directory: seal one. Which
// directory is a Change, which are closed and what is wrong with the seals is
// Changing KAAL's script (compass.ts); identity is Sealing's. A Change is closed
// exactly when the ID of its current tree has a seal; there is no status. The
// seal is an empty marker named by the ID, outside the tree it seals.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { changeId, changes, namedTreeId, SEALS, TREE_SEALS, WORK } from "./compass.js";
import { markers } from "./sealing.js";

export { changes, checkChanges, closedChanges, currentWorkId, RETRO, RETRO_OBSERVE, RETRO_OWNER, RETRO_REVIEW, RETRO_WORK, REVIEW, SEALS, sealedIds, sealedTreeIds, TREE_SEALS, WORK } from "./compass.js";

const isChange = (kaalDir: string, change: string): boolean => changes(kaalDir).includes(change.replace(/\/$/, ""));

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
