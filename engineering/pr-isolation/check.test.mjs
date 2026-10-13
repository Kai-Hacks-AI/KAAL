// Acceptance for the PR isolation checker: path sets, the CLI, and complete PR diffs from real git history.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { check } from "./check.mjs";

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
      ["packages/kaal-core/src/cli.ts", ".kaal/skills/kaal-sealing/Sealing.md", "README.md", "AGENTS.md", "engineering/pr-isolation/check.mjs"],
      ".kaal/skills/kaal-sealing/Sealing.md",
      "README.md",
      "AGENTS.md",
      "engineering/pr-isolation/check.mjs",
    );
  });

  it("does not let a look-alike path pass as Core", () => {
    fails(["packages/kaal-core/src/node.ts", "packages/kaal-core-extra/index.ts"], "packages/kaal-core-extra/index.ts");
  });
});

describe(".github travels alone", () => {
  it("passes a .github-only change", () => {
    passes([".github/workflows/pr-isolation.yml"]);
    passes([".github/workflows/a.yml", ".github/CODEOWNERS"]);
  });

  it("fails .github mixed with any outside file", () => {
    fails([".github/workflows/pr-isolation.yml", "README.md"], "README.md");
    fails([".github/workflows/pr-isolation.yml", "engineering/pr-isolation/check.mjs"], "engineering/pr-isolation/check.mjs");
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
    passes([".kaal/skills/kaal-sealing/Sealing.md", "engineering/pr-isolation/check.mjs"]);
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

describe("the genesis bootstrap", () => {
  it("does not conform, so enforcement starts only on targets that already hold these controls", () => {
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

  it("refuses unknown arguments and paths that are not repository-relative", () => {
    assert.equal(run(["--diff", "main"]).status, 2);
    for (const p of ["./packages/kaal-core/x", "/packages/kaal-core/x", "a//b", "a/../packages/kaal-core/x"]) {
      assert.equal(run([], `README.md\n${p}\n`).status, 2, p);
    }
  });
});

describe("the complete PR diff against its target", () => {
  const repo = mkdtempSync(join(tmpdir(), "kaal-pr-isolation-"));
  const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" });
  const write = (path, text = `${path}\n`) => {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), text);
  };
  const commit = (message) => {
    git("add", "-A");
    git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", message);
  };
  const judge = (base, head) => spawnSync(process.execPath, [CLI, "--diff", base, head], { cwd: repo, encoding: "utf8" });

  git("init", "-q", "-b", "target");
  write("README.md");
  write("packages/kaal-core/src/cli.ts");
  write("packages/kaal-sealing/src/seal.ts");
  commit("genesis");

  it("fails a mix spread over commits that each pass alone", () => {
    git("checkout", "-q", "-b", "mixed");
    write("packages/kaal-core/src/cli.ts", "core change\n");
    commit("core only");
    assert.equal(judge("HEAD~1", "HEAD").status, 0);
    write("packages/kaal-sealing/src/seal.ts", "skill change\n");
    commit("skill only");
    assert.equal(judge("HEAD~1", "HEAD").status, 0);
    const whole = judge("target", "mixed");
    assert.equal(whole.status, 1);
    assert.match(whole.stderr, /packages\/kaal-sealing\/src\/seal\.ts/);
  });

  it("judges against the merge base, not changes that landed on the target since", () => {
    git("checkout", "-q", "-b", "core-only", "target");
    write("packages/kaal-core/src/cli.ts", "core only\n");
    commit("core");
    git("checkout", "-q", "target");
    write("README.md", "moved on\n");
    commit("target moves on");
    assert.equal(judge("target", "core-only").status, 0, judge("target", "core-only").stderr);
  });

  it("cannot be passed by refs that git would read as options, and reports git failures as exit 2", () => {
    const opt = judge(`--output=${join(repo, "out")}`, "mixed");
    assert.equal(opt.status, 2, opt.stdout);
    const unknown = judge("target", "no-such-ref");
    assert.equal(unknown.status, 2);
    assert.match(unknown.stderr, /^cannot diff target\.\.\.no-such-ref: /);
  });

  it("sees both sides of a rename out of Core", () => {
    git("checkout", "-q", "-b", "rename", "target");
    mkdirSync(join(repo, "packages/kaal-other/src"), { recursive: true });
    renameSync(join(repo, "packages/kaal-core/src/cli.ts"), join(repo, "packages/kaal-other/src/cli.ts"));
    commit("move");
    const r = judge("target", "rename");
    assert.equal(r.status, 1);
    assert.match(r.stderr, /packages\/kaal-other\/src\/cli\.ts is not Core/);
  });
});
