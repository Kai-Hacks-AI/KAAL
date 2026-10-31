// Acceptance for the Change Isolation checker: path sets in, rule results out.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { MIGRATIONS, check, wellFormed } from "./check.mjs";

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

describe("declared migrations", () => {
  const [c11] = MIGRATIONS;
  const core = ["packages/kaal-core/package.json", "packages/kaal-core/src/hosting.ts", "package.json", "package-lock.json"];
  const only = (m) => (paths) => check(paths, [m]);

  it("pass a change that carries exactly a declared migration's paths with Core", () => {
    assert.equal(c11.change, "hosting/C11");
    assert.match(c11.decision, /Owner.s re-review of hosting\/C11/);
    passes([...core, ...c11.paths]);
    passes([...c11.paths].reverse().concat(core));
  });

  it("do not pass one path more", () => {
    fails([...core, ...c11.paths, "packages/kaal-sealing/src/seal.ts"], ...c11.paths, "packages/kaal-sealing/src/seal.ts");
  });

  it("do not pass one path fewer, or a part, so no later Change can reuse it", () => {
    const part = c11.paths.slice(1);
    fails([...core, ...part], ...part);
    fails([...core, c11.paths[0]], c11.paths[0]);
  });

  it("do not pass one path swapped for another", () => {
    const swapped = [...c11.paths.slice(1), "packages/skills/kaal-graph/README.md"];
    fails([...core, ...swapped], ...swapped);
  });

  it("leave .github travels alone in force", () => {
    assert.ok(check([...core, ...c11.paths, ".github/workflows/x.yml"]).some((v) => v.startsWith(".github travels alone")));
  });

  it("never apply a malformed or duplicated entry", () => {
    const paths = ["engineering/a.mjs", "packages/skills/kaal-graph/package.json"];
    const change = [...core, ...paths];
    assert.deepEqual(only({ change: "x/C1", decision: "#1", paths })(change), [], "the well-formed control passes");
    for (const [why, m] of [
      ["a path listed twice", { change: "x/C1", decision: "#1", paths: [...paths, paths[0]] }],
      ["no change named", { decision: "#1", paths }],
      ["no decision named", { change: "x/C1", paths }],
      ["no paths", { change: "x/C1", decision: "#1", paths: [] }],
      ["paths not a list", { change: "x/C1", decision: "#1", paths: paths.join("\n") }],
      ["a path that is not a string", { change: "x/C1", decision: "#1", paths: [...paths, 7] }],
      ["a path that is not repository-relative", { change: "x/C1", decision: "#1", paths: [...paths, "engineering/../x.mjs"] }],
      ["a Core path", { change: "x/C1", decision: "#1", paths: [...paths, "packages/kaal-core/README.md"] }],
      ["a supporting path", { change: "x/C1", decision: "#1", paths: [...paths, "package.json"] }],
      ["a .github path", { change: "x/C1", decision: "#1", paths: [...paths, ".github/workflows/ci.yml"] }],
    ]) {
      assert.equal(wellFormed(m), false, why);
      assert.notDeepEqual(only(m)([...change, ...(Array.isArray(m.paths) ? m.paths.filter((p) => typeof p === "string") : [])]), [], why);
    }
  });

  it("declare only well-formed entries", () => {
    for (const m of MIGRATIONS) assert.ok(wellFormed(m), m.change);
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
