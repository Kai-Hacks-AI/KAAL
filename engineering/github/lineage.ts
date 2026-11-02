#!/usr/bin/env node
// Lineage: this repository's Git realization of its branching flows, decided here and nowhere else.
// Each verdict is separately testable and returns an actionable diagnostic that points to the
// guide. CI and local hooks run this file; they supply inputs and act on the exit code only.
//
//   promotionSource      Promote: the default branch accepts pull requests only from kaal/* of this repository.
//   promotionFreshness   Promote: the promotion contains the default branch's tip, and merging it yields
//                        exactly the tree validated on its head.
//   synchronization      Synchronize: a merge commit gives a lineage a state of the default branch newer
//                        than the one it last incorporated, with its own outstanding Changes kept, and
//                        names its explicit resolutions, telling its own apart from those that adopt the
//                        merged state's content unchanged. It is fully current or a valid step. Anything
//                        else proposed to a lineage is an ordinary Change, which must not carry the
//                        default branch's history.
//   autoMerge            Gate, before a pull request lands: auto-merge is enabled with the method
//                        its flow names.
//   landing              Audit, after a pull request has landed: it landed by that method. A landing cannot
//                        be gated after the fact; this verdict reports it, with the repair.
//   establishment        Audit, when a kaal/* branch is created: it starts at the default branch's tip as it
//                        was at that moment, as the activity recorded then shows.
//   collector            Audit, at any time: a collector holds unpromoted work or is newly established. One
//                        that a promotion of it took in full is deleted, unless the Owner holds it and the
//                        hold is evidenced in holds.json beside this file; a held collector is reported as
//                        held, never as a pass.
//   workingBranch        Audit, at any time: a working branch whose Change merged is deleted, not reused.
//   claim                Gate, before a Change lands in a collector: the Change Record it claims is free in
//                        the collector's current tip. Numbering and collision are Change's rules, applied
//                        as accepted on the default branch; this verdict supplies the facts, and the
//                        required strict up-to-date check runs it again at each new tip.
//
// Deletion cannot be gated: the audits report what is due, and the Owner deletes.
//
// A synchronization lands with a merge commit, so the lineage keeps the default branch's ancestry; an
// ordinary Change lands by squash. Each verdict says which. A `Synchronized-with: <sha>` line, from the
// earlier squash synchronizations, states intent only: it is verified before it is used.
//
// Usage (inside a repository holding every commit named):
//   lineage.ts source <repo> <default> <base-ref> <head-repo> <head-ref>
//   lineage.ts freshness <default> <default-tip> <head-ref> <head>
//   lineage.ts synchronization <default> <lineage> <default-tip> <lineage-tip> <head> [--resolutions <file>]
//   lineage.ts incorporated <lineage-tip> <default-tip>    prints the state a synchronization starts from
//   lineage.ts auto-merge <default> <base-ref> <default-tip> <base-tip> <head> <enabled-method|none>
//   lineage.ts landing <default> <base-ref> <default-tip> <before> <after> <pulls.json>
//   lineage.ts claim <default> <base-ref> <default-tip> <base-tip> <head>
// pulls.json is what GitHub reports of the pull requests associated with <after>, as
// [{ number, base, head, merge }]: base ref, head commit and merge commit (null while unmerged).
//   lineage.ts establishment <default> <ref> <activity.json>
//   lineage.ts collectors <default> <default-tip> <ref-prefix> <holds.json> <collectors.json>
//   lineage.ts working-branches <default> <branches.json>
// The other JSON inputs are facts the caller reads from GitHub, complete or not at all:
// activity.json is the repository activity of the default branch and the ref, as GitHub records it
// ([{ ref, before, after, timestamp, activity_type }]); collectors.json maps each collector to
// { open: [numbers], promotions: [{ number, head, merge }] }, its open pull requests and its merged
// pull requests into the default branch; branches.json lists each branch with its tip and the merged
// pull requests whose head ref it was, as [{ branch, tip, merged: [{ number, head }] }]. A fact a
// verdict needs and does not get fails it as cannot judge, never passes it.
// Exits 0 pass, 1 fail, 2 cannot judge, 3 not applicable, 4 held (collectors only: nothing fails and an
// evidenced Owner hold keeps at least one collector). A consumer must treat 2 as a failure and
// 3 as "this verdict does not apply", never as a pass of it. --resolutions writes a verified
// synchronization's own resolutions, NUL-separated, as input for Change Isolation; resolutions that
// adopt the merged state's content unchanged are named in the verdict but not written.
//
// A passing synchronization proves structure only: everything outside the explicit resolutions is
// exactly the default branch with the lineage's outstanding Changes. Whether a resolution is right
// is not judged here; the lineage's tests and review decide that. Adoption only narrows what Change
// Isolation judges: the whole resulting tree still goes through every required check.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const GUIDE = "engineering/github/branching.md";

export type Verdict = { kind: "pass" | "fail" | "not-applicable"; message: string };
/** A synchronization verdict. A pass is either fully current (it incorporates the default branch's
 *  tip) or a valid intermediate step that leaves the lineage behind; both name their resolutions:
 *  `resolutions` are its own, `adopted` take the merged state's content unchanged. */
export type SyncVerdict = Verdict & { resolutions: string[]; adopted: string[]; current: boolean };

/** A three-way merge as Git computes it: the resulting tree and the paths it could not merge. */
export interface MergeResult {
  clean: boolean;
  tree: string;
  conflicts: string[];
}

const short = (sha: string) => sha.slice(0, 7);
const list = (paths: string[]) => paths.join(" ");

// ---- Verdicts: pure functions over Git facts ------------------------------------------------

export interface SourceFacts {
  repo: string;
  defaultBranch: string;
  baseRef: string;
  headRepo: string;
  headRef: string;
}

export function promotionSource(f: SourceFacts): Verdict {
  if (f.baseRef !== f.defaultBranch) {
    return { kind: "not-applicable", message: `Not a promotion: ${f.baseRef} is not ${f.defaultBranch}.` };
  }
  if (f.headRepo === f.repo && f.headRef.startsWith("kaal/")) {
    return { kind: "pass", message: `Promotion from ${f.headRef}.` };
  }
  return {
    kind: "fail",
    message:
      `${f.defaultBranch} accepts pull requests only from kaal/* branches of ${f.repo}, not from ${f.headRepo}:${f.headRef}. ` +
      `Take this Change into a kaal/* lineage through a pull request, then promote that lineage. See ${GUIDE}#promote`,
  };
}

