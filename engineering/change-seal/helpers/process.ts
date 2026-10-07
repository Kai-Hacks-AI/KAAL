// PROVISIONAL, where a Change is in the process work <-> review -> seal work ->
// the three retrospectives -> seal Change, and what may happen next. State is derived from
// the artifacts and their seals alone; nothing is written to say a phase has been
// reached. Review is rounds in review/NN.md, each naming the identity of the
// Work it reviewed and its result; the review has converged exactly when the
// latest round says so about the Work as it now stands.
// This is the one evaluator: the commands consult it and none keeps its own
// idea of the order. It knows nothing of Git, GitHub, branches, PRs or CI.
// Changing KAAL owns the process, so this is a candidate to move beside it; the
// sealing it calls on is the primitive in changes.ts.
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { changeId } from "./change-id.js";
import { changes, checkChanges, currentWorkId, RETRO, RETRO_OBSERVE, RETRO_OWNER, RETRO_REVIEW, RETRO_WORK, REVIEW, sealChange, sealedIds, sealedTreeIds, sealWork, WORK } from "./changes.js";

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

const present = (kaalDir: string, change: string, name: string): boolean => {
  const file = join(kaalDir, change, name);
  return existsSync(file) && lstatSync(file).isFile();
};

interface Round {
  name: string;
  work: string;
  result: "findings" | "converged";
}

/** The rounds of review/, in order, and what is wrong with them. A round is read for its two lines, Work and Result, and no more. */
function rounds(kaalDir: string, change: string): { rounds: Round[]; problems: string[] } {
  const dir = join(kaalDir, change, REVIEW);
  const found: Round[] = [];
  const problems: string[] = [];
  if (!existsSync(dir)) return { rounds: found, problems };
  if (!lstatSync(dir).isDirectory()) return { rounds: found, problems: [`${REVIEW} is not a directory`] };
  const names = readdirSync(dir).sort();
  for (const name of names.filter((n) => !/^(0[1-9]|[1-9]\d)\.md$/.test(n))) problems.push(`${REVIEW}/${name} is not a review round: rounds are NN.md`);
  const numbered = names.filter((n) => /^(0[1-9]|[1-9]\d)\.md$/.test(n));
  numbered.forEach((name, i) => {
    if (name !== `${String(i + 1).padStart(2, "0")}.md`) problems.push(`${REVIEW}/${name} is out of sequence: rounds are numbered 01, 02, … without a gap`);
    const lines = lstatSync(join(dir, name)).isFile() ? readFileSync(join(dir, name), "utf8").split("\n") : [];
    const work = lines.filter((l) => l.startsWith("Work:"));
    const result = lines.filter((l) => l.startsWith("Result:"));
    const id = work.length === 1 ? /^Work: ([0-9a-f]{64})$/.exec(work[0]!)?.[1] : undefined;
    const verdict = result.length === 1 ? /^Result: (findings|converged)$/.exec(result[0]!)?.[1] : undefined;
    if (!id || !verdict) problems.push(`${REVIEW}/${name} is malformed: it needs exactly one "Work: <identity of work/>" line and one "Result: findings" or "Result: converged" line`);
    else found.push({ name, work: id, result: verdict as Round["result"] });
  });
  return { rounds: found, problems };
}

/** Where this Change is, and what is allowed next. A sealed record that was altered or removed is the one thing that overrides the order: nothing is valid next until it is restored, whatever stage the rest of the tree resembles. */
export function stateOf(kaalDir: string, change: string): State {
  const restore = "restore the altered or removed sealed record, as it was sealed; nothing else is valid until then";
  let state: State;
  try {
    state = derive(kaalDir, change);
  } catch (error) {
    // The seals exclude a Change's address, so a sealed record that is gone cannot be tied to the address asked about. All that is known is that the requested Change cannot be resolved while sealed history is damaged; the error itself is kept, so an address that never existed is not hidden.
    const broken = checkChanges(kaalDir).filter((p) => p.endsWith("was altered or removed"));
    if (broken.length === 0) throw error;
    return { stage: "SEALED HISTORY DAMAGED", next: `${change} cannot be resolved while sealed history is damaged: ${restore}`, problems: [(error as Error).message, ...broken] };
  }
  if (!state.problems.some((p) => p.endsWith("was altered or removed"))) return state;
  return { ...state, next: restore };
}

