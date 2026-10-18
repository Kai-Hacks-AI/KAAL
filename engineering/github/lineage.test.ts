// Lineage verdicts: each on its own over fixed facts, then end to end on real Git repositories: a
// divergent lineage, overlapping edits, repeated upstream advances, a stale default branch, claims that
// do not hold, and one collector promoted again and again, including content it already promoted.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  GUIDE, incorporated, marker, merge, promotionFreshness, promotionSource, readFreshness, readSync, synchronization,
  type SyncFacts,
} from "./lineage.ts";

const A = "a".repeat(40), B = "b".repeat(40), C = "c".repeat(40), D = "d".repeat(40);

describe("promotionSource", () => {
  const f = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef: "kaal/x" };
  it("passes a kaal/* branch of this repository", () => assert.equal(promotionSource(f).kind, "pass"));
  it("does not apply outside the default branch", () => assert.equal(promotionSource({ ...f, baseRef: "kaal/y", headRef: "claude/z" }).kind, "not-applicable"));
  it("fails a working branch, pointing to the guide", () => {
    const v = promotionSource({ ...f, headRef: "claude/z" });
    assert.equal(v.kind, "fail");
    assert.match(v.message, /only from kaal\/\* branches of o\/r, not from o\/r:claude\/z/);
    assert.ok(v.message.endsWith(`${GUIDE}#promote`));
  });
  it("fails a kaal/* branch of a fork", () => assert.equal(promotionSource({ ...f, headRepo: "fork/r" }).kind, "fail"));
});