export interface FreshnessFacts {
  defaultBranch: string;
  defaultTip: string;
  headRef: string;
  head: string;
  headTree: string;
  /** The head contains the default branch's tip: what GitHub's strict up-to-date rule requires. */
  containsTip: boolean;
  /** The merge of the promotion's head into the default branch's tip, over their Git merge base. */
  merge: MergeResult;
}

export function promotionFreshness(f: FreshnessFacts): Verdict {
  if (f.containsTip && f.merge.clean && f.merge.tree === f.headTree) {
    return {
      kind: "pass",
      message: `Fresh: merging ${f.headRef} (${short(f.head)}) into ${f.defaultBranch} (${short(f.defaultTip)}) yields exactly the head's validated tree.`,
    };
  }
  const why = !f.merge.clean
    ? `it conflicts with ${f.defaultBranch} at ${short(f.defaultTip)} on ${list(f.merge.conflicts)}`
    : !f.containsTip
      ? `it does not contain ${f.defaultBranch}'s tip ${short(f.defaultTip)}`
      : `merging it into ${f.defaultBranch} at ${short(f.defaultTip)} would produce a tree that was never validated on its head`;
  return {
    kind: "fail",
    message:
      `${f.headRef} is not fresh: ${why}. Synchronize ${f.headRef} with ${f.defaultBranch} at ${short(f.defaultTip)}: ` +
      `on a branch from its tip, git merge ${short(f.defaultTip)}, resolve every conflict explicitly, and land that pull request ` +
      `into ${f.headRef} with a merge commit. This promotion is then judged again on its new head. See ${GUIDE}#synchronize`,
  };
}

export interface SyncFacts {
  defaultBranch: string;
  lineage: string;
  defaultTip: string;
  lineageTip: string;
  head: string;
  /** The default-branch state the head merges in: its second parent when it is a merge commit whose
   *  second parent the default branch contains and the lineage does not; null otherwise. */
  merged: string | null;
  /** The head's Synchronized-with value, as claimed; null when it states none. */
  marker: string | null;
  /** The head builds on the lineage's tip: its first parent contains it. */
  onLineageTip: boolean;
  /** The proposal carries commits of the default branch that the lineage does not hold. */
  carriesDefault: boolean;
  /** The merged state is a commit on the default branch's first-parent history: a state it admitted. */
  markerOnDefault: boolean;
  /** Conflicting paths the head resolves to exactly the merged default-branch state: content the
   *  default branch already admitted, not the synchronization's own. */
  adopted: string[];
  /** The merged state is strictly newer than the incorporated state: the incorporated state is its
   *  ancestor and not itself. */
  advances: boolean;
  /** The last default-branch state the lineage verifiably incorporated (see incorporated()). */
  incorporated: string;
  /** The merge of the merged state and the lineage's tip over the incorporated state. */
  expected: MergeResult;
  /** Paths where the head differs from expected.tree, other than expected.conflicts. */
  differing: string[];
}

export function synchronization(f: SyncFacts): SyncVerdict {
  const howTo =
    `on a branch from ${f.lineage}'s tip ${short(f.lineageTip)}, git merge a ${f.defaultBranch} commit S after ${short(f.incorporated)} ` +
    `(its tip ${short(f.defaultTip)}, or an earlier one so that each step's resolutions travel alone), resolve every conflict ` +
    `explicitly in that merge commit, and land the pull request with a merge commit. See ${GUIDE}#synchronize`;
  const fail = (problem: string): SyncVerdict => ({ kind: "fail", resolutions: [], adopted: [], current: false, message: `${problem} To synchronize: ${howTo}` });
  if (f.merged === null) {
    if (f.marker !== null) {
      return fail(`${short(f.head)} states Synchronized-with ${short(f.marker)} but is not a merge commit of it: a synchronization records ${f.defaultBranch}'s ancestry.`);
    }
    if (f.carriesDefault) {
      return {
        kind: "fail", resolutions: [], adopted: [], current: false,
        message:
          `${short(f.head)} carries ${f.defaultBranch} commits that ${f.lineage} does not hold, so it is neither an ordinary Change nor a synchronization. ` +
          `A Change builds on ${f.lineage}'s tip alone (rebase it there); ${f.defaultBranch} arrives only through a synchronization: ${howTo}`,
      };
    }
    return { kind: "not-applicable", resolutions: [], adopted: [], current: false, message: `Not a synchronization: an ordinary Change into ${f.lineage}. Land it by squash.` };
  }
  if (f.marker !== null && f.marker !== f.merged) return fail(`Synchronized-with ${short(f.marker)} is not the ${f.defaultBranch} commit ${short(f.merged)} this merge brings in.`);
  if (!f.onLineageTip) return fail(`This synchronization does not build on ${f.lineage}'s tip ${short(f.lineageTip)}.`);
  if (!f.markerOnDefault) return fail(`The merged ${short(f.merged)} is not a commit on ${f.defaultBranch}'s first-parent history.`);
  if (!f.advances) {
    return fail(`No progress: the merged ${short(f.merged)} is not newer than ${short(f.incorporated)}, the ${f.defaultBranch} state ${f.lineage} already incorporated.`);
  }
  if (f.differing.length) {
    return fail(
      `This synchronization differs from ${f.defaultBranch} at ${short(f.merged)} with ${f.lineage}'s outstanding Changes on: ` +
        `${list(f.differing)}. Only paths where the two conflict may differ.`,
    );
  }
  const adopted = f.expected.conflicts.filter((p) => f.adopted.includes(p));
  const resolutions = f.expected.conflicts.filter((p) => !f.adopted.includes(p));
  const current = f.merged === f.defaultTip;
  return {
    kind: "pass",
    resolutions,
    adopted,
    current,
    message:
      `${current ? "Synchronized, fully current" : "Synchronized, a valid intermediate step"}: ${f.lineage} receives ` +
      `${f.defaultBranch} at ${short(f.merged)} with its outstanding Changes since ${short(f.incorporated)}; explicit resolutions: ` +
      `${resolutions.length ? list(resolutions) : "none"}` +
      (adopted.length ? `; adopted unchanged from ${f.defaultBranch} at ${short(f.merged)}: ${list(adopted)}` : "") + ". " +
      (current ? "" : `${f.defaultBranch} is at ${short(f.defaultTip)}: synchronize again from ${short(f.merged)} to bring ${f.lineage} current. `) +
      `Land it with a merge commit, never by squash or rebase: the merge commit is what keeps ${f.defaultBranch}'s ancestry. ` +
      `Structure verified; whether each resolution is right is for the lineage's tests and review.`,
  };
}

