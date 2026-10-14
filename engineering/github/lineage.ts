#!/usr/bin/env node
// Lineage: this repository's Git realization of its branching flows, decided here and nowhere else.
// Each verdict is separately testable and returns an actionable diagnostic that points to the
// guide. CI and local hooks run this file; they supply inputs and act on the exit code only.
//
//   promotionSource      Promote: the default branch accepts pull requests only from kaal/* of this repository.
//   promotionFreshness   Promote: merging the promotion yields exactly the tree validated on its head.
//   synchronization      Synchronize: a lineage receives the default branch's current state with its
//                        own outstanding Changes kept, and its explicit resolutions are named.
//
// A `Synchronized-with: <sha>` line states intent only. Every claim it makes is verified against
// the actual Git state and the proposed result before it is used.
//
// Usage (inside a repository holding every commit named):
//   lineage.ts source <repo> <default> <base-ref> <head-repo> <head-ref>
//   lineage.ts freshness <default> <default-tip> <head-ref> <head>
//   lineage.ts synchronization <default> <lineage> <default-tip> <lineage-tip> <head> [--resolutions <file>]
// Exits 0 pass, 1 fail, 2 cannot judge, 3 not applicable. --resolutions writes a verified
// synchronization's explicit resolutions, NUL-separated, as input for Change Isolation.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const GUIDE = "engineering/github/branching.md";

export type Verdict = { kind: "pass" | "fail" | "not-applicable"; message: string };
export type SyncVerdict = Verdict & { resolutions: string[] };

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
  /** The merge of the promotion's head into the default branch's tip, over their Git merge base. */
  merge: MergeResult;
}

export function promotionFreshness(f: FreshnessFacts): Verdict {
  if (f.merge.clean && f.merge.tree === f.headTree) {
    return {
      kind: "pass",
      message: `Fresh: merging ${f.headRef} (${short(f.head)}) into ${f.defaultBranch} (${short(f.defaultTip)}) yields exactly the head's validated tree.`,
    };
  }
  const why = f.merge.clean
    ? `merging it into ${f.defaultBranch} at ${short(f.defaultTip)} would produce a tree that was never validated on its head`
    : `it conflicts with ${f.defaultBranch} at ${short(f.defaultTip)} on ${list(f.merge.conflicts)}`;
  return {
    kind: "fail",
    message:
      `${f.headRef} is not fresh: ${why}. Refresh it: rebase its Change onto ${short(f.defaultTip)} in a working branch, ` +
      `take that branch into a new kaal/* lineage established at ${short(f.defaultTip)}, and promote from that lineage; ` +
      `the new promotion supersedes this one. See ${GUIDE}#refresh-a-stale-promotion`,
  };
}

export interface SyncFacts {
  defaultBranch: string;
  lineage: string;
  defaultTip: string;
  lineageTip: string;
  head: string;
  /** The head's Synchronized-with value, as claimed; null when it states none. */
  marker: string | null;
  /** The head is one commit whose only parent is the lineage's tip. */
  oneCommitOnLineageTip: boolean;
  /** The marker names a commit of the default branch's history. */
  markerOnDefault: boolean;
  /** The last default-branch state the lineage verifiably incorporated (see incorporated()). */
  incorporated: string;
  /** The merge of the marker and the lineage's tip over the incorporated state. */
  expected: MergeResult;
  /** Paths where the head differs from expected.tree, other than expected.conflicts. */
  differing: string[];
}

