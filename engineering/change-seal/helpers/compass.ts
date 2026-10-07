// PROVISIONAL. The Changing KAAL capability's process and layout, reached by its
// script in the package and not through any public surface (a Skill's scripts
// are not an API). It is the one definition of where a Change is, of which
// directory is a Change and which a named tree; the helpers here bind it to
// Sealing's identity and markers and add the steps that write seals.
import { identity, markers } from "./sealing.js";

const SCRIPTS = new URL("../../../../packages/kaal-changing/skills/kaal-changing/scripts/", import.meta.url);

export type Stage =
  | "WORK OPEN"
  | "REVIEW CONVERGED"
  | "WORK SEALED"
  | "RETRO-WORK PRESENT"
  | "RETRO-OWNER PRESENT"
  | "RETROS PRESENT"
  | "CHANGE CLOSED"
  | "SEALED HISTORY DAMAGED";

export interface State {
  stage: Stage;
  /** What is allowed next. */
  next: string;
  /** What is wrong; empty means nothing. */
  problems: string[];
  /** The identity of work/ as it now stands, when it has one: what a review round names. */
  work?: string;
}

export interface Compass {
  changeId(dir: string): string;
  namedTreeId(dir: string): string;
  sealedIds(kaalDir: string): string[];
  sealedTreeIds(kaalDir: string): string[];
  currentWorkId(kaalDir: string, change: string): string | undefined;
  closedChanges(kaalDir: string): { path: string; id: string }[];
  checkChanges(kaalDir: string): string[];
  stateOf(kaalDir: string, change: string): State;
}
interface Script {
  SEALS: string;
  TREE_SEALS: string;
  WORK: string;
  REVIEW: string;
  RETRO_WORK: string;
  RETRO_REVIEW: string;
  RETRO_OWNER: string;
  RETRO_OBSERVE: string;
  RETRO: string;
  present(kaalDir: string, change: string, name: string): boolean;
  changes(kaalDir: string): string[];
  compass(sealing: { identity: unknown; markers: unknown }): Compass;
}

const script: Script = await import(new URL("change-state.mjs", SCRIPTS).href);

export const { SEALS, TREE_SEALS, WORK, REVIEW, RETRO_WORK, RETRO_REVIEW, RETRO_OWNER, RETRO_OBSERVE, RETRO, present, changes } = script;
export const { changeId, namedTreeId, sealedIds, sealedTreeIds, currentWorkId, closedChanges, checkChanges, stateOf } = script.compass({ identity, markers });
