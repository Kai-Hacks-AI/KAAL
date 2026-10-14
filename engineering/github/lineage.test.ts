// Lineage verdicts: each on its own over fixed facts, then the synchronization scenarios from #46
// end to end on real Git repositories: a divergent lineage, overlapping edits, repeated upstream
// advances, a stale default branch, and markers that do not hold.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
  const f = { defaultBranch: "main", defaultTip: A, headRef: "kaal/x", head: B, headTree: C };
  it("passes when the merge is exactly the head's tree", () =>
    assert.equal(promotionFreshness({ ...f, merge: { clean: true, tree: C, conflicts: [] } }).kind, "pass"));
  it("fails a clean merge that was never validated", () => {
    const v = promotionFreshness({ ...f, merge: { clean: true, tree: D, conflicts: [] } });
    assert.equal(v.kind, "fail");
    assert.match(v.message, /never validated on its head\. Refresh it: rebase its Change onto aaaaaaa/);
    assert.ok(v.message.endsWith(`${GUIDE}#refresh-a-stale-promotion`));
  });
  it("fails a conflict and names the paths", () =>
    assert.match(promotionFreshness({ ...f, merge: { clean: false, tree: D, conflicts: ["p", "q"] } }).message, /conflicts with main at aaaaaaa on p q/));
});