/** How GitHub lands a pull request. */
export type Method = "squash" | "merge" | "rebase";
const METHOD_NAME: Record<Method, string> = { squash: "squash", merge: "a merge commit", rebase: "rebase" };
const TELLING = `${GUIDE}#telling-a-synchronization-from-a-change`;

/** The method a pull request's flow lands by: squash into the default branch; into a lineage, a merge
 *  commit for a passing synchronization and squash for an ordinary Change. A synchronization verdict
 *  that fails names none: that pull request must not land. */
export function methodFor(defaultBranch: string, baseRef: string, sync: Verdict | null): "squash" | "merge" | null {
  if (baseRef === defaultBranch) return "squash";
  if (sync === null) return null;
  return sync.kind === "pass" ? "merge" : sync.kind === "not-applicable" ? "squash" : null;
}

export interface AutoMergeFacts {
  baseRef: string;
  head: string;
  /** The method its flow names, or null when its Branching verdict fails. */
  expected: "squash" | "merge" | null;
  /** The method auto-merge is enabled with, or null when auto-merge is off. */
  enabled: Method | null;
}

export function autoMerge(f: AutoMergeFacts): Verdict {
  if (f.expected === null) {
    return { kind: "fail", message: `${short(f.head)} must not land into ${f.baseRef}: its Branching verdict fails, so no method is right. See ${TELLING}` };
  }
  if (f.enabled === null) {
    return { kind: "fail", message: `Auto-merge is disabled for this pull request into ${f.baseRef}. Enable auto-merge with ${METHOD_NAME[f.expected]} before integration. See ${TELLING}` };
  }
  if (f.enabled === f.expected) return { kind: "pass", message: `Auto-merge lands this pull request into ${f.baseRef} by ${METHOD_NAME[f.expected]}, as its flow names.` };
  return {
    kind: "fail",
    message:
      `Auto-merge would land this pull request into ${f.baseRef} by ${METHOD_NAME[f.enabled]}, but its flow lands by ${METHOD_NAME[f.expected]}. ` +
      `Disable auto-merge and enable it again with ${METHOD_NAME[f.expected]}. See ${TELLING}`,
  };
}

export interface LandingFacts {
  defaultBranch: string;
  baseRef: string;
  /** The base branch's tip before the landing, and after it. */
  before: string;
  after: string;
  /** The pull request that landed it and its head, or null when none is attributable. */
  pull: number | null;
  head: string | null;
  /** Why no pull request is attributable, when GitHub reports none or several; null otherwise. */
  unattributed: string | null;
  /** The method its flow names, judged on the base as it stood before the landing; null when its
   *  Branching verdict fails. */
  expected: "squash" | "merge" | null;
  /** The default-branch state the head states Synchronized-with when the default tip it was judged
   *  against does not hold it: the facts are too old to judge the flow. null otherwise. */
  unseen: string | null;
  /** Commits on the base's first-parent history from `before` to `after`. */
  commits: number;
  /** The parents of `after`. */
  parents: string[];
}

/** What Git shows of a landing. GitHub records no merge method on the commits it writes, so the
 *  method is read from their shape, and one shape is ambiguous: a single commit with one parent is
 *  what a squash leaves, and also what a rebase of a one-commit head leaves. */
export type Shape = "merge-commit" | "one-commit" | "several-commits";
const SHAPE_NAME: Record<Shape, string> = {
  "merge-commit": "a merge commit of its head",
  "one-commit": "one single-parent commit",
  "several-commits": "several commits",
};
/** The method each shape is consistent with: the only one, except a one-commit rebase also leaves one commit. */
const SHAPE_METHOD: Record<Shape, Method> = { "merge-commit": "merge", "one-commit": "squash", "several-commits": "rebase" };

/** The shape a landing left: one commit with the head as second parent, one commit with one parent,
 *  or several commits. null when it is none of these. */
export function landedAs(f: Pick<LandingFacts, "commits" | "parents" | "head">): Shape | null {
  if (f.commits > 1) return "several-commits";
  if (f.commits !== 1) return null;
  if (f.parents.length === 2 && f.parents[1] === f.head) return "merge-commit";
  return f.parents.length === 1 ? "one-commit" : null;
}

export function landing(f: LandingFacts): Verdict {
  const what = `${f.baseRef} at ${short(f.after)}`;
  if (f.pull === null || f.head === null) {
    return {
      kind: "fail",
      message: `No pull request is attributable to ${what}: ${f.unattributed ?? "none landed it"}. ${f.baseRef} changes only through pull requests. See ${GUIDE}#branches`,
    };
  }
  const pr = `#${f.pull}`;
  if (f.unseen !== null) {
    return {
      kind: "fail",
      message:
        `Cannot judge how ${pr} should have landed: its head states Synchronized-with ${short(f.unseen)}, which ${f.defaultBranch} ` +
        `as given does not hold. Audit it against ${f.defaultBranch}'s current tip. See ${TELLING}`,
    };
  }
  if (f.expected === null) return { kind: "fail", message: `${pr} landed into ${f.baseRef} although its Branching verdict fails. See ${TELLING}` };
  const shape = landedAs(f);
  if (shape === null) return { kind: "fail", message: `${pr} landed ${what} in a shape that is no method its flow allows. See ${TELLING}` };
  const used = SHAPE_METHOD[shape];
  const seen = `${pr} landed into ${f.baseRef} as ${SHAPE_NAME[shape]}`;
  if (used === f.expected) {
    return {
      kind: "pass",
      message:
        `${seen}, the shape ${METHOD_NAME[used]} leaves, as its flow names. ` +
        (shape === "one-commit"
          ? `Git cannot tell a squash from a rebase of a one-commit head; both land the same single commit, so either meets the flow.`
          : `Only the shape is verified; GitHub records no method.`),
    };
  }
  const repair =
    f.expected === "merge"
      ? `${f.baseRef} now lacks ${f.defaultBranch}'s ancestry, so its next promotion fails freshness. Synchronize it again. See ${GUIDE}#synchronize`
      : used === "merge"
        ? `The verified tree landed unchanged, with ${f.defaultBranch}-side history added; nothing needs repair. Land the next one by squash. See ${TELLING}`
        : `It landed as ${f.commits} commits instead of one. Land the next one by squash. See ${TELLING}`;
  const by = shape === "one-commit" ? "by squash or a one-commit rebase" : `by ${METHOD_NAME[used]}`;
  return { kind: "fail", message: `${seen}, so ${by}, but its flow lands by ${METHOD_NAME[f.expected]}. ${repair}` };
}

