#!/usr/bin/env node
// change-state <kaal-dir> <change>
// Where a Change is in the Changing KAAL process, and what may happen next:
// work <-> review -> seal work -> the three retrospectives -> seal Change. State
// is derived from the artifacts and their seals alone; nothing is written to say
// a phase has been reached, and this script writes nothing at all. Review is
// rounds in review/NN.md, each naming the identity of the Work it reviewed and
// its result; the review has converged exactly when the latest round says so
// about the Work as it now stands.
// This is the one definition of the order, and of which tree is a Change and
// which is a named tree: whatever else consults the process (the repository's
// sealing and closing commands, its admission check) uses this and keeps no
// idea of its own. It knows nothing of Git, GitHub, branches, PRs or CI.
// It does not decide what an identity is or what a seal is. The Sealing
// capability does, and the one command line below reaches it as the sibling
// Skill kaal-sealing, installed beside this one; `compass()` takes it as an
// argument for a caller that already holds it.
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Where Change seals live, relative to the KAAL directory; Node seals (seals/<ID>) are not touched. */
export const SEALS = "seals/changes";
/** Where named-tree seals live, beside Change seals and likewise outside the tree they seal. */
export const TREE_SEALS = "seals/trees";
/** The Work of a Change is its directory work/, its review is the rounds in review/, and its retrospectives are retro-work.md (from the
 * Work's seat), retro-review.md (from the review's seat) and retro-owner.md (from the Owner's, the outer seat). Two historical forms
 * exist and are valid only in Changes closed before them: retro.md, the single retrospective before the perspectives, and
 * retro-observe.md, the outer perspective as it was named when it was thought of as an Observer, which never became a role. */
export const WORK = "work";
export const REVIEW = "review";
export const RETRO_WORK = "retro-work.md";
export const RETRO_REVIEW = "retro-review.md";
export const RETRO_OWNER = "retro-owner.md";
export const RETRO_OBSERVE = "retro-observe.md";
export const RETRO = "retro.md";

const dirs = (path) => (existsSync(path) ? readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);

/** Whether `name` is a regular file of the Change at `change`. */
export const present = (kaalDir, change, name) => {
  const file = join(kaalDir, change, name);
  return existsSync(file) && lstatSync(file).isFile();
};

/** Every Change directory, changes/<name>/YY/MM/DD/CC/, relative to the KAAL directory, in order. */
export function changes(kaalDir) {
  const found = [];
  const base = join(kaalDir, "changes");
  for (const name of dirs(base).filter((n) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n)))
    for (const yy of dirs(join(base, name)).filter((n) => /^\d{2}$/.test(n)))
      for (const mm of dirs(join(base, name, yy)).filter((n) => /^\d{2}$/.test(n)))
        for (const dd of dirs(join(base, name, yy, mm)).filter((n) => /^\d{2}$/.test(n)))
          for (const cc of dirs(join(base, name, yy, mm, dd)).filter((n) => /^(0[1-9]|[1-9]\d)$/.test(n))) found.push(`changes/${name}/${yy}/${mm}/${dd}/${cc}`);
  return found;
}

/** The rounds of review/, in order, and what is wrong with them. A round is read for its two lines, Work and Result, and no more. */
function rounds(kaalDir, change) {
  const dir = join(kaalDir, change, REVIEW);
  const found = [];
  const problems = [];
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
    const id = work.length === 1 ? /^Work: ([0-9a-f]{64})$/.exec(work[0])?.[1] : undefined;
    const verdict = result.length === 1 ? /^Result: (findings|converged)$/.exec(result[0])?.[1] : undefined;
    if (!id || !verdict) problems.push(`${REVIEW}/${name} is malformed: it needs exactly one "Work: <identity of work/>" line and one "Result: findings" or "Result: converged" line`);
    else found.push({ name, work: id, result: verdict });
  });
  return { rounds: found, problems };
}

/**
 * The process over a KAAL directory, given Sealing's identity (`artifactId(path, { domain, named })`) and
 * seal markers (`sealed(dir)`, the IDs sealed in a directory).
 */
