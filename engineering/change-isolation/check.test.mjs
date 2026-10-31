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
  const c11 = { target: "kaal-hosting", candidate: "@kaihacksai/kaal-hosting" };
  const fault = (paths, f = c11) => check(paths, f).map((v) => v.split(": ")[1]);
  const all = [...core, ...HOSTING_C11];

  it("engineering/T57: hosting/C11's unspent rename with its exact path set and Core passes, in any order", () => {
    assert.equal(HOSTING_C11.length, 45);
    assert.ok(Object.isFrozen(HOSTING_C11));
    assert.deepEqual(check(all, c11), []);
    assert.deepEqual(check([...HOSTING_C11].reverse().concat(core), c11), []);
  });

  it("engineering/T58: a superset fails, naming each extra path and only those", () => {
    const extra = ["packages/kaal-sealing/src/seal.ts", "README.md"];
    assert.deepEqual(fault([...all, ...extra]), extra.map((p) => `${p} is extra to hosting/C11's allowed set`));
  });

  it("engineering/T59: a subset or a swap fails, naming each missing and extra path", () => {
    const missing = [HOSTING_C11[0], HOSTING_C11[44]];
    const part = HOSTING_C11.filter((p) => !missing.includes(p));
    assert.deepEqual(fault([...core, ...part]), missing.map((p) => `${p} is missing from hosting/C11's allowed set`));
    assert.equal(check([...core, HOSTING_C11[3]], c11).length, 44, "a single path of the set does not carry the allowance");
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
    for (const f of [{ target: "kaal-hosting", candidate: "kaal-hosting" }, { target: "kaal-hosting", candidate: "@kaihacksai/kaal-hosting-x" }, { target: "kaal-hosting" }]) {
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
    assert.equal(check(all).length, 45, "check without facts applies rule 1");
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

// engineering/C11 DO (draft): isolation by reverse traceability, on fixture targets until P1–P3 land.
describe("isolation by reverse traceability (engineering/F25–F27, N13–N14)", async () => {
  const { judge } = await import("./traceability.mjs");
  const { readFileSync } = await import("node:fs");

  /** A fixture target: elements with their owner and the elements that trace to them. */
  const target = ({ elements, changes = {}, claims, broken = [], converted = Object.keys(claims) }) => ({
    changes,
    claims,
    converted,
    elements: Object.fromEntries(Object.entries(elements).map(([id, e]) => [id, { owner: e.owner }])),
    traverse(id) {
      if (broken.includes(id)) return null;
      const seen = new Set();
      const queue = [...(elements[id]?.in ?? [])];
      while (queue.length) {
        const n = queue.shift();
        if (seen.has(n)) continue;
        seen.add(n);
        queue.push(...(elements[n]?.in ?? []));
      }
      return [...seen];
    },
  });

  // Hosting's identity; Core realizes against it; Core's Case tests Core. Graph is not reached.
  const base = {
    elements: {
      "hosting/F1": { owner: "Hosting", in: ["core/A1"] },
      "core/A1": { owner: "Core", in: ["core/T1"] },
      "core/T1": { owner: "Core" },
      "graph/F1": { owner: "Graph" },
    },
    claims: { Hosting: ["packages/extensions/kaal-hosting/"], Core: ["packages/kaal-core/"], Graph: ["packages/skills/kaal-graph/"] },
  };
  const paths = ["packages/extensions/kaal-hosting/src/a.ts", "packages/kaal-core/src/b.ts"];
  const run = (t, p = paths, change = "hosting/C1") => judge({ target: t, change, paths: p });
  const scoped = (scope, extra = {}) => target({ ...base, ...extra, changes: { "hosting/C1": { alters: ["hosting/F1"], scope } } });

  it("engineering/T47: paths all in selected, impacted capabilities pass, whatever their names or count", () => {
    assert.deepEqual(run(scoped(["Hosting", "Core"])), { verdict: "pass", findings: [] });
    const many = Array.from({ length: 40 }, (_, i) => `packages/kaal-core/src/renamed-${i}.ts`);
    assert.equal(run(scoped(["Hosting", "Core"]), [...paths, ...many]).verdict, "pass");
  });

  it("engineering/T48: a new dependent capability joins the impact, and selecting it passes with no edit to Engineering", () => {
    const t = scoped(["Hosting", "Core", "Graph"], {
      elements: { ...base.elements, "hosting/F1": { owner: "Hosting", in: ["core/A1", "graph/A1"] }, "graph/A1": { owner: "Graph" } },
    });
    assert.equal(run(t, [...paths, "packages/skills/kaal-graph/x.mjs"]).verdict, "pass");
  });

  it("engineering/T49: a path outside every selected location fails, named", () => {
    const r = run(scoped(["Hosting"]), ["packages/extensions/kaal-hosting/a.ts", "packages/skills/kaal-graph/x.mjs"]);
    assert.equal(r.verdict, "fail");
    assert.deepEqual(r.findings, ["outside the selected scope: packages/skills/kaal-graph/x.mjs belongs to Graph"]);
  });

  it("engineering/T50: a selected capability no trace reaches fails, named", () => {
    const r = run(scoped(["Hosting", "Core", "Graph"]));
    assert.equal(r.verdict, "fail");
    assert.deepEqual(r.findings, ["selected without a trace: Graph is not in the computed impact"]);
  });

  it("engineering/T51: a reachable but unselected capability's path fails", () => {
    const r = run(scoped(["Hosting"]));
    assert.equal(r.verdict, "fail");
    assert.deepEqual(r.findings, ["outside the selected scope: packages/kaal-core/src/b.ts belongs to Core"]);
  });

  it("engineering/T52: an unattributed path, an unknown element and an unresolved trace are each unresolved, named, never GREEN", () => {
    let r = run(scoped(["Hosting", "Core"]), [...paths, "docs/x.md"]);
    assert.deepEqual(r, { verdict: "unresolved", findings: ["unattributed path: docs/x.md lies in no ownership claim"] });
    r = run(target({ ...base, changes: { "hosting/C1": { alters: ["hosting/F1", "hosting/F9"], scope: ["Hosting", "Core"] } } }));
    assert.deepEqual(r, { verdict: "unresolved", findings: ["unknown changed element: hosting/F9"] });
    r = run(target({ ...base, broken: ["hosting/F1"], changes: { "hosting/C1": { alters: ["hosting/F1"], scope: ["Hosting"] } } }), [paths[0]]);
    assert.deepEqual(r, { verdict: "unresolved", findings: ["unresolved trace: from hosting/F1"] });
  });

  it("engineering/T74: a capability whose traces are not converted is an impact-assessment gap, named, never GREEN, even when nothing traced reaches it", () => {
    // Graph's traces are not Edges yet: traverse finds nothing in Graph, which must not read as "no impact" (#740).
    let r = run(scoped(["Hosting", "Core"], { converted: ["Hosting", "Core"] }));
    assert.deepEqual(r, { verdict: "unresolved", findings: ["impact-assessment gap: Graph's traces are not converted, so impact through them is unknown"] });
    // No conversion state on the target at all: every claimed capability is a gap.
    r = run(scoped(["Hosting", "Core"], { converted: null }));
    assert.equal(r.verdict, "unresolved");
    assert.equal(r.findings.length, 3);
    // A failure still outranks the gap, and the gap is still named.
    r = run(scoped(["Hosting"], { converted: ["Hosting", "Core"] }));
    assert.equal(r.verdict, "fail");
    assert.ok(r.findings.includes("impact-assessment gap: Graph's traces are not converted, so impact through them is unknown"), r.findings.join("\n"));
  });

  it("engineering/T53: a scope stated only in the candidate's Change Node authorizes nothing", () => {
    const candidate = { changes: { "hosting/C1": { alters: ["hosting/F1"], scope: ["Hosting", "Core"] } } };
    const r = judge({ target: target(base), candidate, change: "hosting/C1", paths });
    assert.equal(r.verdict, "fail");
    assert.deepEqual(r.findings, ["core travels alone: packages/extensions/kaal-hosting/src/a.ts is not Core or its supporting files"]);
  });

  it("engineering/T54: with no Change Node on the target, Core beside another capability fails Core travels alone; Core alone passes", () => {
    assert.equal(run(target(base)).verdict, "fail");
    assert.equal(run(target(base), ["packages/kaal-core/src/b.ts", "package-lock.json"]).verdict, "pass");
    assert.equal(run(target(base), paths, undefined).verdict, "fail");
  });

  it("engineering/T75: a Change Node whose alters or scope is absent, withheld, malformed or establishes no impact fails closed, even for Core alone", () => {
    const core = ["packages/kaal-core/src/b.ts"];
    const node = (n) => target({ ...base, changes: { "hosting/C1": n } });
    for (const [n, finding] of [
      [{ alters: ["hosting/F1"] }, "fails closed: hosting/C1 states no `scope` on the target"],
      [{ scope: ["Core"] }, "fails closed: hosting/C1 states no `alters` on the target"],
      [{}, "fails closed: hosting/C1 states no `alters` on the target"],
      [{ alters: "hosting/F1", scope: ["Core"] }, "fails closed: hosting/C1's `alters` is malformed or empty, so impact cannot be established"],
      [{ alters: [], scope: ["Core"] }, "fails closed: hosting/C1's `alters` is malformed or empty, so impact cannot be established"],
      [{ alters: ["hosting/F1"], scope: [""] }, "fails closed: hosting/C1's `scope` is malformed or empty, so impact cannot be established"],
      [{ alters: ["hosting/F9"], scope: ["Core"] }, "fails closed: none of hosting/C1's altered elements is on the target, so impact cannot be established"],
    ]) {
      const r = run(node(n), core);
      assert.equal(r.verdict, "fail", JSON.stringify(n));
      assert.ok(r.findings.includes(finding), `${JSON.stringify(n)}: ${r.findings.join("; ")}`);
    }
  });

  it("engineering/T76: a Change's delivery never stands in for its statements: a delivered Change Node without scope still fails closed", () => {
    const delivered = { alters: ["hosting/F1"], status: "delivered", delivered: true, merged: "abc1234" };
    const r = run(target({ ...base, changes: { "hosting/C1": delivered } }), ["packages/kaal-core/src/b.ts"]);
    assert.deepEqual(r, { verdict: "fail", findings: ["fails closed: hosting/C1 states no `scope` on the target"] });
  });

  it("engineering/T55: a .github path beside a selected scope fails", () => {
    const r = run(scoped(["Hosting", "Core"], { claims: { ...base.claims, Hosting: [...base.claims.Hosting, ".github/"] } }), [...paths, ".github/workflows/ci.yml"]);
    assert.equal(r.verdict, "fail");
    assert.ok(r.findings.every((f) => f.startsWith(".github travels alone: ")), r.findings.join("\n"));
  });

  it("engineering/T56: hosting/C11 replay: six-capability impact, #657 passes; a Foundation path fails; dropping Graph fails", () => {
    const { paths: c11 } = JSON.parse(readFileSync(new URL("./fixtures/hosting-c11.json", import.meta.url), "utf8"));
    const six = ["Hosting", "Core", "Engineer Skill", "Graph", "Testing", "Engineering"];
    const dependents = { Core: "core", "Engineer Skill": "engineer-skill", Graph: "graph", Testing: "testing", Engineering: "engineering" };
    const elements = { "hosting/F31": { owner: "Hosting", in: Object.values(dependents).map((d) => `${d}/realization`) }, "foundation/F1": { owner: "Foundation" } };
    for (const [owner, d] of Object.entries(dependents)) {
      elements[`${d}/realization`] = { owner, in: [`${d}/T1`] };
      elements[`${d}/T1`] = { owner };
    }
    const claims = {
      Hosting: ["packages/extensions/kaal-hosting/"],
      Core: ["packages/kaal-core/", ".kaal/AGENTS.md", ".kaal/KAAL-KERNEL.md", ".kaal/core/"],
      "Engineer Skill": ["packages/skills/kaal-engineer-skill/"],
      Graph: ["packages/skills/kaal-graph/"],
      Testing: ["packages/skills/kaal-testing/"],
      // Who owns the shared root files is P3's to settle; this fixture gives them to Engineering.
      Engineering: ["engineering/", "package.json", "package-lock.json"],
      Foundation: ["packages/kaal-foundation/"],
    };
    const t = (scope) => target({ elements, claims, changes: { "hosting/C11": { alters: ["hosting/F31"], scope } } });
    assert.equal(c11.length, 62);
    assert.deepEqual(judge({ target: t(six), change: "hosting/C11", paths: c11 }), { verdict: "pass", findings: [] });
    const withFoundation = judge({ target: t(six), change: "hosting/C11", paths: [...c11, "packages/kaal-foundation/src/a.ts"] });
    assert.deepEqual(withFoundation, { verdict: "fail", findings: ["outside the selected scope: packages/kaal-foundation/src/a.ts belongs to Foundation"] });
    assert.deepEqual(judge({ target: t([...six, "Foundation"]), change: "hosting/C11", paths: c11 }).findings, ["selected without a trace: Foundation is not in the computed impact"]);
    const noGraph = judge({ target: t(six.filter((c) => c !== "Graph")), change: "hosting/C11", paths: c11 });
    assert.equal(noGraph.verdict, "fail");
    assert.ok(noGraph.findings.length > 0 && noGraph.findings.every((f) => / belongs to Graph$/.test(f)), noGraph.findings.join("\n"));
  });
});