/** A change to a branch as GitHub's repository activity records it, at the time it happened. */
export interface Activity {
  ref: string;
  before: string;
  after: string;
  timestamp: string;
  activity_type: string;
}

const ZERO = "0".repeat(40);
const heads = (branch: string) => `refs/heads/${branch}`;

/** The states the default branch was at when `at` happened, from its recorded activity: the state
 *  after its last change before `at`, and both sides of any change in that same second, which the
 *  record cannot order against `at`. A string says why the record cannot tell: it does not reach
 *  back that far, or a link in it is missing. */
export function stateAt(defaultBranch: string, activity: Activity[], at: string): string[] | string {
  const pushes = activity.filter((a) => a.ref === heads(defaultBranch)).sort((x, y) => x.timestamp.localeCompare(y.timestamp));
  for (let i = 1; i < pushes.length; i++) {
    if (pushes[i].before !== pushes[i - 1].after) {
      return `${defaultBranch}'s recorded activity is missing a change between ${short(pushes[i - 1].after)} and ${short(pushes[i].before)}`;
    }
  }
  const earlier = pushes.filter((p) => p.timestamp < at);
  const same = pushes.filter((p) => p.timestamp === at);
  if (!earlier.length && !(same.length && same[0].before === ZERO)) return `${defaultBranch}'s recorded activity does not reach back to ${at}`;
  return [...new Set([...(earlier.length ? [earlier[earlier.length - 1].after] : []), ...same.flatMap((p) => [p.before, p.after])])].filter((c) => c !== ZERO);
}

/** Establish: a collector is created at the default branch's tip as it was at that moment, judged
 *  from the activity recorded when it happened, never from the default branch's tip at audit time. */
export function establishment(defaultBranch: string, ref: string, activity: Activity[]): Verdict {
  if (!ref.startsWith("kaal/")) return { kind: "not-applicable", message: `Not a collector: ${ref}.` };
  const created = activity.filter((a) => a.ref === heads(ref) && a.activity_type === "branch_creation")
    .sort((x, y) => x.timestamp.localeCompare(y.timestamp)).at(-1);
  if (!created) return { kind: "fail", message: `Cannot judge where ${ref} was established: GitHub's activity records no creation of it. See ${GUIDE}#establish` };
  const then = stateAt(defaultBranch, activity, created.timestamp);
  const what = `${ref} was established at ${short(created.after)} on ${created.timestamp}`;
  if (typeof then === "string") return { kind: "fail", message: `Cannot judge where ${ref} was established: ${then}. See ${GUIDE}#establish` };
  if (then.includes(created.after)) return { kind: "pass", message: `${what}, ${defaultBranch}'s tip at that moment.` };
  return {
    kind: "fail",
    message:
      `${what}, but ${defaultBranch}'s tip at that moment was ${then.map(short).join(" or ")}. A collector starts at ${defaultBranch}'s tip. ` +
      `If it holds no Change yet, delete it and establish it again at ${defaultBranch}'s tip; otherwise synchronize it before its promotion. See ${GUIDE}#establish`,
  };
}

/** An Owner hold that keeps a fully promoted collector, as holds.json records it. */
export interface Hold {
  collector: string;
  reason: string;
  /** A link to the Owner's ruling. */
  ruling: string;
}

/** Why a hold does not evidence itself, or null when it does: it names a reason and links a ruling. */
export function unevidenced(h: Hold): string | null {
  if (typeof h.reason !== "string" || !h.reason.trim()) return "it states no reason";
  if (typeof h.ruling !== "string" || !/^https:\/\/\S+$/.test(h.ruling)) return "it links no ruling";
  return null;
}

export type AuditVerdict = { kind: "pass" | "fail" | "held"; message: string };

export interface CollectorFacts {
  defaultBranch: string;
  collector: string;
  tip: string;
  /** The tip is a commit on the default branch's first-parent history: established, with no Change yet. */
  onDefault: boolean;
  /** The promotion that took everything the collector holds: the newest merged pull request from it
   *  into the default branch whose head the tip contains, when the tip's tree is a state of the
   *  default branch at or after that promotion's merge commit. Tree equality alone is never a
   *  promotion. null when there is none. */
  promoted: { number: number; merge: string } | null;
  /** Open pull requests into the collector. */
  openTargets: number[];
  hold: Hold | null;
  /** Why its facts are not complete enough to judge it, or null. */
  unknown: string | null;
}

export function collector(f: CollectorFacts): AuditVerdict {
  const c = f.collector;
  if (f.unknown !== null) return { kind: "fail", message: `Cannot judge ${c}: ${f.unknown}. See ${GUIDE}#promote` };
  if (f.hold !== null) {
    const why = unevidenced(f.hold);
    if (why !== null) return { kind: "fail", message: `The hold on ${c} is not evidenced: ${why}. See ${GUIDE}#promote` };
  }
  if (f.onDefault) return { kind: "pass", message: `${c} is established at ${f.defaultBranch}'s state ${short(f.tip)} and holds no Change yet.` };
  if (f.promoted === null) return { kind: "pass", message: `${c} holds work no promotion of it has taken to ${f.defaultBranch}.` };
  const done = `${c} is fully promoted: #${f.promoted.number} took it to ${f.defaultBranch} at ${short(f.promoted.merge)}, and it holds nothing since`;
  if (f.hold !== null) return { kind: "held", message: `${done}. It is kept because the Owner holds it: ${f.hold.reason} (${f.hold.ruling}).` };
  if (f.openTargets.length) {
    return {
      kind: "fail",
      message:
        `${done}, but ${f.openTargets.map((n) => `#${n}`).join(" ")} still target it. Land them and promote again, or delete ${c} and ` +
        `rebase each onto the collector established again from ${f.defaultBranch}. See ${GUIDE}#promote`,
    };
  }
  return { kind: "fail", message: `${done}. Delete it, and establish it again from ${f.defaultBranch}'s tip when new work begins. See ${GUIDE}#promote` };
}