export function synchronization(f: SyncFacts): SyncVerdict {
  const fail = (problem: string): SyncVerdict => ({
    kind: "fail",
    resolutions: [],
    message:
      `${problem} Rebuild it: in a working branch from ${f.defaultBranch} at ${short(f.defaultTip)}, rebase ${f.lineage}'s ` +
      `outstanding Changes (since ${short(f.incorporated)}) onto it and resolve conflicts explicitly; commit that tree as ` +
      `one commit on ${f.lineage}'s tip ${short(f.lineageTip)} with the line "Synchronized-with: ${f.defaultTip}" and push ` +
      `it to this pull request. See ${GUIDE}#synchronize`,
  });
  if (f.marker === null) {
    return { kind: "not-applicable", resolutions: [], message: `Not a synchronization: ${short(f.head)} states no Synchronized-with; an ordinary Change into ${f.lineage}.` };
  }
  if (!f.oneCommitOnLineageTip) return fail(`This synchronization is not one commit on ${f.lineage}'s tip ${short(f.lineageTip)}.`);
  if (!f.markerOnDefault) return fail(`Synchronized-with ${short(f.marker)} is not a commit of ${f.defaultBranch}.`);
  if (f.marker !== f.defaultTip) return fail(`Stale: ${f.defaultBranch} has advanced from ${short(f.marker)} to ${short(f.defaultTip)}.`);
  if (f.differing.length) {
    return fail(
      `This synchronization differs from ${f.defaultBranch} at ${short(f.marker)} with ${f.lineage}'s outstanding Changes on: ` +
        `${list(f.differing)}. Only paths where the two conflict may differ.`,
    );
  }
  const resolutions = f.expected.conflicts;
  return {
    kind: "pass",
    resolutions,
    message:
      `Synchronized: ${f.lineage} receives ${f.defaultBranch} at ${short(f.marker)} with its outstanding Changes since ` +
      `${short(f.incorporated)}; explicit resolutions: ${resolutions.length ? list(resolutions) : "none"}.`,
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

/** Whether commit c, on its only parent, is that parent synchronized with s over base: equal to
 *  their merge except where the merge conflicts. */
function synchronizes(cwd: string, c: string, parent: string, s: string, base: string): { ok: boolean; expected: MergeResult; differing: string[] } {
  const expected = merge(cwd, s, parent, base);
  const differing = changed(cwd, expected.tree, c).filter((p) => !expected.conflicts.includes(p));
  return { ok: differing.length === 0, expected, differing };
}

/** The last default-branch state the lineage verifiably incorporated: its fork point, advanced along
 *  its first-parent history by each commit that states Synchronized-with and is verified to be that
 *  synchronization. A marker that does not verify is ignored. */
export function incorporated(cwd: string, lineageTip: string, defaultTip: string): string {
  let base = git(cwd, ["merge-base", lineageTip, defaultTip]).stdout.trim();
  const history = git(cwd, ["rev-list", "--first-parent", "--reverse", lineageTip, `^${base}`]).stdout.split("\n").filter(Boolean);
  for (const c of history) {
    const s = markerOf(cwd, c);
    if (!s || s === base || !isAncestor(cwd, base, s) || !isAncestor(cwd, s, defaultTip)) continue;
    const ps = parents(cwd, c);
    if (ps.length === 1 && synchronizes(cwd, c, ps[0], s, base).ok) base = s;
  }
  return base;
}

export function readFreshness(cwd: string, defaultBranch: string, defaultTip: string, headRef: string, head: string): FreshnessFacts {
  return { defaultBranch, defaultTip, headRef, head, headTree: rev(cwd, `${head}^{tree}`), merge: merge(cwd, defaultTip, head) };
}

export function readSync(cwd: string, defaultBranch: string, lineage: string, defaultTip: string, lineageTip: string, head: string): SyncFacts {
  const inc = incorporated(cwd, lineageTip, defaultTip);
  const m = markerOf(cwd, head);
  const ps = parents(cwd, head);
  const markerOnDefault = m !== null && git(cwd, ["cat-file", "-e", `${m}^{commit}`], [0, 1, 128]).status === 0 && isAncestor(cwd, m, defaultTip);
  const facts: SyncFacts = {
    defaultBranch, lineage, defaultTip, lineageTip, head, marker: m,
    oneCommitOnLineageTip: ps.length === 1 && ps[0] === lineageTip,
    markerOnDefault, incorporated: inc,
    expected: { clean: true, tree: "", conflicts: [] }, differing: [],
  };
  if (m !== null && facts.oneCommitOnLineageTip && markerOnDefault) {
    const { expected, differing } = synchronizes(cwd, head, lineageTip, m, inc);
    facts.expected = expected;
    facts.differing = differing;
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
  } else if (verdict === "synchronization" && (args.length === 5 || (args.length === 7 && args[5] === "--resolutions"))) {
    const [def, lineage, defaultTip, lineageTip, head, , out] = args;
    const s = synchronization(readSync(cwd, def, lineage, rev(cwd, defaultTip), rev(cwd, lineageTip), rev(cwd, head)));
    if (out) writeFileSync(out, s.kind === "pass" ? s.resolutions.map((p) => `${p}\0`).join("") : "");
    v = s;
  } else {
    console.error("usage: lineage.ts source <repo> <default> <base-ref> <head-repo> <head-ref>\n" +
      "       lineage.ts freshness <default> <default-tip> <head-ref> <head>\n" +
      "       lineage.ts synchronization <default> <lineage> <default-tip> <lineage-tip> <head> [--resolutions <file>]");
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
