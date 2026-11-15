// Acceptance for the Change Isolation checker: path sets in, rule results out.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { check, readLedger, CannotJudge, LEDGER, gitBlob } from "./check.mjs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "check.mjs");

const passes = (paths) => assert.deepEqual(check(paths), []);
const fails = (paths, ...offending) =>
  assert.deepEqual(check(paths).map((v) => v.split(": ")[1].split(" ")[0]), offending);

describe("core travels alone", () => {
  it("passes a Core-only change with its tests, metadata, lockfile, acceptance and Engine sync", () => {
    passes(["packages/kaal-core/src/engine.ts", "packages/kaal-core/test/core.test.ts"]);
    passes([
      "packages/kaal-core/payload/core/Node.md",
      "packages/kaal-core/package.json",
      "package.json",
      "package-lock.json",
      "engineering/acceptance/embed.test.mjs",
      ".kaal/AGENTS.md",
      ".kaal/KAAL-KERNEL.md",
      ".kaal/core/Node.md",
    ]);
  });

  it("treats the deployed Engine foundation as Core", () => {
    fails([".kaal/core/Node.md", "packages/kaal-sealing/payload/Sealing.md"], "packages/kaal-sealing/payload/Sealing.md");
  });

  it("fails Core mixed with an unrelated Skill", () => {
    fails(
      ["packages/kaal-core/src/register.ts", "packages/kaal-sealing/src/seal.ts", "engineering/acceptance/sealing.test.mjs"],
      "packages/kaal-sealing/src/seal.ts",
      "engineering/acceptance/sealing.test.mjs",
    );
  });

  it("fails Core mixed with registered Skills in the Engine, repository docs or other engineering", () => {
    fails(
      ["packages/kaal-core/src/cli.ts", ".kaal/skills/kaal-sealing/Sealing.md", "README.md", "AGENTS.md", "engineering/change-isolation/check.mjs"],
      ".kaal/skills/kaal-sealing/Sealing.md",
      "README.md",
      "AGENTS.md",
      "engineering/change-isolation/check.mjs",
    );
  });

  it("fails a rename out of Core when given both sides", () => {
    fails(["packages/kaal-core/src/cli.ts", "packages/kaal-other/src/cli.ts"], "packages/kaal-other/src/cli.ts");
  });

  it("does not let a look-alike path pass as Core", () => {
    fails(["packages/kaal-core/src/node.ts", "packages/kaal-core-extra/index.ts"], "packages/kaal-core-extra/index.ts");
  });
});

describe(".github travels alone", () => {
  it("passes a .github-only change", () => {
    passes([".github/workflows/change-isolation.yml"]);
    passes([".github/workflows/a.yml", ".github/CODEOWNERS"]);
  });

  it("fails .github mixed with any outside file", () => {
    fails([".github/workflows/change-isolation.yml", "README.md"], "README.md");
    fails([".github/workflows/change-isolation.yml", "engineering/change-isolation/check.mjs"], "engineering/change-isolation/check.mjs");
    fails([".github/x.yml", ".githubx/y"], ".githubx/y");
  });

  it("fails .github mixed with Core under both rules", () => {
    fails(
      [".github/workflows/ci.yml", "packages/kaal-core/src/cli.ts"],
      ".github/workflows/ci.yml", // core travels alone
      "packages/kaal-core/src/cli.ts", // .github travels alone
    );
  });
});

describe("ordinary changes", () => {
  it("are unaffected", () => {
    passes([]);
    passes(["README.md"]);
    passes(["package.json", "package-lock.json", "engineering/acceptance/embed.test.mjs"]);
    passes([".kaal/skills/kaal-sealing/Sealing.md", "engineering/change-isolation/check.mjs"]);
  });

  it("include this repository's open Skill PRs as they stand", () => {
    // kaal-engineer-skill, as proposed into kaal/skills.
    passes([
      ".gitattributes",
      "README.md",
      "engineering/acceptance/engineer-skill.test.mjs",
      "package-lock.json",
      "package.json",
      "packages/kaal-engineer-skill/package.json",
      "packages/kaal-engineer-skill/payload/Engineer-Skill.md",
      "packages/kaal-engineer-skill/skills/kaal-engineer-skill/SKILL.md",
    ]);
  });
});