export interface WorkingBranchFacts {
  defaultBranch: string;
  branch: string;
  tip: string;
  /** Merged pull requests whose head was this branch: the head each merged, and whether the tip is
   *  that head ("at"), contains it and moved on ("past"), or does not contain it ("apart": a branch
   *  created again under the same name). */
  merged: { number: number; head: string; tip: "at" | "past" | "apart" }[];
  /** Why its facts are not complete enough to judge it, or null. */
  unknown: string | null;
}

/** A working branch is deleted when its Change merges. Reusing it for another Change is not allowed;
 *  only a branch created again under the same name, apart from the merged head, is a new one. */
export function workingBranch(f: WorkingBranchFacts): Verdict {
  if (f.branch === f.defaultBranch || f.branch.startsWith("kaal/")) return { kind: "not-applicable", message: `Not a working branch: ${f.branch}.` };
  if (f.unknown !== null) return { kind: "fail", message: `Cannot judge ${f.branch}: ${f.unknown}. See ${GUIDE}#branches` };
  const at = f.merged.find((m) => m.tip === "at");
  if (at) return { kind: "fail", message: `${f.branch}: its Change merged as #${at.number} at ${short(f.tip)}. Delete the branch. See ${GUIDE}#branches` };
  const past = f.merged.filter((m) => m.tip === "past");
  if (past.length) {
    return {
      kind: "fail",
      message:
        `${f.branch} was reused: it still carries the head of ${past.map((m) => `#${m.number}`).join(" ")}, merged, and moved on to ${short(f.tip)}. ` +
        `A working branch is deleted when its Change merges. Move its new work to a new branch from the collector's tip, and delete this one. See ${GUIDE}#branches`,
    };
  }
  return {
    kind: "pass",
    message: f.merged.length
      ? `${f.branch} is a new branch under a name that ${f.merged.map((m) => `#${m.number}`).join(" ")} used: it does not carry their heads.`
      : `${f.branch} carries work no merged pull request landed.`,
  };
}

/** Change's numbering rule, as kaal-change/record exports it: of the files a Change changes, the
 *  Change Record it claims, and why that claim does not hold in the collector. */
export type CheckClaim = (files: { kind: ChangeKind; changed: string[]; collector: string[] }) => { claimed: string[]; findings: string[] };

/** What a Change brings its collector, as its flow decides: a substantive Change lands by squash; a
 *  synchronization carries work main already accepted and lands with a merge commit. */
export type ChangeKind = "substantive" | "synchronization";

/** Where the default branch holds Change's numbering rule. */
export const RULES = "packages/skills/kaal-change/lib/record.mjs";

export interface ClaimFacts {
  defaultBranch: string;
  baseRef: string;
  /** The collector's tip the Change is judged against. */
  baseTip: string;
  /** The Change's kind, from its flow, or null when its Branching verdict fails, so it has none. */
  kind: ChangeKind | null;
  /** Change's rule as accepted on the default branch, or null while the default branch holds none. */
  rules: CheckClaim | null;
  /** The files the pull request adds, modifies or deletes since its fork point, except those it
   *  leaves as the default branch's tip holds them: accepted already, so a synchronization claims
   *  none. */
  changed: string[];
  /** The files at the collector's current tip. */
  collector: string[];
}

/** A Change claims at most one Change Record, free in its collector's current tip. The number is
 *  provisional until the Change lands: one closed without landing consumes none, and a claim taken
 *  in the meantime is renamed and checked again. Which record a Change claims, and when a claim
 *  collides, are Change's rules; this verdict applies them to the collector's tip as it is now. */
export function claim(f: ClaimFacts): Verdict {
  if (!f.baseRef.startsWith("kaal/")) return { kind: "not-applicable", message: `Change Records are claimed in a collector, not in ${f.baseRef}.` };
  if (f.rules === null) {
    return { kind: "not-applicable", message: `Change Record numbering is not in force: ${f.defaultBranch} holds no ${RULES}. A rule applies once it is accepted on ${f.defaultBranch}.` };
  }
  if (f.kind === null) {
    return { kind: "fail", message: `Cannot judge its Change Record claim: its Branching verdict fails, so it is neither a substantive Change nor a synchronization. See ${TELLING}` };
  }
  const { claimed, findings } = f.rules({ kind: f.kind, changed: f.changed, collector: f.collector });
  if (findings.length) {
    return { kind: "fail", message: `The Change Record claim does not hold in ${f.baseRef} at ${short(f.baseTip)}: ${findings.join("; ")}. See ${GUIDE}#claim` };
  }
  return {
    kind: "pass",
    message: claimed.length
      ? `Claims ${claimed.join(", ")}, free in ${f.baseRef} at ${short(f.baseTip)}. The number is provisional until it lands; a newer tip is checked again.`
      : `A ${f.kind} Change, claiming no Change Record.`,
  };
}

// ---- Facts: read from Git ------------------------------------------------------------------

function git(cwd: string, args: string[], ok: number[] = [0]): { status: number; stdout: string } {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.error) throw r.error;
  const status = r.status ?? -1;
  if (!ok.includes(status)) throw new Error(`git ${args.join(" ")} exited ${status}: ${r.stderr.trim()}`);
  return { status, stdout: r.stdout };
}

const rev = (cwd: string, spec: string) => git(cwd, ["rev-parse", "--verify", "--end-of-options", spec]).stdout.trim();
const isAncestor = (cwd: string, a: string, b: string) =>
  git(cwd, ["merge-base", "--is-ancestor", a, b], [0, 1, 128]).status === 0;
/** A path's entry in a commit's tree, mode and object, or "" when the commit does not hold it. */
const entry = (cwd: string, c: string, path: string) => git(cwd, ["ls-tree", "--full-tree", "-z", c, "--", path]).stdout.split("\t")[0];
const parents = (cwd: string, c: string) => git(cwd, ["rev-list", "--parents", "-n", "1", c]).stdout.trim().split(" ").slice(1);