function derive(kaalDir: string, change: string): State {
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
  const base = id === undefined ? {} : { work: id };
  const legacy = present(kaalDir, path, RETRO);
  const observe = present(kaalDir, path, RETRO_OBSERVE);
  const owner = present(kaalDir, path, RETRO_OWNER);
  const worker = present(kaalDir, path, RETRO_WORK);
  const reviewer = present(kaalDir, path, RETRO_REVIEW);
  const review = rounds(kaalDir, path);
  problems.push(...review.problems);
  // retro.md (the single retrospective) and retro-observe.md (the outer perspective before it was the Owner's) are historical forms of Changes closed before the present ones; an open Change takes retro-work.md, retro-review.md and retro-owner.md.
  for (const [name, here] of [[RETRO, legacy], [RETRO_OBSERVE, observe]] as const)
    if (here) problems.push(`${name} is the historical form, valid only in a closed Change; an open Change takes ${RETRO_WORK}, ${RETRO_REVIEW} and ${RETRO_OWNER}`);
  const latest = review.rounds[review.rounds.length - 1];
  const converged = latest !== undefined && id !== undefined && latest.work === id && latest.result === "converged";
  const sealed = id !== undefined && sealedTreeIds(kaalDir).includes(id);
  const stray = [legacy && RETRO, observe && RETRO_OBSERVE, worker && RETRO_WORK, reviewer && RETRO_REVIEW, owner && RETRO_OWNER].filter((n): n is string => !!n);
  if (!sealed) {
    for (const n of [worker && RETRO_WORK, reviewer && RETRO_REVIEW, owner && RETRO_OWNER].filter((n): n is string => !!n)) problems.push(`${n} exists before the Work is sealed, so it is not a valid step`);
    const remove = stray.length > 0 ? `remove ${stray.join(", ")}, then ` : "";
    if (converged) return { stage: "REVIEW CONVERGED", next: `${remove}the Worker seals work`, problems, ...base };
    const number = String(review.rounds.length + 1).padStart(2, "0");
    let next: string;
    if (id === undefined) next = `the Worker does the work in ${WORK}/, then it is reviewed`;
    else if (latest === undefined) next = `the Worker completes the work, then it is reviewed: the Reviewer writes ${REVIEW}/${number}.md naming work ${id}`;
    else if (latest.work !== id) next = `the work changed since ${REVIEW}/${latest.name}: it is reviewed again, the Reviewer writes ${REVIEW}/${number}.md naming work ${id}`;
    else next = `the Worker resolves the findings of ${REVIEW}/${latest.name} in ${WORK}/, then it is reviewed again: the Reviewer writes ${REVIEW}/${number}.md`;
    return { stage: "WORK OPEN", next: `${remove}${next}`, problems, ...base };
  }
  if (!converged) problems.push(`${WORK}/ is sealed without a converged review of exactly it: ${REVIEW}/ must end with a round that says converged and names work ${id}`);
  // After the Work is sealed the retrospectives are ordered, because knowledge accumulates: the Worker's, then the Owner's (written after the Owner's judgment of the sealed Work against the Intent, which is no artifact), then the Reviewer's.
  if (legacy || observe) return { stage: "WORK SEALED", next: `remove ${[legacy && RETRO, observe && RETRO_OBSERVE].filter(Boolean).join(", ")}, then write ${RETRO_WORK}, ${RETRO_OWNER} and ${RETRO_REVIEW}, in that order`, problems, ...base };
  const order = [[RETRO_WORK, worker], [RETRO_OWNER, owner], [RETRO_REVIEW, reviewer]] as const;
  let done = 0;
  while (done < order.length && order[done]![1]) done++;
  order.forEach(([name, here], k) => {
    if (here && k > done) problems.push(`${name} exists before ${order[done]![0]}: the retrospectives follow the order ${order.map(([n]) => n).join(", ")}`);
  });
  if (done === 3) return { stage: "RETROS PRESENT", next: "the Reviewer seals Change", problems, ...base };
  const stages = ["WORK SEALED", "RETRO-WORK PRESENT", "RETRO-OWNER PRESENT", "RETROS PRESENT"] as const;
  const nexts = [
    `the Worker writes ${RETRO_WORK} (the Work's seat), first`,
    `the Owner judges the sealed Work against the Intent, a judgment that is no artifact, then writes ${RETRO_OWNER} (the Owner's seat)`,
    `the Reviewer writes ${RETRO_REVIEW} (the review's seat), last, with the Worker's and the Owner's retrospectives to hand`,
    "the Reviewer seals Change",
  ];
  return { stage: stages[done]!, next: nexts[done]!, problems, ...base };
}

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