describe("aggregate changes", () => {
  it("do not bypass isolation: Core bundled with unrelated files does not conform", () => {
    assert.notDeepEqual(check([".gitattributes", "AGENTS.md", "README.md", "packages/kaal-core/src/cli.ts"]), []);
  });
});

describe("the CLI", () => {
  const run = (args, input) => spawnSync(process.execPath, [CLI, ...args], { input, encoding: "utf8" });

  it("reads paths from stdin and exits 0 or 1", () => {
    const ok = run([], "packages/kaal-core/src/cli.ts\npackage-lock.json\n");
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^ok: 2 changed paths conform/);
    const bad = run([], ".github/workflows/x.yml\nREADME.md\n");
    assert.equal(bad.status, 1);
    assert.equal(bad.stderr, ".github travels alone: README.md is outside .github/\n");
  });

  it("reads NUL-separated paths, keeping names that hold spaces or newlines", () => {
    const ok = run([], "packages/kaal-core/a b.ts\0packages/kaal-core/odd\nname.ts\0");
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^ok: 2 changed paths conform/);
    const bad = run([], "packages/kaal-core/src/cli.ts\0packages/kaal-sealing/new\nline.ts\0");
    assert.equal(bad.status, 1);
  });

  it("refuses unknown arguments and paths that are not repository-relative", () => {
    assert.equal(run(["extra"], "").status, 2);
    for (const p of ["./packages/kaal-core/x", "/packages/kaal-core/x", "a//b", "a/../packages/kaal-core/x"]) {
      assert.equal(run([], `README.md\n${p}\n`).status, 2, p);
    }
  });
});