export function merge(cwd: string, ours: string, theirs: string, base?: string): MergeResult {
  const args = ["merge-tree", "--write-tree", "--name-only", "--no-messages", "-z"];
  if (base) args.push(`--merge-base=${base}`);
  const { status, stdout } = git(cwd, [...args, ours, theirs], [0, 1]);
  const [tree, ...rest] = stdout.split("\0");
  return { clean: status === 0, tree, conflicts: [...new Set(rest.filter(Boolean))].sort() };
}

function changed(cwd: string, a: string, b: string): string[] {
  return git(cwd, ["diff", "--no-renames", "--name-only", "-z", a, b]).stdout.split("\0").filter(Boolean);
}

/** The Synchronized-with value a commit message states, or null when it states none or several. */
export function marker(message: string): string | null {
  const found = new Set([...message.matchAll(/^Synchronized-with: ([0-9a-f]{40})$/gm)].map((m) => m[1]));
  return found.size === 1 ? [...found][0] : null;
}
const markerOf = (cwd: string, c: string) => marker(git(cwd, ["log", "-1", "--format=%B", c]).stdout);

/** Whether commit c is `from` synchronized with s over base: equal to their merge except where the
 *  merge conflicts. */
function synchronizes(cwd: string, c: string, from: string, s: string, base: string): { ok: boolean; expected: MergeResult; differing: string[] } {
  const expected = merge(cwd, s, from, base);
  const differing = changed(cwd, expected.tree, c).filter((p) => !expected.conflicts.includes(p));
  return { ok: differing.length === 0, expected, differing };
}

const exists = (cwd: string, c: string) => git(cwd, ["cat-file", "-e", `${c}^{commit}`], [0, 1, 128]).status === 0;

/** Whether s is a state the default branch admitted: a commit on its first-parent history. */
function admitted(cwd: string, s: string, defaultTip: string): boolean {
  if (!exists(cwd, s) || !isAncestor(cwd, s, defaultTip)) return false;
  return git(cwd, ["rev-list", "--first-parent", defaultTip]).stdout.split("\n").includes(s);
}

/** The last default-branch state the lineage verifiably incorporated: its fork point, advanced along
 *  its first-parent history by each commit that states Synchronized-with, names an admitted state
 *  strictly newer than the one so far, and is verified to be that synchronization. It only moves
 *  forward. A marker that does not verify is ignored. */
export function incorporated(cwd: string, lineageTip: string, defaultTip: string): string {
  let base = git(cwd, ["merge-base", lineageTip, defaultTip]).stdout.trim();
  const history = git(cwd, ["rev-list", "--first-parent", "--reverse", lineageTip, `^${base}`]).stdout.split("\n").filter(Boolean);
  for (const c of history) {
    const s = markerOf(cwd, c);
    if (!s || s === base || !isAncestor(cwd, base, s) || !admitted(cwd, s, defaultTip)) continue;
    const ps = parents(cwd, c);
    if (ps.length === 1 && synchronizes(cwd, c, ps[0], s, base).ok) base = s;
  }
  return base;
}

export function readFreshness(cwd: string, defaultBranch: string, defaultTip: string, headRef: string, head: string): FreshnessFacts {
  return {
    defaultBranch, defaultTip, headRef, head, headTree: rev(cwd, `${head}^{tree}`),
    containsTip: isAncestor(cwd, defaultTip, head), merge: merge(cwd, defaultTip, head),
  };
}

export function readSync(cwd: string, defaultBranch: string, lineage: string, defaultTip: string, lineageTip: string, head: string): SyncFacts {
  const inc = incorporated(cwd, lineageTip, defaultTip);
  const ps = parents(cwd, head);
  const merged = ps.length === 2 && isAncestor(cwd, ps[1], defaultTip) && !isAncestor(cwd, ps[1], lineageTip) ? ps[1] : null;
  const markerOnDefault = merged !== null && admitted(cwd, merged, defaultTip);
  const advances = merged !== null && markerOnDefault && merged !== inc && isAncestor(cwd, inc, merged);
  const carried = git(cwd, ["rev-list", "--count", head, `^${lineageTip}`]).stdout.trim();
  const own = git(cwd, ["rev-list", "--count", head, `^${lineageTip}`, `^${defaultTip}`]).stdout.trim();
  const facts: SyncFacts = {
    defaultBranch, lineage, defaultTip, lineageTip, head, merged, marker: markerOf(cwd, head),
    onLineageTip: ps.length > 0 && isAncestor(cwd, lineageTip, ps[0]),
    carriesDefault: carried !== own,
    markerOnDefault, advances, incorporated: inc,
    expected: { clean: true, tree: "", conflicts: [] }, differing: [], adopted: [],
  };
  if (merged !== null && facts.onLineageTip && advances) {
    const { expected, differing } = synchronizes(cwd, head, lineageTip, merged, inc);
    facts.expected = expected;
    facts.differing = differing;
    facts.adopted = expected.conflicts.filter((p) => entry(cwd, head, p) === entry(cwd, merged, p));
  }
  return facts;
}

/** The method a pull request into baseRef lands by, judged against the base at baseTip. */
export function readExpected(cwd: string, defaultBranch: string, baseRef: string, defaultTip: string, baseTip: string, head: string): "squash" | "merge" | null {
  if (baseRef === defaultBranch) return "squash";
  return methodFor(defaultBranch, baseRef, synchronization(readSync(cwd, defaultBranch, baseRef, defaultTip, baseTip, head)));
}

/** A pull request as GitHub reports it: its base ref, its head commit, and its merge commit, which
 *  is the base's new tip for every method; null while it is unmerged. */
export interface Pull {
  number: number;
  base: string;
  head: string;
  merge: string | null;
}

/** The one pull request that landed `after` on baseRef, or why there is none: GitHub's association
 *  of a commit with pull requests is not unique, so only a merged pull request into baseRef whose
 *  merge commit is `after` counts, and it must be the only one. */
export function attribute(pulls: Pull[], baseRef: string, after: string): Pull | string {
  const landed = pulls.filter((p) => p.base === baseRef && p.merge === after);
  if (landed.length === 1) return landed[0];
  if (landed.length > 1) return `GitHub names ${landed.map((p) => `#${p.number}`).join(" ")}, each with merge commit ${short(after)}, so none is attributable alone`;
  return pulls.length
    ? `GitHub associates ${pulls.map((p) => `#${p.number}`).join(" ")} with it, but none merged into ${baseRef} with merge commit ${short(after)}`
    : "GitHub associates no pull request with it";
}

