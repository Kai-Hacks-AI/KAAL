// Acceptance: kaal-review, Review -> Package -> Embed. Case review/T292 tests review/F24 and review/G3.
//
// Installs the tarball the Acceptance lane packed for kaal-review, with the Engine a consumer registers its Nodes into (kaal-core and
// kaal-graph) and the permitted shared dependencies (the scoped Foundation and Hosting), into a fresh host outside this repository.
// Nothing else is installed: no kaal-testing and no other capability. From that host it exercises what Review declares: its Skill loads,
// its Nodes register into a fresh Engine and are listed there, and everything the installed product needs at run time resolves from
// the host's own node_modules. The expectations come from the installed product itself, not from constants in this file.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { builtinModules, createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { before, describe, it } from "node:test";
import { execute } from "@kaihacksai/kaal-hosting";
import { install } from "kaal-testing/acceptance";

export const id = "review/T292";
export const tests = ["review/F24", "review/G3"];
export const title = "a fresh host holding only the packed kaal-review, its Engine and its permitted dependencies can load its Skill, register its Nodes and resolve everything it needs, and a missing permitted dependency is detected";

const PERMITTED = ["@kaihacksai/kaal-foundation", "@kaihacksai/kaal-hosting"];
const ENGINE = ["kaal-core", "kaal-graph"];
const KAAL = /^(@kaihacksai\/)?kaal-[a-z][a-z-]*$/;
const SOURCE = /\.(?:[cm]?js|ts)$/;
const work = mkdtempSync(join(tmpdir(), "kaal-review-acceptance-"));

async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const packageName = (s) => (s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0]);
const importsOf = (text) => [...text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)["']([^"']+)["']/g)].map((m) => m[1]);

/**
 * What a product needs at run time: its declared dependencies and the packages its shipped source imports, each resolved from the
 * product's own location, with nothing assumed to be there. A permitted package is not assumed either: it must resolve like any other.
 */
export function closure(productDir) {
  const manifest = JSON.parse(readFileSync(join(productDir, "package.json"), "utf8"));
  const needed = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {}), ...Object.keys(manifest.optionalDependencies ?? {})]);
  for (const file of walk(productDir)) if (SOURCE.test(file)) {
    for (const s of importsOf(readFileSync(file, "utf8"))) if (!s.startsWith(".") && !s.startsWith("/") && !s.startsWith("node:")) needed.add(packageName(s));
  }
  const require = createRequire(join(productDir, "package.json"));
  const external = [...needed].filter((n) => !builtinModules.includes(n));
  const resolves = (n) => {
    try { require.resolve(`${n}/package.json`); return true; } catch { /* not exported or absent */ }
    try { require.resolve(n); return true; } catch { return false; }
  };
  return { unresolved: external.filter((n) => !resolves(n)), notPermitted: external.filter((n) => KAAL.test(n) && !PERMITTED.includes(n)) };
}

function kaalPackagesIn(host) {
  const modules = join(host, "node_modules");
  const names = [];
  for (const e of readdirSync(modules)) {
    if (e.startsWith(".")) continue;
    if (e.startsWith("@")) names.push(...readdirSync(join(modules, e)).map((n) => `${e}/${n}`));
    else names.push(e);
  }
  return names.filter((n) => KAAL.test(n)).sort();
}

let host;
let product;
let kaal;

before(async () => {
  host = await install([...PERMITTED, ...ENGINE, "kaal-review"]);
  product = join(host, "node_modules", "kaal-review");
  kaal = join(host, "node_modules", ".bin", "kaal");
});

