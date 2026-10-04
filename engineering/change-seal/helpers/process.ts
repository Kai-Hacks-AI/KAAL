// PROVISIONAL, where a Change is in the process work -> seal work -> retro ->
// seal Change, and what may happen next. State is derived from the artifacts
// and their seals alone; nothing is written to say a phase has been reached.
// This is the one evaluator: the commands consult it and none keeps its own
// idea of the order. It knows nothing of Git, GitHub, branches, PRs or CI.
// Changing KAAL owns the process, so this is a candidate to move beside it; the
// sealing it calls on is the primitive in changes.ts.
import { existsSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { changeId } from "./change-id.js";
import { changes, checkChanges, currentWorkId, RETRO, sealChange, sealedIds, sealedWorkIds, sealWork, WORK } from "./changes.js";

export type Stage = "WORK OPEN" | "WORK SEALED" | "RETRO PRESENT" | "CHANGE CLOSED";

export interface State {
  stage: Stage;
  /** What is allowed next. */
  next: string;
  /** What is wrong; empty means nothing. */
  problems: string[];
}

const retroPresent = (kaalDir: string, change: string): boolean => {
  const file = join(kaalDir, change, RETRO);
  return existsSync(file) && lstatSync(file).isFile();
};

/** Where this Change is, and what is allowed next. */
export function stateOf(kaalDir: string, change: string): State {
  const path = change.replace(/\/$/, "");
  if (!changes(kaalDir).includes(path)) throw new Error(`${change} is not a Change directory of ${kaalDir}`);
  // Sealed Work or Change history that was altered or removed is reported with whatever state results.
  const problems = checkChanges(kaalDir);
  let closed = false;
  try {
    closed = sealedIds(kaalDir).includes(changeId(join(kaalDir, path)));
  } catch {
    // a tree with no identity is not closed
  }
  if (closed) return { stage: "CHANGE CLOSED", next: "none", problems };
  const id = currentWorkId(kaalDir, path);
  const retro = retroPresent(kaalDir, path);
  if (id === undefined || !sealedWorkIds(kaalDir).includes(id)) {
    if (retro) problems.push(`${RETRO} exists before the Work is sealed, so it is not a valid step`);
    const next = id === undefined ? `do the work in ${WORK}/, then seal it` : "complete and seal work";
    return { stage: "WORK OPEN", next: retro ? `remove ${RETRO}, then ${next}` : next, problems };
  }
  if (!retro) return { stage: "WORK SEALED", next: `write ${RETRO}`, problems };
  return { stage: "RETRO PRESENT", next: "seal Change", problems };
}

/** The step "seal work": allowed only while the Work is open and no retro.md exists. Returns the Work ID. */
export function sealWorkStep(kaalDir: string, change: string): string {
  const { stage, problems } = stateOf(kaalDir, change);
  if (stage !== "WORK OPEN") throw new Error(`${change} is ${stage}: its work is already sealed or closed`);
  if (retroPresent(kaalDir, change.replace(/\/$/, ""))) throw new Error(`${change} has a ${RETRO} already: the retrospective follows a sealed Work, so remove it first`);
  const refused = problems.filter((p) => !p.includes(RETRO));
  if (refused.length > 0) throw new Error(refused.join("; "));
  return sealWork(kaalDir, change);
}

/** The step "seal Change": allowed only once the Work is sealed and retro.md is present; closing a closed Change changes nothing. Returns the Change ID. */
export function closeStep(kaalDir: string, change: string): string {
  const { stage, next, problems } = stateOf(kaalDir, change);
  if (stage === "WORK OPEN" || stage === "WORK SEALED") throw new Error(`${change} is ${stage}: ${next} before sealing the Change`);
  if (problems.length > 0) throw new Error(problems.join("; "));
  return sealChange(kaalDir, change);
}