/** The facts of a landing, judged on the base as it stood before it and on the default tip given,
 *  which may be later than the landing: the default branch only moves forward, and every state a
 *  head can merge in stays on its first-parent history. */
export function readLanding(
  cwd: string, defaultBranch: string, baseRef: string, defaultTip: string, before: string, after: string, pulls: Pull[],
): LandingFacts {
  const found = attribute(pulls, baseRef, after);
  let unattributed = typeof found === "string" ? found : null;
  if (typeof found !== "string" && !exists(cwd, found.head)) unattributed = `the head ${short(found.head)} of #${found.number} is not in this repository`;
  const pull = unattributed === null && typeof found !== "string" ? found.number : null;
  const head = pull !== null && typeof found !== "string" ? rev(cwd, found.head) : null;
  const claimed = head === null ? null : markerOf(cwd, head);
  const unseen = claimed !== null && !isAncestor(cwd, claimed, defaultTip) ? claimed : null;
  return {
    defaultBranch, baseRef, before, after, pull, head, unattributed, unseen,
    expected: head === null ? null : readExpected(cwd, defaultBranch, baseRef, defaultTip, before, head),
    commits: Number(git(cwd, ["rev-list", "--first-parent", "--count", after, `^${before}`]).stdout.trim()),
    parents: parents(cwd, after),
  };
}

const onFirstParent = (cwd: string, c: string, defaultTip: string) =>
  isAncestor(cwd, c, defaultTip) && git(cwd, ["rev-list", "--first-parent", defaultTip]).stdout.split("\n").includes(c);

/** What GitHub reports of a collector: the open pull requests into it, and its merged promotions
 *  into the default branch with their heads and merge commits. */
export interface CollectorRecord {
  open: number[];
  promotions: { number: number; head: string; merge: string }[];
}

/** Every collector under refPrefix, with the facts its audit needs. A collector GitHub reported
 *  nothing for, or whose promotion is not in this repository, cannot be judged. */
export function readCollectors(
  cwd: string, defaultBranch: string, defaultTip: string, refPrefix: string, holds: Hold[], records: Record<string, CollectorRecord>,
): CollectorFacts[] {
  const firstParent = git(cwd, ["log", "--first-parent", "--format=%H %T", defaultTip]).stdout.split("\n").filter(Boolean).map((l) => l.split(" "));
  const order = new Map(firstParent.map(([c], i) => [c, i])); // 0 is the tip: a lower index is newer
  const refs = git(cwd, ["for-each-ref", "--format=%(refname) %(objectname)", refPrefix]).stdout.split("\n").filter(Boolean);
  return refs.map((l) => {
    const [ref, tip] = l.split(" ");
    const name = `kaal/${ref.slice(refPrefix.length)}`;
    const record = records[name];
    const facts: CollectorFacts = {
      defaultBranch, collector: name, tip, onDefault: order.has(tip), promoted: null,
      openTargets: record?.open ?? [], hold: holds.find((h) => h.collector === name) ?? null,
      unknown: record ? null : "GitHub reported no pull requests for it",
    };
    if (!record || facts.onDefault) return facts;
    const tree = rev(cwd, `${tip}^{tree}`);
    for (const p of [...record.promotions].sort((x, y) => (order.get(x.merge) ?? Infinity) - (order.get(y.merge) ?? Infinity))) {
      if (!exists(cwd, p.head) || !order.has(p.merge)) {
        facts.unknown = `its promotion #${p.number} is not in this repository as ${defaultBranch} holds it`;
        return facts;
      }
      if (!isAncestor(cwd, p.head, tip)) continue;
      const since = firstParent.slice(0, order.get(p.merge)! + 1);
      if (since.some(([, t]) => t === tree)) facts.promoted = { number: p.number, merge: p.merge };
      break;
    }
    return facts;
  });
}

/** What GitHub reports of a working branch: its tip, and the merged pull requests whose head ref it was. */
export interface BranchRecord {
  branch: string;
  tip: string;
  merged: { number: number; head: string }[];
}

export function readWorkingBranch(cwd: string, defaultBranch: string, b: BranchRecord): WorkingBranchFacts {
  const missing = [b.tip, ...b.merged.map((m) => m.head)].find((c) => !exists(cwd, c));
  if (missing) return { defaultBranch, branch: b.branch, tip: b.tip, merged: [], unknown: `${short(missing)} is not in this repository` };
  return {
    defaultBranch, branch: b.branch, tip: b.tip, unknown: null,
    merged: b.merged.map((m) => ({ ...m, tip: m.head === b.tip ? "at" : isAncestor(cwd, m.head, b.tip) ? "past" : "apart" })),
  };
}

const KIND = { squash: "substantive", merge: "synchronization", none: null } as const;
const diffed = (cwd: string, a: string, b: string) => git(cwd, ["diff", "--no-renames", "--name-only", "-z", a, b]).stdout.split("\0").filter(Boolean);
const files = (cwd: string, c: string) => git(cwd, ["ls-tree", "-r", "-z", "--name-only", c]).stdout.split("\0").filter(Boolean);