describe("the packed kaal-review in a fresh host", () => {
  it("holds no KAAL package beyond the product, its Engine and its permitted dependencies", () => {
    assert.deepEqual(kaalPackagesIn(host).filter((n) => n !== "kaal-review" && !ENGINE.includes(n) && !PERMITTED.includes(n)), []);
  });

  it("loads each Skill its skills/ directory declares as an Agent Skill", () => {
    const dir = join(product, "skills");
    const skills = readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory());
    assert.ok(skills.length > 0, "the installed product declares no Skill");
    for (const name of skills) {
      const head = readFileSync(join(dir, name, "SKILL.md"), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
      assert.ok(head, `${name}: no front matter`);
      const field = (k) => head[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1].trim();
      assert.equal(field("name"), name);
      assert.ok(field("description"), `${name}: no description`);
    }
  });

  it("registers the Nodes its payload declares into a fresh Engine, and the Engine lists exactly them", async () => {
    const engine = join(work, "engine");
    assert.match(await run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    const script = [
      "import { readFileSync, readdirSync } from 'node:fs';",
      "import { join } from 'node:path';",
      "import { verify } from 'kaal-core';",
      "import { identify } from 'kaal-graph';",
      "const [engine, payload] = process.argv.slice(1);",
      "const declared = readdirSync(payload).filter((f) => f.endsWith('.md')).map((f) => identify(readFileSync(join(payload, f))).id).sort();",
      "const v = await verify(engine);",
      "console.log(JSON.stringify({ ok: v.ok, problems: v.problems, declared, ids: v.engine.nodes.map((n) => n.id).sort() }));",
    ].join("\n");
    const state = async () => JSON.parse(await run(process.execPath, ["--input-type=module", "-e", script, engine, join(product, "payload")], host));
    const before = await state();
    assert.ok(before.ok, before.problems.join("\n"));
    assert.ok(before.declared.length > 0, "the installed product declares no Node");
    assert.match(await run(kaal, ["register", "skill", "kaal-review", join(product, "payload"), "--engine", engine], host), /^registered skill kaal-review/);
    const after = await state();
    assert.ok(after.ok, after.problems.join("\n"));
    assert.deepEqual(after.ids.filter((i) => !before.ids.includes(i)), before.declared);
  });

  it("resolves everything it needs at run time from the host, and needs no KAAL package that is not permitted", () => {
    assert.deepEqual(closure(product), { unresolved: [], notPermitted: [] });
  });

  it("navigates a tree of Review items and results from the host, through the permitted Hosting dependency", async () => {
    const tree = join(work, "items");
    mkdirSync(tree, { recursive: true });
    writeFileSync(join(tree, "V1.md"), "---\nid: x/V1\nvalidates: [s]\nagainst: [intrinsic]\n---\n## Question\n\nIs it so?\n\n## Criteria\n\n- it is so\n\n## Expected evidence\n\n- the document\n");
    writeFileSync(join(tree, "RV1.md"), "---\nid: x/RV1\nappraises: x/V1\nrevision: r1\nappraiser: a\nrelation: not-author\nexecution: performed\nconclusion: satisfied\n---\n## Execution\n\nRead it.\n\n## Result\n\nSo.\n");
    const script = "const { navigate } = await import(process.argv[2]); console.log(JSON.stringify(await navigate(process.argv[1], { revision: 'r1' })));";
    const out = JSON.parse(await run(process.execPath, ["--input-type=module", "-e", script, tree, pathToFileURL(join(product, "skills", "kaal-review", "scripts", "navigate.mjs")).href], host));
    assert.deepEqual(out.findings, []);
    assert.deepEqual(out.validatedBy, { s: ["x/V1"] });
    assert.deepEqual(out.current["x/V1"], [{ result: "x/RV1", applicability: "applies" }]);
  });
});

describe("the closure check detects a permitted dependency that is not available", () => {
  // A fixture product that needs the permitted Foundation, placed where the host provides it and where nothing does.
  function fixture(parent) {
    const dir = join(parent, "fixture-needs-foundation");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "fixture-needs-foundation", version: "1.0.0", type: "module", dependencies: { "@kaihacksai/kaal-foundation": "0.0.1" } }));
    writeFileSync(join(dir, "index.mjs"), "import '@kaihacksai/kaal-foundation';\n");
    return dir;
  }

  it("passes where the host provides the permitted dependency", () => {
    assert.deepEqual(closure(fixture(join(host, "node_modules"))).unresolved, []);
  });

  it("fails where the permitted dependency is absent", () => {
    const bare = mkdtempSync(join(tmpdir(), "kaal-review-bare-"));
    assert.deepEqual(closure(fixture(bare)).unresolved, ["@kaihacksai/kaal-foundation"]);
  });
});