// Transition ledger: a target-held, exact admission for one multi-owner change. The ledger commits to
// the path set and to every path's blob before and after, so these cases use fake blob ids for the rule
// and a real temporary Git repository for the CLI that reads them.
describe("transition ledger", () => {
  const blob = (n) => String(n).repeat(40).slice(0, 40);
  const PATHS = [
    "packages/kaal-foundation/package.json",
    "packages/kaal-core/package.json",
    "packages/kaal-change/package.json",
    "package-lock.json",
  ];
  const entry = (over = {}) => ({
    id: "t1",
    paths: PATHS,
    pre: Object.fromEntries(PATHS.map((p) => [p, blob(1)])),
    post: Object.fromEntries(PATHS.map((p) => [p, blob(2)])),
    ...over,
  });
  const facts = (base = blob(1), head = blob(2), overrides = {}) => (p) => ({ base, head, ...(overrides[p] ?? {}) });
  const ledgerOf = (...e) => readLedger(JSON.stringify({ version: 1, transitions: e }));

  it("is inert: no ledger and an empty ledger judge every existing case identically", () => {
    const cases = [
      PATHS,
      ["packages/kaal-core/src/cli.ts", "package-lock.json"],
      [".github/workflows/x.yml", "README.md"],
      ["README.md"],
    ];
    for (const paths of cases) {
      assert.deepEqual(check(paths, { ledger: readLedger('{"version":1,"transitions":[]}') }), check(paths));
    }
  });

  it("refuses the multi-owner change without a matching entry", () => {
    assert.ok(check(PATHS).some((v) => v.startsWith("core travels alone: packages/kaal-foundation/package.json")));
  });

  it("admits exactly the committed change: path set, pre and post blobs all equal", () => {
    assert.deepEqual(check(PATHS, { ledger: ledgerOf(entry()), facts: facts() }), []);
  });

  it("refuses a path the ledger does not name, and a missing path", () => {
    const extra = check([...PATHS, "README.md"], { ledger: ledgerOf(entry()), facts: facts() });
    assert.ok(extra.some((v) => v.startsWith("core travels alone: README.md")));
    const missing = check(PATHS.slice(1), { ledger: ledgerOf(entry()), facts: facts() });
    assert.ok(missing.some((v) => v.startsWith("core travels alone: ")));
  });

  it("refuses a changed byte in any path (forged lock, altered pin, changed Core)", () => {
    for (const p of PATHS) {
      const v = check(PATHS, { ledger: ledgerOf(entry()), facts: facts(blob(1), blob(2), { [p]: { head: blob(3) } }) });
      assert.ok(v.some((x) => x.includes(`${p} in the change is ${blob(3)}`)), p);
    }
  });

  it("refuses a stale or already adopted target and replay", () => {
    const stale = check(PATHS, { ledger: ledgerOf(entry()), facts: facts(blob(4), blob(2)) });
    assert.ok(stale.some((v) => v.includes("stale or already adopted")));
    const adopted = check(PATHS, { ledger: ledgerOf(entry()), facts: facts(blob(2), blob(2)) });
    assert.ok(adopted.some((v) => v.includes("stale or already adopted")));
  });

  it("does not let an entry lift the .github rule", () => {
    const withGithub = check([...PATHS, ".github/workflows/x.yml"], { ledger: ledgerOf(entry()), facts: facts() });
    assert.ok(withGithub.some((v) => v.startsWith(".github travels alone")));
  });

  it("cannot judge a matching change when no Git facts are supplied", () => {
    assert.throws(() => check(PATHS, { ledger: ledgerOf(entry()) }), CannotJudge);
  });

  it("cannot judge a malformed ledger", () => {
    const bad = (e) => assert.throws(() => ledgerOf(e), CannotJudge);
    assert.throws(() => readLedger("{"), CannotJudge);
    assert.throws(() => readLedger('{"version":2,"transitions":[]}'), CannotJudge);
    bad(entry({ id: "" }));
    bad(entry({ paths: [] }));
    bad(entry({ paths: [...PATHS, PATHS[0]] }));
    bad(entry({ paths: [...PATHS, "a/../b"] }));
    bad(entry({ pre: { ...entry().pre, "package-lock.json": "xyz" } }));
    bad(entry({ post: Object.fromEntries(PATHS.slice(1).map((p) => [p, blob(2)])) }));
    assert.throws(() => readLedger(JSON.stringify({ version: 1, transitions: [entry(), entry()] })), CannotJudge);
  });

  it("never admits .github, the ledger or the checker through an entry", () => {
    for (const forbidden of [".github/workflows/ci.yml", LEDGER, "engineering/change-isolation/check.mjs"]) {
      const paths = [...PATHS, forbidden];
      assert.throws(() => ledgerOf(entry({ paths,
        pre: Object.fromEntries(paths.map((p) => [p, blob(1)])), post: Object.fromEntries(paths.map((p) => [p, blob(2)])) })), CannotJudge, forbidden);
    }
  });

  describe("the CLI, against a real repository", () => {
    const git = (cwd, ...args) => {
      const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      return r.stdout.trim();
    };
    const setup = (tamper) => {
      const dir = mkdtempSync(join(tmpdir(), "transition-"));
      git(dir, "init", "-q", "-b", "main");
      const write = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); };
      for (const p of PATHS) write(p, "before\n");
      git(dir, "add", "-A"); git(dir, "commit", "-qm", "base");
      const base = git(dir, "rev-parse", "HEAD");
      git(dir, "checkout", "-qb", "candidate");
      for (const p of PATHS) write(p, "after\n");
      if (tamper) write(tamper, "tampered\n");
      git(dir, "add", "-A"); git(dir, "commit", "-qm", "candidate");
      const head = git(dir, "rev-parse", "HEAD");
      const blobAt = (rev, p) => git(dir, "rev-parse", `${rev}:${p}`);
      const ledger = join(dir, "..", `ledger-${Date.now()}-${Math.random()}.json`);
      writeFileSync(ledger, JSON.stringify({ version: 1, transitions: [{ id: "t1", paths: PATHS,
        pre: Object.fromEntries(PATHS.map((p) => [p, blobAt(base, p)])),
        post: Object.fromEntries(PATHS.map((p) => [p, blobAt("candidate~0", p)])) }] }));
      return { dir, base, head, ledger };
    };
    const run = (s, paths) => spawnSync(process.execPath, [CLI, "--ledger", s.ledger, "--git", s.base, s.head],
      { cwd: s.dir, input: paths.join("\n") + "\n", encoding: "utf8" });

    it("admits the exact change, refuses the same paths with one altered byte, and refuses replay", () => {
      const good = setup();
      try {
        const ok = run(good, PATHS);
        assert.equal(ok.status, 0, ok.stderr);
        // Replay: the target already holds the post state.
        const replay = spawnSync(process.execPath, [CLI, "--ledger", good.ledger, "--git", good.head, good.head],
          { cwd: good.dir, input: PATHS.join("\n") + "\n", encoding: "utf8" });
        assert.equal(replay.status, 1);
        assert.match(replay.stderr, /stale or already adopted/);
      } finally { rmSync(good.dir, { recursive: true, force: true }); rmSync(good.ledger, { force: true }); }
      const altered = setup();
      try {
        // The ledger commits to the "after" blobs; the candidate then differs in one path.
        writeFileSync(join(altered.dir, PATHS[3]), "other\n");
        git(altered.dir, "commit", "-qam", "alter");
        const head = git(altered.dir, "rev-parse", "HEAD");
        const r = spawnSync(process.execPath, [CLI, "--ledger", altered.ledger, "--git", altered.base, head],
          { cwd: altered.dir, input: PATHS.join("\n") + "\n", encoding: "utf8" });
        assert.equal(r.status, 1);
        assert.match(r.stderr, /package-lock\.json in the change is/);
      } finally { rmSync(altered.dir, { recursive: true, force: true }); rmSync(altered.ledger, { force: true }); }
    });

    it("exits 2 for a malformed ledger and for partial arguments", () => {
      const s = setup();
      try {
        writeFileSync(s.ledger, "{");
        assert.equal(run(s, PATHS).status, 2);
        assert.equal(spawnSync(process.execPath, [CLI, "--ledger", s.ledger], { input: "", encoding: "utf8" }).status, 2);
        assert.equal(spawnSync(process.execPath, [CLI, "--git", s.base, s.head], { input: "", encoding: "utf8" }).status, 2);
      } finally { rmSync(s.dir, { recursive: true, force: true }); rmSync(s.ledger, { force: true }); }
    });
  });
});

