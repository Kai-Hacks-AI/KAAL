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
// Exits 0 pass, 1 fail, 2 cannot judge, 3 not applicable. A consumer must treat 2 as a failure and
// 3 as "this verdict does not apply", never as a pass of it. --resolutions writes a verified
// synchronization's own resolutions, NUL-separated, as input for Change Isolation; resolutions that
// adopt the merged state's content unchanged are named in the verdict but not written.
//
// A passing synchronization proves structure only: everything outside the explicit resolutions is
// exactly the default branch with the lineage's outstanding Changes. Whether a resolution is right
// is not judged here; the lineage's tests and review decide that. Adoption only narrows what Change
// Isolation judges: the whole resulting tree still goes through every required check.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

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

/** Whether s is a state the default branch admitted: a commit on its first-parent history. */
function admitted(cwd: string, s: string, defaultTip: string): boolean {
  if (git(cwd, ["cat-file", "-e", `${s}^{commit}`], [0, 1, 128]).status !== 0 || !isAncestor(cwd, s, defaultTip)) return false;
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

// ---- CLI ----------------------------------------------------------------------------------

const EXIT = { pass: 0, fail: 1, "not-applicable": 3 } as const;

function main(argv: string[]): number {
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
  } else {
    console.error("usage: lineage.ts source <repo> <default> <base-ref> <head-repo> <head-ref>\n" +
      "       lineage.ts freshness <default> <default-tip> <head-ref> <head>\n" +
      "       lineage.ts synchronization <default> <lineage> <default-tip> <lineage-tip> <head> [--resolutions <file>]\n" +
      "       lineage.ts incorporated <lineage-tip> <default-tip>");
    return 2;
  }
  (v.kind === "fail" ? console.error : console.log)(v.message);
  return EXIT[v.kind];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(`cannot judge: ${(e as Error).message}`);
    process.exitCode = 2;
  }
}