describe("synchronization", () => {
  const f: SyncFacts = {
    defaultBranch: "main", lineage: "kaal/x", defaultTip: A, lineageTip: B, head: C, marker: A,
    oneCommitOnLineageTip: true, markerOnDefault: true, incorporated: D,
    expected: { clean: false, tree: D, conflicts: ["package.json"] }, differing: [],
  };
  const fails = (g: Partial<SyncFacts>, re: RegExp) => {
    const v = synchronization({ ...f, ...g });
    assert.equal(v.kind, "fail");
    assert.match(v.message, re);
    assert.match(v.message, /Rebuild it: .* with the line "Synchronized-with: a{40}"/);
    assert.ok(v.message.endsWith(`${GUIDE}#synchronize`));
  };
  it("passes and names its explicit resolutions", () => assert.deepEqual(synchronization(f).resolutions, ["package.json"]));
  it("does not apply without a marker", () => assert.equal(synchronization({ ...f, marker: null }).kind, "not-applicable"));
  it("fails when not one commit on the lineage's tip", () => fails({ oneCommitOnLineageTip: false }, /not one commit on kaal\/x's tip bbbbbbb/));
  it("fails a marker that is not a default-branch commit", () => fails({ markerOnDefault: false }, /is not a commit of main/));
  it("fails stale", () => fails({ marker: D }, /Stale: main has advanced from ddddddd to aaaaaaa/));
  it("fails any other difference and names it", () => fails({ differing: ["AGENTS.md"] }, /on: AGENTS\.md\. Only paths where the two conflict may differ/));
});

describe("marker", () => {
  it("reads one Synchronized-with line", () => assert.equal(marker(`t\n\nSynchronized-with: ${A}\nCo-Authored-By: x`), A));
  it("states nothing when absent or ambiguous", () => {
    assert.equal(marker("t"), null);
    assert.equal(marker(`Synchronized-with: ${A}\nSynchronized-with: ${B}`), null);
  });
});

// ---- Acceptance: the #46 scenarios on real repositories -------------------------------------

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
  /** Land a proposed commit on branch by squash: same tree, one parent (the tip), its message kept. */
  const squash = (branch: string, head: string) => {
    const c = g("commit-tree", `${head}^{tree}`, "-p", branch, "-m", g("log", "-1", "--format=%B", head));
    g("branch", "-f", branch, c);
  };
  /** The agent's procedure: a working branch from main's tip, the lineage's outstanding Changes since
   *  its incorporated state rebased onto it, conflicts resolved by `resolve`, the tree committed as one
   *  commit on the lineage's tip with the Synchronized-with line. */
  const synchronize = (lineage: string, resolve: (conflicts: string[]) => Record<string, string | null> = () => ({})) => {
    const tip = g("rev-parse", "main");
    const inc = incorporated(dir, g("rev-parse", lineage), tip);
    const outstanding = g("commit-tree", `${lineage}^{tree}`, "-p", inc, "-m", "outstanding");
    g("checkout", "-q", "-B", "work", tip);
    const picked = spawnSync("git", ["cherry-pick", "--no-commit", outstanding], { cwd: dir, encoding: "utf8" });
    if (picked.status !== 0) put(resolve(g("diff", "--name-only", "--diff-filter=U").split("\n").filter(Boolean)));
    g("add", "-A");
    const tree = g("write-tree");
    g("reset", "-q", "--hard");
    return g("commit-tree", tree, "-p", lineage, "-m", "Synchronize", "-m", `Synchronized-with: ${tip}`);
  };
  const judge = (lineage: string, head: string) =>
    synchronization(readSync(dir, "main", lineage, g("rev-parse", "main"), g("rev-parse", lineage), head));
  const fresh = (lineage: string) => promotionFreshness(readFreshness(dir, "main", g("rev-parse", "main"), lineage, g("rev-parse", lineage)));
  return { dir, g, put, land, squash, synchronize, judge, fresh };
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
    const bad = r.g("commit-tree", r.g("write-tree"), "-p", "kaal/genesis", "-m", `S\n\nSynchronized-with: ${r.g("rev-parse", "main")}`);
    r.g("checkout", "-q", "-f", "main");
    const v = r.judge("kaal/genesis", bad);
    assert.equal(v.kind, "fail");
    assert.match(v.message, /on: AGENTS\.md\./);
  });

  it("fails a synchronization that carries anything else", () => {
    r.g("checkout", "-q", "--detach", s1);
    r.put({ "EXTRA.md": "extra\n" });
    r.g("add", "-A");
    const bad = r.g("commit-tree", r.g("write-tree"), "-p", "kaal/genesis", "-m", `S\n\nSynchronized-with: ${r.g("rev-parse", "main")}`);
    r.g("checkout", "-q", "-f", "main");
    assert.match(r.judge("kaal/genesis", bad).message, /on: EXTRA\.md\./);
  });

  it("treats the main-based working branch without a marker as an ordinary Change, and fails it with one", () => {
    assert.equal(r.judge("kaal/genesis", r.g("rev-parse", "work")).kind, "not-applicable");
    const onMain = r.g("commit-tree", `${s1}^{tree}`, "-p", "main", "-m", `S\n\nSynchronized-with: ${r.g("rev-parse", "main")}`);
    assert.match(r.judge("kaal/genesis", onMain).message, /not one commit on kaal\/genesis's tip/);
  });

  it("fails as stale once main advances, and verifies once rebuilt", () => {
    r.land("main", { "docs/note.md": "note\n" }, "unrelated Change");
    const v = r.judge("kaal/genesis", s1);
    assert.equal(v.kind, "fail");
    assert.match(v.message, /^Stale: main has advanced/);
    s1 = r.synchronize("kaal/genesis", keepLineage);
    assert.equal(r.judge("kaal/genesis", s1).kind, "pass");
  });

  it("does not make the synchronized lineage a fresh promotion: promotion is a refresh", () => {
    r.squash("kaal/genesis", s1);
    const v = r.fresh("kaal/genesis");
    assert.equal(v.kind, "fail");
    assert.match(v.message, /Refresh it: rebase its Change onto/);
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
    assert.ok(merge(r.dir, tip, lineage, fork).conflicts.includes(".github/workflows/source.yml"), "the Git fork point would conflict");
    s2 = r.synchronize("kaal/genesis");
    const v = r.judge("kaal/genesis", s2);
    assert.equal(v.kind, "pass", v.message);
    assert.deepEqual(v.resolutions, []);
    r.squash("kaal/genesis", s2);
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

  it("fails a head whose marker names a commit outside main", () => {
    const off = r.land("kaal/x", { "z.txt": "z\n" });
    const bad = r.g("commit-tree", `${off}^{tree}`, "-p", "kaal/x", "-m", `S\n\nSynchronized-with: ${off}`);
    assert.match(r.judge("kaal/x", bad).message, /is not a commit of main/);
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
    assert.match(r.fresh("kaal/p").message, /never validated on its head/);
  });
  it("fails a conflict and names it", () => {
    r.land("main", { "a.txt": "1\n2\nM\n" });
    assert.match(r.fresh("kaal/p").message, /conflicts with main at \w+ on a\.txt/);
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
    assert.equal(spawnSync("cat", [out], { encoding: "utf8" }).stdout, "a.txt\0");
    rmSync(out);
  });

  it("exits 2 when it cannot judge", () => {
    assert.equal(cli(r.dir, "freshness", "main", "main", "kaal/x", "no-such-ref").status, 2);
    assert.equal(cli(r.dir, "nonsense").status, 2);
  });
});
