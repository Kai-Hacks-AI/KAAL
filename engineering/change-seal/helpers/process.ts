// PROVISIONAL, where a Change is in the process work -> seal work -> retro-work
// -> retro-observe -> seal Change, and what may happen next. State is derived from the artifacts
// and their seals alone; nothing is written to say a phase has been reached.
// This is the one evaluator: the commands consult it and none keeps its own
// idea of the order. It knows nothing of Git, GitHub, branches, PRs or CI.
// Changing KAAL owns the process, so this is a candidate to move beside it; the
// sealing it calls on is the primitive in changes.ts.
import { existsSync, lstatSync } from "node:fs";
import { join } from "node:path";
import { changeId } from "./change-id.js";
import { changes, checkChanges, currentWorkId, RETRO, RETRO_OBSERVE, RETRO_WORK, sealChange, sealedIds, sealedTreeIds, sealWork, WORK } from "./changes.js";

export type Stage = "WORK OPEN" | "WORK SEALED" | "RETRO-WORK PRESENT" | "RETRO-OBSERVE PRESENT" | "CHANGE CLOSED";

export interface State {
  stage: Stage;
  /** What is allowed next. */
  next: string;
  /** What is wrong; empty means nothing. */
  problems: string[];
}

const present = (kaalDir: string, change: string, name: string): boolean => {
  const file = join(kaalDir, change, name);
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
  const legacy = present(kaalDir, path, RETRO);
  const worker = present(kaalDir, path, RETRO_WORK);
  const observer = present(kaalDir, path, RETRO_OBSERVE);
  // retro.md is the historical single retrospective of Changes closed before the two perspectives; an open Change takes the two.
  if (legacy) problems.push(`${RETRO} is the historical form, valid only in a closed Change; an open Change takes ${RETRO_WORK} and ${RETRO_OBSERVE}`);
  if (observer && !worker) problems.push(`${RETRO_OBSERVE} exists without ${RETRO_WORK}, so it is not a valid step`);
  const stray = [worker && RETRO_WORK, observer && RETRO_OBSERVE].filter((n): n is string => !!n);
  if (id === undefined || !sealedTreeIds(kaalDir).includes(id)) {
    for (const n of stray) problems.push(`${n} exists before the Work is sealed, so it is not a valid step`);
    const remove = [legacy && RETRO, ...stray].filter((n): n is string => !!n);
    const next = id === undefined ? `do the work in ${WORK}/, then seal it` : "complete and seal work";
    return { stage: "WORK OPEN", next: remove.length > 0 ? `remove ${remove.join(", ")}, then ${next}` : next, problems };
  }
  if (legacy) return { stage: "WORK SEALED", next: `remove ${RETRO}, then write ${RETRO_WORK}`, problems };
  if (!worker) return { stage: "WORK SEALED", next: `write ${RETRO_WORK}`, problems };
  if (!observer) return { stage: "RETRO-WORK PRESENT", next: `handoff, the worker stops; the next independent actor in the observer seat reads the Work and ${RETRO_WORK}, then writes ${RETRO_OBSERVE}`, problems };
  return { stage: "RETRO-OBSERVE PRESENT", next: "seal Change", problems };
}

/** The step "seal work": allowed only while the Work is open and no retrospective exists. Returns the Work ID. */
export function sealWorkStep(kaalDir: string, change: string): string {
  const { stage, problems } = stateOf(kaalDir, change);
  if (stage !== "WORK OPEN") throw new Error(`${change} is ${stage}: its work is already sealed or closed`);
  const path = change.replace(/\/$/, "");
  const early = [RETRO, RETRO_WORK, RETRO_OBSERVE].filter((n) => present(kaalDir, path, n));
  if (early.length > 0) throw new Error(`${change} has ${early.join(", ")} already: the retrospectives follow a sealed Work, so remove them first`);
  if (problems.length > 0) throw new Error(problems.join("; "));
  return sealWork(kaalDir, change);
}

/** The step "seal Change": allowed only once the Work is sealed and both retro-work.md and retro-observe.md are present; closing a closed Change changes nothing. Returns the Change ID. */
export function closeStep(kaalDir: string, change: string): string {
  const { stage, next, problems } = stateOf(kaalDir, change);
  if (stage === "WORK OPEN" || stage === "WORK SEALED" || stage === "RETRO-WORK PRESENT") throw new Error(`${change} is ${stage}: ${next} before sealing the Change`);
  if (problems.length > 0) throw new Error(problems.join("; "));
  return sealChange(kaalDir, change);
}