describe("promotionFreshness", () => {
  const f = { defaultBranch: "main", defaultTip: A, headRef: "kaal/x", head: B, headTree: C, containsTip: true };
  const fails = (g: object, re: RegExp) => {
    const v = promotionFreshness({ ...f, merge: { clean: true, tree: C, conflicts: [] }, ...g });
    assert.equal(v.kind, "fail");
    assert.match(v.message, re);
    assert.match(v.message, /Synchronize kaal\/x with main at aaaaaaa: on a branch from its tip, git merge aaaaaaa, .* with a merge commit\./);
    assert.ok(v.message.endsWith(`${GUIDE}#synchronize`));
  };
  it("passes when it contains the tip and the merge is exactly the head's tree", () =>
    assert.equal(promotionFreshness({ ...f, merge: { clean: true, tree: C, conflicts: [] } }).kind, "pass"));
  it("fails a head without the default branch's tip, whatever the merge would give", () =>
    fails({ containsTip: false }, /is not fresh: it does not contain main's tip aaaaaaa\./));
  it("fails a clean merge that was never validated", () => fails({ merge: { clean: true, tree: D, conflicts: [] } }, /never validated on its head/));
  it("fails a conflict and names the paths", () =>
    fails({ containsTip: false, merge: { clean: false, tree: D, conflicts: ["p", "q"] } }, /conflicts with main at aaaaaaa on p q/));
});

describe("synchronization", () => {
  const f: SyncFacts = {
    defaultBranch: "main", lineage: "kaal/x", defaultTip: A, lineageTip: B, head: C, merged: A, marker: null,
    onLineageTip: true, carriesDefault: true, markerOnDefault: true, advances: true, incorporated: D,
    expected: { clean: false, tree: D, conflicts: ["package.json"] }, differing: [], adopted: [],
  };
  const fails = (g: Partial<SyncFacts>, re: RegExp) => {
    const v = synchronization({ ...f, ...g });
    assert.equal(v.kind, "fail");
    assert.match(v.message, re);
    assert.match(v.message, /on a branch from kaal\/x's tip bbbbbbb, git merge a main commit S after ddddddd .* resolve every conflict explicitly in that merge commit, and land the pull request with a merge commit/);
    assert.ok(v.message.endsWith(`${GUIDE}#synchronize`));
  };
  it("passes fully current and names its explicit resolutions, as structure only", () => {
    const v = synchronization(f);
    assert.deepEqual([v.kind, v.current, v.resolutions], ["pass", true, ["package.json"]]);
    assert.match(v.message, /^Synchronized, fully current/);
    assert.match(v.message, /Land it with a merge commit, never by squash or rebase/);
    assert.match(v.message, /Structure verified; whether each resolution is right is for the lineage's tests and review/);
  });
  it("does not count a resolution adopted unchanged from the merged state as its own, and names it", () => {
    const v = synchronization({ ...f, expected: { ...f.expected, conflicts: [".gitattributes", "package.json"] }, adopted: [".gitattributes"] });
    assert.deepEqual([v.kind, v.resolutions, v.adopted], ["pass", ["package.json"], [".gitattributes"]]);
    assert.match(v.message, /explicit resolutions: package\.json; adopted unchanged from main at aaaaaaa: \.gitattributes\./);
    const all = synchronization({ ...f, adopted: ["package.json"] });
    assert.deepEqual([all.resolutions, all.adopted], [[], ["package.json"]]);
    assert.match(all.message, /explicit resolutions: none; adopted unchanged/);
  });
  it("adopts nothing for a synchronization that fails", () => assert.deepEqual(synchronization({ ...f, differing: ["x"], adopted: ["package.json"] }).adopted, []));
  it("accepts a Synchronized-with line that names the merged commit", () => assert.equal(synchronization({ ...f, marker: A }).kind, "pass"));
  it("treats a proposal that merges nothing from main and carries none of it as an ordinary Change, landed by squash", () => {
    const v = synchronization({ ...f, merged: null, carriesDefault: false });
    assert.equal(v.kind, "not-applicable");
    assert.match(v.message, /an ordinary Change into kaal\/x\. Land it by squash\./);
  });
  it("fails an ordinary Change that carries main's commits", () =>
    fails({ merged: null }, /carries main commits that kaal\/x does not hold, so it is neither an ordinary Change nor a synchronization/));
  it("fails a Synchronized-with line on anything but a merge commit of it", () => {
    fails({ merged: null, marker: A }, /states Synchronized-with aaaaaaa but is not a merge commit of it/);
    fails({ marker: D }, /Synchronized-with ddddddd is not the main commit aaaaaaa this merge brings in/);
  });
  it("fails when it does not build on the lineage's tip", () => fails({ onLineageTip: false }, /does not build on kaal\/x's tip bbbbbbb/));
  it("fails a merged commit that is not an admitted default-branch state", () => fails({ markerOnDefault: false }, /is not a commit on main's first-parent history/));
  it("passes an intermediate step and says the lineage is still behind", () => {
    const v = synchronization({ ...f, merged: C });
    assert.deepEqual([v.kind, v.current], ["pass", false]);
    assert.match(v.message, /^Synchronized, a valid intermediate step: .* main is at aaaaaaa: synchronize again from ccccccc/);
  });
  it("fails a merge that does not advance the incorporated state", () => fails({ advances: false }, /No progress: the merged aaaaaaa is not newer than ddddddd/));
  it("fails any other difference and names it", () => fails({ differing: ["AGENTS.md"] }, /on: AGENTS\.md\. Only paths where the two conflict may differ/));
});

describe("marker", () => {
  it("reads one Synchronized-with line", () => assert.equal(marker(`t\n\nSynchronized-with: ${A}\nCo-Authored-By: x`), A));
  it("states nothing when absent or ambiguous", () => {
    assert.equal(marker("t"), null);
    assert.equal(marker(`Synchronized-with: ${A}\nSynchronized-with: ${B}`), null);
  });
});

// ---- Acceptance: on real repositories -------------------------------------

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "lineage-"));
  const g = (...args: string[]) => {
    const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  const put = (files: Record<string, string | null>) => {
    for (const [p, v] of Object.entries(files)) {
      if (v === null) rmSync(join(dir, p), { force: true });
      else { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), v); }
    }
  };
  g("init", "-q", "-b", "main");
  g("config", "user.email", "e@x");
  g("config", "user.name", "e");
  /** A commit of `files` on `branch`'s tip, landed the way a one-commit pull request lands by squash. */
  const land = (branch: string, files: Record<string, string | null>, message = "a Change") => {
    const born = spawnSync("git", ["rev-parse", "-q", "--verify", branch], { cwd: dir }).status === 0;
    if (born) g("checkout", "-q", "--detach", branch);
    put(files);
    g("add", "-A");
    g("commit", "-q", "--allow-empty", "-m", message);
    if (born) g("branch", "-f", branch, "HEAD");
    else g("checkout", "-q", "--detach");
    return g("rev-parse", branch);
  };
  /** Land a pull request on branch by squash, as GitHub does: the merge of its head into the branch
   *  over Git's merge base, one parent (the tip), its message kept. Throws on a conflict. */
  const squash = (branch: string, head: string) => {
    const m = merge(dir, g("rev-parse", branch), head);
    if (!m.clean) throw new Error(`squash of ${head} into ${branch} conflicts on ${m.conflicts.join(" ")}`);
    g("branch", "-f", branch, g("commit-tree", m.tree, "-p", branch, "-m", g("log", "-1", "--format=%B", head)));
  };
  /** Land a pull request on branch with a merge commit, as GitHub does: both parents kept. */
  const mergeCommit = (branch: string, head: string) => {
    const m = merge(dir, g("rev-parse", branch), head);
    if (!m.clean) throw new Error(`merge of ${head} into ${branch} conflicts on ${m.conflicts.join(" ")}`);
    g("branch", "-f", branch, g("commit-tree", m.tree, "-p", branch, "-p", head, "-m", "Merge pull request"));
  };
  /** The agent's procedure (branching.md#synchronize), with ordinary Git only: a branch from the
   *  lineage's tip, git merge of a main commit, conflicts resolved by `resolve` in that merge commit. */
  const synchronize = (lineage: string, resolve: (conflicts: string[]) => Record<string, string | null> = () => ({}), to = "main") => {
    g("checkout", "-q", "-B", "work", lineage);
    const merged = spawnSync("git", ["merge", "-q", "--no-ff", "--no-commit", g("rev-parse", to)], { cwd: dir, encoding: "utf8" });
    if (merged.status !== 0) put(resolve(g("diff", "--name-only", "--diff-filter=U").split("\n").filter(Boolean)));
    g("add", "-A");
    g("commit", "-q", "--no-edit", "-m", `Synchronize ${lineage} with main`);
    const head = g("rev-parse", "HEAD");
    g("checkout", "-q", "--detach", "main");
    return head;
  };
  const judge = (lineage: string, head: string) =>
    synchronization(readSync(dir, "main", lineage, g("rev-parse", "main"), g("rev-parse", lineage), head));
  const fresh = (lineage: string) => promotionFreshness(readFreshness(dir, "main", g("rev-parse", "main"), lineage, g("rev-parse", lineage)));
  return { dir, g, put, land, squash, mergeCommit, synchronize, judge, fresh };
}

const pkg = (scripts: string[], name = "Engineering repository for KAAL") =>
  `{\n  "description": "${name}",\n  "scripts": {\n${scripts.map((s) => `    ${s},`).join("\n")}\n    "build": "tsc"\n  },\n  "engines": { "node": ">=24" }\n}\n`;
const MAIN_SCRIPTS = ['"test:hosting": "npm test -w kaal-hosting"'];
const KAAL_SCRIPTS = ['"test": "npm run test:hosting && npm run test:kaal"', ...MAIN_SCRIPTS, '"test:kaal": "node lanes/kaal.mjs"'];

describe("acceptance: synchronizing a divergent lineage", () => {
  const r = repo();
  r.land("main", { "README.md": "KAAL\n", "core/a.ts": "a\n" }, "initial");
  r.g("branch", "kaal/genesis", "main");
  // Diverge: the lineage engineers; main receives Changes the lineage lacks, one overlapping.
  r.land("kaal/genesis", { "AGENTS.md": "root pointer\n", "lanes/kaal.mjs": "lane\n" });
  r.land("kaal/genesis", { "package.json": pkg(KAAL_SCRIPTS) });
  r.land("main", { ".github/workflows/source.yml": "on: pull_request\n# end\n" }, ".github Change");
  r.land("main", { "package.json": pkg(MAIN_SCRIPTS) }, "root Change");
  const fork = r.g("merge-base", "main", "kaal/genesis");
  const keepLineage = (paths: string[]) => Object.fromEntries(paths.map((p) => [p, r.g("show", `kaal/genesis:${p}`) + "\n"]));

  let s1 = "";
  it("verifies the synchronization and names the real conflict as its explicit resolution", () => {
    s1 = r.synchronize("kaal/genesis", keepLineage);
    const v = r.judge("kaal/genesis", s1);
    assert.equal(v.kind, "pass", v.message);
    assert.deepEqual(v.resolutions, ["package.json"]);
  });

  it("fails a synchronization that drops a lineage Change", () => {
    r.g("checkout", "-q", "--detach", s1);
    r.g("rm", "-q", "AGENTS.md");
    const bad = r.g("commit-tree", r.g("write-tree"), "-p", "kaal/genesis", "-p", "main", "-m", "S");
    r.g("checkout", "-q", "-f", "main");
    const v = r.judge("kaal/genesis", bad);
    assert.equal(v.kind, "fail");
    assert.match(v.message, /on: AGENTS\.md\./);
  });

  it("fails a synchronization that carries anything else", () => {
    r.g("checkout", "-q", "--detach", s1);
    r.put({ "EXTRA.md": "extra\n" });
    r.g("add", "-A");
    const bad = r.g("commit-tree", r.g("write-tree"), "-p", "kaal/genesis", "-p", "main", "-m", "S");
    r.g("checkout", "-q", "-f", "main");
    assert.match(r.judge("kaal/genesis", bad).message, /on: EXTRA\.md\./);
  });

  it("tells an ordinary Change from a synchronization, and fails one that brings main in any other way", () => {
    const change = r.g("commit-tree", "kaal/genesis^{tree}", "-p", "kaal/genesis", "-m", "a Change");
    const v = r.judge("kaal/genesis", change);
    assert.equal(v.kind, "not-applicable");
    assert.match(v.message, /Land it by squash/);
    const onMain = r.g("commit-tree", "main^{tree}", "-p", "main", "-m", "a branch from main");
    assert.match(r.judge("kaal/genesis", onMain).message, /carries main commits that kaal\/genesis does not hold/);
    const after = r.g("commit-tree", `${s1}^{tree}`, "-p", s1, "-m", "more after the merge");
    assert.match(r.judge("kaal/genesis", after).message, /neither an ordinary Change nor a synchronization/);
    const reversed = r.g("commit-tree", `${s1}^{tree}`, "-p", fork, "-p", "main", "-m", "S");
    assert.match(r.judge("kaal/genesis", reversed).message, /does not build on kaal\/genesis's tip/);
  });

  it("fails a squash-style synchronization: main's content in one commit, without main's ancestry", () => {
    const flat = r.g("commit-tree", `${s1}^{tree}`, "-p", "kaal/genesis", "-m", `S\n\nSynchronized-with: ${r.g("rev-parse", "main")}`);
    assert.match(r.judge("kaal/genesis", flat).message, /states Synchronized-with \w+ but is not a merge commit of it/);
    const unmarked = r.g("commit-tree", `${s1}^{tree}`, "-p", "kaal/genesis", "-m", "S");
    assert.equal(r.judge("kaal/genesis", unmarked).kind, "not-applicable", "an unmarked one reads as an ordinary Change; freshness catches it at promotion");
  });

  it("remains a valid intermediate step once main advances, and is current once rebuilt", () => {
    r.land("main", { "docs/note.md": "note\n" }, "unrelated Change");
    const v = r.judge("kaal/genesis", s1);
    assert.deepEqual([v.kind, v.current], ["pass", false]);
    s1 = r.synchronize("kaal/genesis", keepLineage);
    assert.deepEqual([r.judge("kaal/genesis", s1).kind, r.judge("kaal/genesis", s1).current], ["pass", true]);
  });

  it("is not fresh for promotion when the synchronization lands by squash", () => {
    r.g("branch", "-f", "kaal/squashed", "kaal/genesis");
    r.squash("kaal/squashed", s1);
    assert.equal(r.g("rev-parse", "kaal/squashed^{tree}"), r.g("rev-parse", `${s1}^{tree}`), "the very same tree");
    assert.match(r.fresh("kaal/squashed").message, /conflicts with main at \w+ on package\.json/, "the conflict it resolved returns");
  });

  it("is fresh for promotion when the synchronization lands with a merge commit", () => {
    r.mergeCommit("kaal/genesis", s1);
    assert.equal(r.fresh("kaal/genesis").kind, "pass");
  });

  it("advances the incorporated state only through a verified synchronization", () => {
    assert.equal(incorporated(r.dir, r.g("rev-parse", "kaal/genesis"), r.g("rev-parse", "main")), r.g("rev-parse", "main"));
  });

  let s2 = "";
  it("synchronizes repeated upstream advances over overlapping edits without spurious conflicts", () => {
    // The lineage edits a file it received only through the synchronization; main edits its other end,
    // and package.json elsewhere.
    r.land("kaal/genesis", { ".github/workflows/source.yml": "# lineage note\non: pull_request\n# end\n" }, "lineage .github Change");
    r.land("main", { ".github/workflows/source.yml": "on: pull_request\n# end\n# main note\n" }, "main .github Change");
    r.land("main", { "package.json": pkg(MAIN_SCRIPTS, "Engineering repository of KAAL") }, "main root Change");
    const tip = r.g("rev-parse", "main"), lineage = r.g("rev-parse", "kaal/genesis");
    assert.deepEqual(merge(r.dir, tip, lineage, incorporated(r.dir, lineage, tip)).conflicts, []);
    assert.ok(merge(r.dir, tip, lineage, fork).conflicts.includes(".github/workflows/source.yml"), "the original fork point would conflict");
    assert.equal(r.g("merge-base", tip, lineage), incorporated(r.dir, lineage, tip), "Git's own merge base already knows the synchronization");
    s2 = r.synchronize("kaal/genesis");
    const v = r.judge("kaal/genesis", s2);
    assert.equal(v.kind, "pass", v.message);
    assert.deepEqual(v.resolutions, []);
    r.mergeCommit("kaal/genesis", s2);
  });

  it("names a true conflict on a later advance as the explicit resolution", () => {
    r.land("main", { ".github/workflows/source.yml": "# lineage note\non: pull_request_target\n# end\n# main note\n" }, "main changes the trigger");
    r.land("kaal/genesis", { ".github/workflows/source.yml": "# lineage note\non: push\n# end\n# main note\n" }, "lineage changes the trigger");
    const s3 = r.synchronize("kaal/genesis", () => ({ ".github/workflows/source.yml": "# lineage note\non: [push, pull_request_target]\n# end\n# main note\n" }));
    const v = r.judge("kaal/genesis", s3);
    assert.equal(v.kind, "pass", v.message);
    assert.deepEqual(v.resolutions, [".github/workflows/source.yml"]);
  });
});

describe("acceptance: stepwise synchronization", () => {
  const r = repo();
  const isolation = (paths: string[]) =>
    spawnSync(process.execPath, [join(import.meta.dirname, "../change-isolation/check.mjs")], { input: paths.join("\0"), encoding: "utf8" }).status;
  r.land("main", { ".github/workflows/ci.yml": "uses: checkout@v4\n", "package.json": pkg(MAIN_SCRIPTS) }, "initial");
  r.g("branch", "kaal/l", "main");
  const fork = r.g("rev-parse", "main");
  r.land("kaal/l", { ".github/workflows/ci.yml": "uses: checkout@v5\n" }, "lineage .github Change");
  r.land("kaal/l", { "package.json": pkg(KAAL_SCRIPTS) }, "lineage root Change");
  const github = r.land("main", { ".github/workflows/ci.yml": "uses: checkout@v4.2\n" }, "main .github Change");
  const root = r.land("main", { "package.json": pkg(['"test:hosting": "npm test --workspace kaal-hosting"']) }, "main root Change");
  const keepLineage = (paths: string[]) => Object.fromEntries(paths.map((p) => [p, r.g("show", `kaal/l:${p}`) + "\n"]));

  it("a synchronization straight to main's tip mixes .github and root resolutions, which Change Isolation rejects", () => {
    const v = r.judge("kaal/l", r.synchronize("kaal/l", keepLineage));
    assert.deepEqual([v.kind, v.current, v.resolutions], ["pass", true, [".github/workflows/ci.yml", "package.json"]]);
    assert.equal(isolation(v.resolutions), 1);
  });

  it("splits into two consecutive synchronizations whose resolutions each travel alone", () => {
    const step1 = r.synchronize("kaal/l", keepLineage, github);
    const v1 = r.judge("kaal/l", step1);
    assert.deepEqual([v1.kind, v1.current, v1.resolutions], ["pass", false, [".github/workflows/ci.yml"]]);
    assert.equal(isolation(v1.resolutions), 0);
    r.mergeCommit("kaal/l", step1);
    assert.equal(incorporated(r.dir, r.g("rev-parse", "kaal/l"), root), github, "the incorporated state advanced to step 1");

    const step2 = r.synchronize("kaal/l", keepLineage);
    const v2 = r.judge("kaal/l", step2);
    assert.deepEqual([v2.kind, v2.current, v2.resolutions], ["pass", true, ["package.json"]]);
    assert.equal(isolation(v2.resolutions), 0);
    r.mergeCommit("kaal/l", step2);
    assert.equal(incorporated(r.dir, r.g("rev-parse", "kaal/l"), root), root, "and then to main's tip");
  });

  it("treats a merge of what the lineage already holds as an ordinary Change, such as a working branch updated from it", () => {
    const stamp = (s: string) => r.g("commit-tree", "kaal/l^{tree}", "-p", "kaal/l", "-p", s, "-m", "S");
    for (const s of [root, github, fork]) assert.equal(r.judge("kaal/l", stamp(s)).kind, "not-applicable");
    const work = r.g("commit-tree", "kaal/l^{tree}", "-p", fork, "-m", "a Change from an older state");
    assert.equal(r.judge("kaal/l", r.g("commit-tree", "kaal/l^{tree}", "-p", work, "-p", "kaal/l", "-m", "Merge kaal/l")).kind, "not-applicable");
  });

  it("keeps a step valid but not current when main advances before it lands", () => {
    r.land("kaal/l", { "lanes/kaal.mjs": "lane\n" }, "lineage Change");
    r.land("main", { "docs/a.md": "a\n" }, "main Change a");
    const step = r.synchronize("kaal/l");
    r.land("main", { "docs/b.md": "b\n" }, "main Change b");
    const v = r.judge("kaal/l", step);
    assert.deepEqual([v.kind, v.current], ["pass", false]);
    assert.match(v.message, /synchronize again from/);
  });

  it("never advances on a merge of a state off main's first-parent history", () => {
    r.g("checkout", "-q", "-B", "side", "main");
    r.g("commit", "-q", "--allow-empty", "-m", "side");
    const side = r.g("rev-parse", "HEAD");
    r.g("checkout", "-q", "--detach", "main");
    r.g("merge", "-q", "--no-ff", "-m", "a merge on main", side);
    r.g("branch", "-f", "main", "HEAD");
    const v = r.judge("kaal/l", r.g("commit-tree", "kaal/l^{tree}", "-p", "kaal/l", "-p", side, "-m", "S"));
    assert.match(v.message, /is not a commit on main's first-parent history/);
  });
});

describe("acceptance: a Synchronized-with line is never proof", () => {
  const r = repo();
  r.land("main", { "a.txt": "1\n" }, "initial");
  r.g("branch", "kaal/x", "main");
  r.land("kaal/x", { "x.txt": "lineage\n" });
  const fork = r.g("rev-parse", "main");
  r.land("main", { "a.txt": "2\n", "b.txt": "main\n" }, "main Change");

  it("ignores a lineage commit that claims a synchronization it does not hold", () => {
    r.land("kaal/x", { "y.txt": "y\n" }, `Not really\n\nSynchronized-with: ${r.g("rev-parse", "main")}`);
    assert.equal(incorporated(r.dir, r.g("rev-parse", "kaal/x"), r.g("rev-parse", "main")), fork);
  });

  it("verifies the honest synchronization against the real state instead", () => {
    const v = r.judge("kaal/x", r.synchronize("kaal/x"));
    assert.equal(v.kind, "pass", v.message);
  });

  it("fails a head whose marker names a commit outside main, even as a merge of it", () => {
    const off = r.land("kaal/x", { "z.txt": "z\n" });
    r.land("kaal/x", { "w.txt": "w\n" });
    const bad = r.g("commit-tree", "kaal/x^{tree}", "-p", "kaal/x", "-p", off, "-m", `S\n\nSynchronized-with: ${off}`);
    assert.match(r.judge("kaal/x", bad).message, /states Synchronized-with \w+ but is not a merge commit of it/);
  });
});

describe("acceptance: promotion freshness", () => {
  const r = repo();
  r.land("main", { "a.txt": "1\n2\n3\n" }, "initial");
  r.g("branch", "kaal/p", "main");
  r.land("kaal/p", { "a.txt": "1\n2\nP\n" });
  it("passes a lineage established at main's tip", () => assert.equal(r.fresh("kaal/p").kind, "pass"));
  it("fails once main advances, even when the merge is clean", () => {
    r.land("main", { "b.txt": "b\n" });
    assert.match(r.fresh("kaal/p").message, /does not contain main's tip/);
  });
  it("fails a conflict and names it", () => {
    r.land("main", { "a.txt": "1\n2\nM\n" });
    assert.match(r.fresh("kaal/p").message, /conflicts with main at \w+ on a\.txt/);
  });
  it("passes again once a synchronization lands with a merge commit", () => {
    r.mergeCommit("kaal/p", r.synchronize("kaal/p", () => ({ "a.txt": "1\n2\nM\nP\n" })));
    assert.equal(r.fresh("kaal/p").kind, "pass");
  });
});

describe("acceptance: one collector, promoted again and again", () => {
  // The flow of branching.md on a simulated GitHub: Changes land on the collector by squash, the
  // collector lands on main by squash, and main returns to the collector by a merge-commit synchronization.
  const r = repo();
  r.land("main", { "README.md": "KAAL\n" }, "initial");
  r.g("branch", "kaal/c", "main");
  const change = (files: Record<string, string | null>) => {
    r.g("branch", "-f", "claude/work", "kaal/c");
    const head = r.land("claude/work", files);
    assert.equal(r.judge("kaal/c", head).kind, "not-applicable", "an ordinary Change");
    r.squash("kaal/c", head);
  };
  const promote = () => {
    const v = r.fresh("kaal/c");
    assert.equal(v.kind, "pass", v.message);
    r.squash("main", r.g("rev-parse", "kaal/c"));
  };
  const syncBack = (resolve?: (c: string[]) => Record<string, string | null>) => {
    const s = r.synchronize("kaal/c", resolve);
    const v = r.judge("kaal/c", s);
    assert.equal(v.kind, "pass", v.message);
    r.mergeCommit("kaal/c", s);
    return v;
  };
  const show = (ref: string, path: string) => spawnSync("git", ["show", `${ref}:${path}`], { cwd: r.dir, encoding: "utf8" });

  it("promotes its first Changes", () => {
    change({ "cap/a.txt": "1\n2\n3\n", "cap/old.txt": "old\n" });
    change({ "cap/b.txt": "b\n" });
    promote();
    assert.equal(show("main", "cap/a.txt").stdout, "1\n2\n3\n");
  });

  it("is not fresh after its own squash promotion until main is synchronized back, which needs no resolution", () => {
    assert.match(r.fresh("kaal/c").message, /does not contain main's tip/);
    assert.deepEqual(syncBack().resolutions, []);
    assert.equal(r.fresh("kaal/c").kind, "pass");
  });

  it("promotes changed and deleted content it already promoted, with main moving meanwhile", () => {
    change({ "cap/a.txt": "1\nTWO\n3\n", "cap/old.txt": null });
    r.land("main", { "docs/other.md": "other\n" }, "another capability");
    assert.match(r.fresh("kaal/c").message, /does not contain main's tip/);
    syncBack();
    promote();
    assert.equal(show("main", "cap/a.txt").stdout, "1\nTWO\n3\n");
    assert.notEqual(show("main", "cap/old.txt").status, 0, "the deleted file stays deleted");
    assert.equal(show("main", "docs/other.md").stdout, "other\n");
  });

  it("does so a third time, deleting lines it promoted twice before", () => {
    syncBack();
    change({ "cap/a.txt": "1\n3\n", "cap/b.txt": null });
    promote();
    assert.equal(show("main", "cap/a.txt").stdout, "1\n3\n");
    assert.notEqual(show("main", "cap/b.txt").status, 0);
    assert.equal(r.g("rev-parse", "main^{tree}"), r.g("rev-parse", "kaal/c^{tree}"));
  });

  it("names the conflict when the sync-back is skipped and promoted content is edited again", () => {
    r.g("branch", "-f", "kaal/skipped", "kaal/c");
    r.g("branch", "-f", "claude/work", "kaal/skipped");
    r.squash("kaal/skipped", r.land("claude/work", { "cap/a.txt": "1\nthree\n" }));
    assert.match(r.fresh("kaal/skipped").message, /conflicts with main at \w+ on cap\/a\.txt/);
  });
});

describe("command line", () => {
  const cli = (cwd: string, ...args: string[]) =>
    spawnSync(process.execPath, [join(import.meta.dirname, "lineage.ts"), ...args], { cwd, encoding: "utf8" });
  const r = repo();
  r.land("main", { "a.txt": "1\n2\n3\n" }, "initial");
  r.g("branch", "kaal/x", "main");
  r.land("kaal/x", { "a.txt": "1\n2\nX\n" });
  r.land("main", { "a.txt": "1\n2\nM\n" });

  it("exits 0, 1 and 3 for pass, fail and not applicable", () => {
    assert.equal(cli(r.dir, "source", "o/r", "main", "main", "o/r", "kaal/x").status, 0);
    const f = cli(r.dir, "source", "o/r", "main", "main", "o/r", "claude/x");
    assert.equal(f.status, 1);
    assert.match(f.stderr, /#promote/);
    assert.equal(cli(r.dir, "source", "o/r", "main", "kaal/y", "o/r", "claude/x").status, 3);
    assert.equal(cli(r.dir, "freshness", "main", "main", "kaal/x", "kaal/x").status, 1);
  });

  it("writes a verified synchronization's explicit resolutions for Change Isolation", () => {
    const head = r.synchronize("kaal/x", () => ({ "a.txt": "1\n2\nM\nX\n" }));
    const out = join(r.dir, "..", `resolutions-${process.pid}`);
    const s = cli(r.dir, "synchronization", "main", "kaal/x", "main", "kaal/x", head, "--resolutions", out);
    assert.equal(s.status, 0, s.stderr);
    assert.equal(readFileSync(out, "utf8"), "a.txt\0");
    rmSync(out);
  });

  it("prints the incorporated state a synchronization starts from", () => {
    const v = cli(r.dir, "incorporated", "kaal/x", "main");
    assert.equal(v.status, 0);
    assert.equal(v.stdout.trim(), r.g("merge-base", "kaal/x", "main"));
  });

  it("exits 2 when it cannot judge", () => {
    assert.equal(cli(r.dir, "freshness", "main", "main", "kaal/x", "no-such-ref").status, 2);
    assert.equal(cli(r.dir, "nonsense").status, 2);
  });
});

describe("acceptance: resolutions adopted from main", () => {
  const r = repo();
  const isolation = (paths: string[]) =>
    spawnSync(process.execPath, [join(import.meta.dirname, "../change-isolation/check.mjs")], { input: paths.join("\0"), encoding: "utf8" }).status;
  r.land("main", { ".github/workflows/ci.yml": "uses: checkout@v4\n", "package.json": pkg(MAIN_SCRIPTS), "core/x.ts": "x\n", "old.md": "old\n" }, "initial");
  r.g("branch", "kaal/l", "main");
  r.land("kaal/l", { ".github/workflows/ci.yml": "uses: checkout@v5\n" }, "lineage .github Change");
  r.land("kaal/l", { "package.json": pkg(KAAL_SCRIPTS) }, "lineage root Change");
  r.land("kaal/l", { "old.md": "lineage edit\n" }, "lineage edits a file main deletes");
  r.land("main", { ".github/workflows/ci.yml": "uses: checkout@v4.2\n" }, "main .github Change");
  r.land("main", { "package.json": pkg(['"test:hosting": "npm test --workspace kaal-hosting"']), "old.md": null }, "main root Change");
  const main = (paths: string[]) => Object.fromEntries(paths.map((p) => [p, r.g("ls-tree", "main", "--", p) ? r.g("show", `main:${p}`) + "\n" : null]));
  const lineage = (paths: string[]) => Object.fromEntries(paths.map((p) => [p, r.g("show", `kaal/l:${p}`) + "\n"]));

  it("names no own resolution when every conflict takes main's exact content, a deletion included", () => {
    const v = r.judge("kaal/l", r.synchronize("kaal/l", main));
    assert.deepEqual([v.kind, v.current, v.resolutions, v.adopted], ["pass", true, [], [".github/workflows/ci.yml", "old.md", "package.json"]]);
  });

  it("keeps a resolution to the lineage's side, or to anything new, as its own, judged by Change Isolation", () => {
    const v = r.judge("kaal/l", r.synchronize("kaal/l", (ps) => ({ ...main(ps), ...lineage(["package.json"]), "old.md": "merged by hand\n" })));
    assert.deepEqual([v.kind, v.resolutions, v.adopted], ["pass", ["old.md", "package.json"], [".github/workflows/ci.yml"]]);
    assert.equal(isolation(v.resolutions), 0);
    const mixed = r.judge("kaal/l", r.synchronize("kaal/l", (ps) => ({ ...main(ps), ...lineage([".github/workflows/ci.yml", "package.json"]) })));
    assert.deepEqual(mixed.resolutions, [".github/workflows/ci.yml", "package.json"]);
    assert.equal(isolation(mixed.resolutions), 1, "own resolutions still travel alone");
  });

  it("never relaxes the structural verdict: a fully adopted synchronization that changes anything else still fails", () => {
    r.g("checkout", "-q", "-B", "work", "kaal/l");
    spawnSync("git", ["merge", "-q", "--no-ff", "--no-commit", "main"], { cwd: r.dir });
    r.put({ ...main([".github/workflows/ci.yml", "package.json", "old.md"]), "core/x.ts": "slipped in\n" });
    r.g("add", "-A");
    r.g("commit", "-q", "--no-edit", "-m", "Synchronize");
    const head = r.g("rev-parse", "HEAD");
    r.g("checkout", "-q", "-f", "--detach", "main");
    const v = r.judge("kaal/l", head);
    assert.deepEqual([v.kind, v.resolutions, v.adopted], ["fail", [], []]);
    assert.match(v.message, /differs from main .* on: core\/x\.ts/);
  });

  it("adopts only an exact entry: the same bytes with another mode stay its own", () => {
    r.g("checkout", "-q", "-B", "work", "kaal/l");
    spawnSync("git", ["merge", "-q", "--no-ff", "--no-commit", "main"], { cwd: r.dir });
    r.put(main([".github/workflows/ci.yml", "package.json", "old.md"]));
    r.g("add", "-A");
    r.g("update-index", "--chmod=+x", "package.json");
    r.g("commit", "-q", "--no-edit", "-m", "Synchronize");
    const head = r.g("rev-parse", "HEAD");
    r.g("checkout", "-q", "-f", "--detach", "main");
    assert.deepEqual(r.judge("kaal/l", head).resolutions, ["package.json"]);
  });
});
