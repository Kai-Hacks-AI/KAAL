// Acceptance for the Change Isolation checker: path sets in, rule results out.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { check, facts, HOSTING_C11 } from "./check.mjs";

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

describe("the interim hosting/C11 allowance (engineering/C11 amendment, Option A)", () => {
  const core = ["packages/kaal-core/package.json", "packages/kaal-core/src/hosting.ts", "package.json", "package-lock.json"];
  // hosting/C11's unspent rename: the target still names Hosting kaal-hosting, the candidate renames it.
  const old = ["kaal", "hosting"].join("-"); // the old, unscoped name, never a quoted reference (hosting/T22)
  const c11 = { target: old, candidate: "@kaihacksai/kaal-hosting" };
  const fault = (paths, f = c11) => check(paths, f).map((v) => v.split(": ")[1]);
  const all = [...core, ...HOSTING_C11];

  it("engineering/T57: hosting/C11's unspent rename with its exact path set and Core passes, in any order", () => {
    assert.equal(HOSTING_C11.length, 44);
    assert.ok(Object.isFrozen(HOSTING_C11));
    assert.deepEqual(check(all, c11), []);
    assert.deepEqual(check([...HOSTING_C11].reverse().concat(core), c11), []);
  });

  it("engineering/T58: a superset fails, naming each extra path and only those", () => {
    const extra = ["packages/kaal-sealing/src/seal.ts", "README.md"];
    assert.deepEqual(fault([...all, ...extra]), extra.map((p) => `${p} is extra to hosting/C11's allowed set`));
    // The path the correction removed is now extra too: the set narrowed, it did not widen.
    const removed = "packages/extensions/kaal-hosting/.gitattributes";
    assert.ok(!HOSTING_C11.includes(removed));
    assert.deepEqual(fault([...all, removed]), [`${removed} is extra to hosting/C11's allowed set`]);
  });

  it("engineering/T59: a subset or a swap fails, naming each missing and extra path", () => {
    const missing = [HOSTING_C11[0], HOSTING_C11[43]];
    const part = HOSTING_C11.filter((p) => !missing.includes(p));
    assert.deepEqual(fault([...core, ...part]), missing.map((p) => `${p} is missing from hosting/C11's allowed set`));
    assert.equal(check([...core, HOSTING_C11[3]], c11).length, 43, "a single path of the set does not carry the allowance");
    const swapped = [...HOSTING_C11.slice(1), "packages/skills/kaal-graph/README.md"];
    assert.deepEqual(fault([...core, ...swapped]), [
      "packages/skills/kaal-graph/README.md is extra to hosting/C11's allowed set",
      `${HOSTING_C11[0]} is missing from hosting/C11's allowed set`,
    ]);
  });

  it("engineering/T60: a .github path beside the exact set fails .github travels alone", () => {
    const v = check([...all, ".github/workflows/ci.yml"], c11);
    assert.ok(v.includes("core travels alone: .github/workflows/ci.yml is extra to hosting/C11's allowed set"), v.join("\n"));
    assert.equal(v.filter((x) => x.startsWith(".github travels alone: ")).length, all.length, v.join("\n"));
  });

  it("engineering/T61: Core beside paths outside the set fails rule 1 as before, whatever the facts", () => {
    for (const f of [c11, {}]) {
      assert.deepEqual(fault([...core, "packages/skills/kaal-graph/README.md", "engineering/lanes/README.md"], f), [
        "packages/skills/kaal-graph/README.md is not Core or its supporting files",
        "engineering/lanes/README.md is not Core or its supporting files",
      ]);
    }
  });

  it("engineering/T71: an unrelated Change carrying hosting/C11's exact paths, without its rename, gets no allowance", () => {
    for (const f of [{ target: old, candidate: old }, { target: old, candidate: "@kaihacksai/kaal-hosting-x" }, { target: old }]) {
      assert.deepEqual(fault(all, f), HOSTING_C11.map((p) => `${p} is not Core or its supporting files`), JSON.stringify(f));
    }
  });

  it("engineering/T72: once hosting/C11 has landed on the target, its exact paths cannot reuse the allowance", () => {
    const spent = { target: "@kaihacksai/kaal-hosting", candidate: "@kaihacksai/kaal-hosting" };
    assert.deepEqual(fault(all, spent), HOSTING_C11.map((p) => `${p} is not Core or its supporting files`));
  });

  it("engineering/T73: without the runner's target and candidate commits, the allowance does not apply", () => {
    assert.deepEqual(facts({}), { target: undefined, candidate: undefined });
    assert.deepEqual(facts({ GUARD_BASE: "HEAD; rm -rf /", GUARD_HEAD: "not-a-commit" }), { target: undefined, candidate: undefined });
    assert.equal(check(all).length, HOSTING_C11.length, "check without facts applies rule 1");
    const cli = spawnSync(process.execPath, [CLI], { input: all.join("\n"), encoding: "utf8", env: { PATH: process.env.PATH } });
    assert.equal(cli.status, 1, cli.stderr);
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