export function compass({ identity, markers }) {
  /** A Change, changes/<name>/YY/MM/DD/CC/, is `KAAL Change v1`: the whole tree under it, relative paths included, the Change's own name and address excluded. v1 is kept exactly as sealed in genesis 01. */
  const changeId = (dir) => identity.artifactId(dir, { domain: "KAAL Change v1" });
  /** A named tree is `KAAL Tree v1`: the same, plus the tree's own root name; its parent and location are excluded. The first consumer is a Change's work/. */
  const namedTreeId = (dir) => identity.artifactId(dir, { domain: "KAAL Tree v1", named: true });

  /** The Change IDs sealed in this KAAL directory. */
  const sealedIds = (kaalDir) => markers.sealed(join(kaalDir, SEALS));
  /** The named-tree IDs sealed in this KAAL directory. */
  const sealedTreeIds = (kaalDir) => markers.sealed(join(kaalDir, TREE_SEALS));

  /** The named-tree ID of a Change's current work/, or undefined when it has none or none can be identified. */
  function currentWorkId(kaalDir, change) {
    const work = join(kaalDir, change, WORK);
    if (!existsSync(work) || !lstatSync(work).isDirectory()) return undefined;
    try {
      return namedTreeId(work);
    } catch {
      return undefined;
    }
  }

  /** The closed Changes: each Change whose current tree has a seal, as {path, id}. Open or unreadable Changes are not closed. */
  function closedChanges(kaalDir) {
    const sealed = new Set(sealedIds(kaalDir));
    const closed = [];
    for (const path of changes(kaalDir)) {
      let id;
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
  function checkChanges(kaalDir) {
    const closed = closedChanges(kaalDir);
    const live = new Set(closed.map((c) => c.id));
    const problems = sealedIds(kaalDir).filter((id) => !live.has(id)).map((id) => `${SEALS}/${id} matches no Change: a sealed Change was altered or removed`);
    const works = changes(kaalDir).map((c) => ({ change: c, id: currentWorkId(kaalDir, c) }));
    const sealedWork = new Set(sealedTreeIds(kaalDir));
    const here = new Set(works.map((w) => w.id));
    for (const id of sealedWork) if (!here.has(id)) problems.push(`${TREE_SEALS}/${id} matches no work/: sealed work was altered or removed`);
    for (const c of closed) {
      const w = works.find((x) => x.change === c.path);
      if (w && existsSync(join(kaalDir, w.change, WORK)) && !(w.id && sealedWork.has(w.id))) problems.push(`${c.path} is closed but its ${WORK}/ is not sealed`);
    }
    return problems;
  }

  /** Where this Change is, and what is allowed next. A sealed record that was altered or removed is the one thing that overrides the order: nothing is valid next until it is restored, whatever stage the rest of the tree resembles. */
  function stateOf(kaalDir, change) {
    const restore = "restore the altered or removed sealed record, as it was sealed; nothing else is valid until then";
    let state;
    try {
      state = derive(kaalDir, change);
    } catch (error) {
      // The seals exclude a Change's address, so a sealed record that is gone cannot be tied to the address asked about. All that is known is that the requested Change cannot be resolved while sealed history is damaged; the error itself is kept, so an address that never existed is not hidden.
      const broken = checkChanges(kaalDir).filter((p) => p.endsWith("was altered or removed"));
      if (broken.length === 0) throw error;
      return { stage: "SEALED HISTORY DAMAGED", next: `${change} cannot be resolved while sealed history is damaged: ${restore}`, problems: [error.message, ...broken] };
    }
    if (!state.problems.some((p) => p.endsWith("was altered or removed"))) return state;
    return { ...state, next: restore };
  }

  function derive(kaalDir, change) {
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
    for (const [name, here] of [[RETRO, legacy], [RETRO_OBSERVE, observe]])
      if (here) problems.push(`${name} is the historical form, valid only in a closed Change; an open Change takes ${RETRO_WORK}, ${RETRO_REVIEW} and ${RETRO_OWNER}`);
    const latest = review.rounds[review.rounds.length - 1];
    const converged = latest !== undefined && id !== undefined && latest.work === id && latest.result === "converged";
    const sealed = id !== undefined && sealedTreeIds(kaalDir).includes(id);
    const stray = [legacy && RETRO, observe && RETRO_OBSERVE, worker && RETRO_WORK, reviewer && RETRO_REVIEW, owner && RETRO_OWNER].filter((n) => !!n);
    if (!sealed) {
      for (const n of [worker && RETRO_WORK, reviewer && RETRO_REVIEW, owner && RETRO_OWNER].filter((n) => !!n)) problems.push(`${n} exists before the Work is sealed, so it is not a valid step`);
      const remove = stray.length > 0 ? `remove ${stray.join(", ")}, then ` : "";
      if (converged) return { stage: "REVIEW CONVERGED", next: `${remove}the Worker seals work`, problems, ...base };
      const number = String(review.rounds.length + 1).padStart(2, "0");
      let next;
      if (id === undefined) next = `the Worker does the work in ${WORK}/, then it is reviewed`;
      else if (latest === undefined) next = `the Worker completes the work, then it is reviewed: the Reviewer writes ${REVIEW}/${number}.md naming work ${id}`;
      else if (latest.work !== id) next = `the work changed since ${REVIEW}/${latest.name}: it is reviewed again, the Reviewer writes ${REVIEW}/${number}.md naming work ${id}`;
      else next = `the Worker resolves the findings of ${REVIEW}/${latest.name} in ${WORK}/, then it is reviewed again: the Reviewer writes ${REVIEW}/${number}.md`;
      return { stage: "WORK OPEN", next: `${remove}${next}`, problems, ...base };
    }
    if (!converged) problems.push(`${WORK}/ is sealed without a converged review of exactly it: ${REVIEW}/ must end with a round that says converged and names work ${id}`);
    // After the Work is sealed the retrospectives are ordered, because knowledge accumulates: the Worker's, then the Owner's (written after the Owner's judgment of the sealed Work against the Intent, which is no artifact), then the Reviewer's.
    if (legacy || observe) return { stage: "WORK SEALED", next: `remove ${[legacy && RETRO, observe && RETRO_OBSERVE].filter(Boolean).join(", ")}, then write ${RETRO_WORK}, ${RETRO_OWNER} and ${RETRO_REVIEW}, in that order`, problems, ...base };
    const order = [[RETRO_WORK, worker], [RETRO_OWNER, owner], [RETRO_REVIEW, reviewer]];
    let done = 0;
    while (done < order.length && order[done][1]) done++;
    order.forEach(([name, here], k) => {
      if (here && k > done) problems.push(`${name} exists before ${order[done][0]}: the retrospectives follow the order ${order.map(([n]) => n).join(", ")}`);
    });
    if (done === 3) return { stage: "RETROS PRESENT", next: "the Reviewer seals Change", problems, ...base };
    const stages = ["WORK SEALED", "RETRO-WORK PRESENT", "RETRO-OWNER PRESENT", "RETROS PRESENT"];
    const nexts = [
      `the Worker writes ${RETRO_WORK} (the Work's seat), first`,
      `the Owner judges the sealed Work against the Intent, a judgment that is no artifact, then writes ${RETRO_OWNER} (the Owner's seat)`,
      `the Reviewer writes ${RETRO_REVIEW} (the review's seat), last, with the Worker's and the Owner's retrospectives to hand`,
      "the Reviewer seals Change",
    ];
    return { stage: stages[done], next: nexts[done], problems, ...base };
  }

  return { changeId, namedTreeId, sealedIds, sealedTreeIds, currentWorkId, closedChanges, checkChanges, stateOf };
}

/** Sealing as the sibling Skill beside this one: the same skills directory holds kaal-sealing. */
async function sealing() {
  const scripts = new URL("../../kaal-sealing/scripts/", import.meta.url);
  const identity = new URL("artifact-id.mjs", scripts);
  const markers = new URL("seal.mjs", scripts);
  if (!existsSync(fileURLToPath(identity)) || !existsSync(fileURLToPath(markers)))
    throw new Error("kaal-sealing is not installed beside kaal-changing: Sealing establishes the identity a Change's state is judged by");
  return { identity: await import(identity.href), markers: await import(markers.href) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [kaalDir, change, ...extra] = process.argv.slice(2);
  if (!kaalDir || !change || extra.length > 0) {
    console.error("usage: change-state <kaal-dir> <change>");
    process.exit(2);
  }
  try {
    const state = compass(await sealing()).stateOf(kaalDir, change);
    console.log(state.stage);
    console.log(`next: ${state.next}`);
    if (state.work !== undefined && state.stage !== "CHANGE CLOSED") console.log(`work: ${state.work}`);
    for (const p of state.problems) console.log(`problem: ${p}`);
    process.exitCode = state.problems.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
