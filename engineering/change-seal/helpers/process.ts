// PROVISIONAL, the steps that write: seal work and seal Change, each allowed only
// where the process says so. Where a Change is and what is next is Changing KAAL's
// own script (compass.ts), the one definition; this consults it and keeps no idea
// of the order. It knows nothing of Git, GitHub, branches, PRs or CI.
import { RETRO, RETRO_OBSERVE, RETRO_OWNER, RETRO_REVIEW, RETRO_WORK, present, stateOf } from "./compass.js";
import { sealChange, sealWork } from "./changes.js";

export { stateOf } from "./compass.js";
export type { Stage, State } from "./compass.js";

/** The step "seal work": allowed only once review has converged on the Work as it now stands and no retrospective exists. Returns the Work ID. */
export function sealWorkStep(kaalDir: string, change: string): string {
  const { stage, next, problems } = stateOf(kaalDir, change);
  if (stage !== "WORK OPEN" && stage !== "REVIEW CONVERGED") throw new Error(`${change} is ${stage}: its work is already sealed or closed`);
  const path = change.replace(/\/$/, "");
  const early = [RETRO, RETRO_OBSERVE, RETRO_WORK, RETRO_REVIEW, RETRO_OWNER].filter((n) => present(kaalDir, path, n));
  if (early.length > 0) throw new Error(`${change} has ${early.join(", ")} already: the retrospectives follow a sealed Work, so remove them first`);
  if (stage === "WORK OPEN") throw new Error(`${change} is ${stage}: ${next} before sealing the work`);
  if (problems.length > 0) throw new Error(problems.join("; "));
  return sealWork(kaalDir, change);
}

/** The step "the Reviewer seals Change": allowed only once the Work is sealed on a converged review and retro-work.md, retro-owner.md and retro-review.md are all present, in that order; closing a closed Change changes nothing. Returns the Change ID. */
export function closeStep(kaalDir: string, change: string): string {
  const { stage, next, problems } = stateOf(kaalDir, change);
  if (stage !== "RETROS PRESENT" && stage !== "CHANGE CLOSED") throw new Error(`${change} is ${stage}: ${next} before sealing the Change`);
  if (problems.length > 0) throw new Error(problems.join("; "));
  return sealChange(kaalDir, change);
}