// Git evidence: an absent path is null in the ledger; missing, invalid or unavailable evidence is
// cannot-judge. These run against a real repository, since the difference is Git's own behavior.
describe("transition ledger git evidence", () => {
  const git = (cwd, ...args) => {
    const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd, encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  const repo = () => {
    const dir = mkdtempSync(join(tmpdir(), "gitblob-"));
    git(dir, "init", "-q", "-b", "main");
    const write = (p, text) => { mkdirSync(dirname(join(dir, p)), { recursive: true }); writeFileSync(join(dir, p), text); };
    write("packages/kaal-core/old.txt", "old\n");
    write("packages/kaal-core/keep.txt", "keep\n");
    git(dir, "add", "-A"); git(dir, "commit", "-qm", "base");
    const base = git(dir, "rev-parse", "HEAD");
    git(dir, "checkout", "-qb", "candidate");
    git(dir, "rm", "-q", "packages/kaal-core/old.txt");
    write("packages/kaal-core/new.txt", "new\n");
    git(dir, "add", "-A"); git(dir, "commit", "-qm", "candidate");
    return { dir, base, head: git(dir, "rev-parse", "HEAD") };
  };
  const ledgerFile = (dir, paths, pre, post) => {
    const file = join(dir, "..", `ledger-${Date.now()}-${Math.random()}.json`);
    writeFileSync(file, JSON.stringify({ version: 1, transitions: [{ id: "t", paths, pre, post }] }));
    return file;
  };

  it("returns null for an absent path and a blob id for a present one", () => {
    const r = repo();
    try {
      assert.equal(gitBlob(r.base, "packages/kaal-core/new.txt", { cwd: r.dir }), null);
      assert.equal(gitBlob(r.head, "packages/kaal-core/old.txt", { cwd: r.dir }), null);
      assert.match(gitBlob(r.head, "packages/kaal-core/new.txt", { cwd: r.dir }), /^[0-9a-f]{40,64}$/);
    } finally { rmSync(r.dir, { recursive: true, force: true }); }
  });

  it("cannot judge an unresolvable revision, a non-commit, a directory or a missing repository", () => {
    const r = repo();
    try {
      for (const rev of ["0".repeat(40), "no-such-branch", "HEAD:packages"]) {
        assert.throws(() => gitBlob(rev, "packages/kaal-core/keep.txt", { cwd: r.dir }), CannotJudge, rev);
      }
      assert.throws(() => gitBlob(r.base, "packages/kaal-core", { cwd: r.dir }), CannotJudge);
      // A prefix of a file name is a different, absent path.
      assert.equal(gitBlob(r.base, "packages/kaal-core/kee", { cwd: r.dir }), null);
      assert.throws(() => gitBlob(r.base, "x", { cwd: join(r.dir, "does-not-exist") }), CannotJudge);
    } finally { rmSync(r.dir, { recursive: true, force: true }); }
  });

  it("admits an addition and a deletion in one transition, with null on the absent side", () => {
    const r = repo();
    const paths = ["packages/kaal-core/new.txt", "packages/kaal-core/old.txt"];
    const blob = (rev, p) => gitBlob(rev, p, { cwd: r.dir });
    const file = ledgerFile(r.dir, paths,
      { "packages/kaal-core/new.txt": blob(r.base, paths[0]), "packages/kaal-core/old.txt": blob(r.base, paths[1]) },
      { "packages/kaal-core/new.txt": blob(r.head, paths[0]), "packages/kaal-core/old.txt": blob(r.head, paths[1]) });
    try {
      assert.equal(blob(r.base, paths[0]), null);
      assert.equal(blob(r.head, paths[1]), null);
      const ok = spawnSync(process.execPath, [CLI, "--ledger", file, "--git", r.base, r.head], { cwd: r.dir, input: paths.join("\n") + "\n", encoding: "utf8" });
      assert.equal(ok.status, 0, ok.stderr);
      // Unavailable evidence is not absence: an unresolvable head is exit 2, never a null match.
      const bad = spawnSync(process.execPath, [CLI, "--ledger", file, "--git", r.base, "0".repeat(40)], { cwd: r.dir, input: paths.join("\n") + "\n", encoding: "utf8" });
      assert.equal(bad.status, 2);
      assert.match(bad.stderr, /cannot resolve/);
      // A ledger that wrongly commits a present path as null is refused, not matched.
      const wrong = ledgerFile(r.dir, paths,
        { "packages/kaal-core/new.txt": null, "packages/kaal-core/old.txt": blob(r.base, paths[1]) },
        { "packages/kaal-core/new.txt": null, "packages/kaal-core/old.txt": null });
      const refused = spawnSync(process.execPath, [CLI, "--ledger", wrong, "--git", r.base, r.head], { cwd: r.dir, input: paths.join("\n") + "\n", encoding: "utf8" });
      assert.equal(refused.status, 1);
      assert.match(refused.stderr, /new\.txt in the change is/);
      rmSync(wrong, { force: true });
    } finally { rmSync(r.dir, { recursive: true, force: true }); rmSync(file, { force: true }); }
  });
});