/** Change's rule as the default branch's tip holds it, or null when it holds none. */
async function rulesAt(cwd: string, defaultTip: string): Promise<CheckClaim | null> {
  if (git(cwd, ["cat-file", "-e", `${defaultTip}:${RULES}`], [0, 1, 128]).status !== 0) return null;
  const dir = mkdtempSync(join(tmpdir(), "claim-"));
  try {
    const file = join(dir, "record.mjs");
    writeFileSync(file, git(cwd, ["show", `${defaultTip}:${RULES}`]).stdout);
    const rules = (await import(pathToFileURL(file).href)).checkClaim;
    if (typeof rules !== "function") throw new Error(`${RULES} at ${short(defaultTip)} exports no checkClaim`);
    return rules as CheckClaim;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function readClaim(cwd: string, defaultBranch: string, baseRef: string, defaultTip: string, baseTip: string, head: string): Promise<ClaimFacts> {
  const fork = git(cwd, ["merge-base", baseTip, head]).stdout.trim();
  const fromDefault = new Set(diffed(cwd, defaultTip, head));
  return {
    defaultBranch, baseRef, baseTip,
    kind: KIND[readExpected(cwd, defaultBranch, baseRef, defaultTip, baseTip, head) ?? "none"],
    rules: await rulesAt(cwd, defaultTip),
    changed: diffed(cwd, fork, head).filter((p) => fromDefault.has(p)),
    collector: files(cwd, baseTip),
  };
}

// ---- CLI ----------------------------------------------------------------------------------

const EXIT = { pass: 0, fail: 1, "not-applicable": 3 } as const;
const json = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
function jsonList<T>(path: string, ok: (x: any) => boolean): T[] {
  const xs = json(path);
  if (!Array.isArray(xs) || !xs.every(ok)) throw new Error(`${path} is not the list this verdict reads`);
  return xs as T[];
}

async function main(argv: string[]): Promise<number> {
  const [verdict, ...args] = argv;
  const cwd = process.cwd();
  let v: Verdict | SyncVerdict;
  if (verdict === "source" && args.length === 5) {
    const [repo, defaultBranch, baseRef, headRepo, headRef] = args;
    v = promotionSource({ repo, defaultBranch, baseRef, headRepo, headRef });
  } else if (verdict === "freshness" && args.length === 4) {
    const [def, defaultTip, headRef, head] = args;
    v = promotionFreshness(readFreshness(cwd, def, rev(cwd, defaultTip), headRef, rev(cwd, head)));
  } else if (verdict === "incorporated" && args.length === 2) {
    console.log(incorporated(cwd, rev(cwd, args[0]), rev(cwd, args[1])));
    return 0;
  } else if (verdict === "synchronization" && (args.length === 5 || (args.length === 7 && args[5] === "--resolutions"))) {
    const [def, lineage, defaultTip, lineageTip, head, , out] = args;
    const s = synchronization(readSync(cwd, def, lineage, rev(cwd, defaultTip), rev(cwd, lineageTip), rev(cwd, head)));
    if (out) writeFileSync(out, s.kind === "pass" ? s.resolutions.map((p) => `${p}\0`).join("") : "");
    v = s;
  } else if (verdict === "auto-merge" && args.length === 6) {
    const [def, baseRef, defaultTip, baseTip, head, enabled] = args;
    if (enabled !== "none" && !["squash", "merge", "rebase"].includes(enabled)) throw new Error(`not a merge method: ${enabled}`);
    const h = rev(cwd, head);
    v = autoMerge({
      baseRef, head: h, enabled: enabled === "none" ? null : (enabled as Method),
      expected: readExpected(cwd, def, baseRef, rev(cwd, defaultTip), rev(cwd, baseTip), h),
    });
  } else if (verdict === "landing" && args.length === 6) {
    const [def, baseRef, defaultTip, before, after, file] = args;
    const pulls = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(pulls) || !pulls.every((p) => Number.isInteger(p?.number) && typeof p.base === "string" && typeof p.head === "string")) {
      throw new Error(`${file} is not a list of pull requests`);
    }
    v = landing(readLanding(cwd, def, baseRef, rev(cwd, defaultTip), rev(cwd, before), rev(cwd, after), pulls as Pull[]));
  } else if (verdict === "claim" && args.length === 5) {
    const [def, baseRef, defaultTip, baseTip, head] = args;
    v = claim(await readClaim(cwd, def, baseRef, rev(cwd, defaultTip), rev(cwd, baseTip), rev(cwd, head)));
  } else if (verdict === "establishment" && args.length === 3) {
    const [def, ref, file] = args;
    v = establishment(def, ref, jsonList<Activity>(file, (a) => typeof a?.ref === "string" && typeof a.timestamp === "string"));
  } else if (verdict === "collectors" && args.length === 5) {
    const [def, defaultTip, prefix, holdsFile, recordsFile] = args;
    if (!prefix.endsWith("/")) throw new Error(`not a ref prefix: ${prefix}`);
    const holds = jsonList<Hold>(holdsFile, (h) => typeof h?.collector === "string");
    const records = json(recordsFile) as Record<string, CollectorRecord>;
    const verdicts = readCollectors(cwd, def, rev(cwd, defaultTip), prefix, holds, records).map(collector);
    for (const a of verdicts) (a.kind === "fail" ? console.error : console.log)(`${a.kind}: ${a.message}`);
    return verdicts.some((a) => a.kind === "fail") ? 1 : verdicts.some((a) => a.kind === "held") ? 4 : 0;
  } else if (verdict === "working-branches" && args.length === 2) {
    const [def, file] = args;
    const branches = jsonList<BranchRecord>(file, (b) => typeof b?.branch === "string" && typeof b.tip === "string" && Array.isArray(b.merged));
    const verdicts = branches.map((b) => workingBranch(readWorkingBranch(cwd, def, b)));
    for (const a of verdicts) if (a.kind !== "not-applicable") (a.kind === "fail" ? console.error : console.log)(`${a.kind}: ${a.message}`);
    return verdicts.some((a) => a.kind === "fail") ? 1 : 0;
  } else {
    console.error("usage: lineage.ts source <repo> <default> <base-ref> <head-repo> <head-ref>\n" +
      "       lineage.ts freshness <default> <default-tip> <head-ref> <head>\n" +
      "       lineage.ts synchronization <default> <lineage> <default-tip> <lineage-tip> <head> [--resolutions <file>]\n" +
      "       lineage.ts incorporated <lineage-tip> <default-tip>\n" +
      "       lineage.ts auto-merge <default> <base-ref> <default-tip> <base-tip> <head> <enabled-method|none>\n" +
      "       lineage.ts landing <default> <base-ref> <default-tip> <before> <after> <pulls.json>\n" +
      "       lineage.ts claim <default> <base-ref> <default-tip> <base-tip> <head>\n" +
      "       lineage.ts establishment <default> <ref> <activity.json>\n" +
      "       lineage.ts collectors <default> <default-tip> <ref-prefix> <holds.json> <collectors.json>\n" +
      "       lineage.ts working-branches <default> <branches.json>");
    return 2;
  }
  (v.kind === "fail" ? console.error : console.log)(v.message);
  return EXIT[v.kind];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await main(process.argv.slice(2));
  } catch (e) {
    console.error(`cannot judge: ${(e as Error).message}`);
    process.exitCode = 2;
  }
}
