// core/C32 planned outer tests: Core standalone, Graph optional. Immutable to DO and CHECK;
// core/C33 turns them GREEN. Each title names the contracts it checks (plan/standalone/*.md).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KAAL = resolve(CORE, "..", "..");
const pkg = () => JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const GRAPH = /^(@kaihacksai\/)?kaal-graph$/;
const DEPENDENCIES = ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"];

/** Runs a command, returning its status and output; never throws. */
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

/** The workspace directory of each package by name. */
const workspaces = () => {
  const out = new Map();
  for (const base of ["packages", "packages/skills", "packages/extensions"]) {
    const root = join(KAAL, base);
    if (!existsSync(root)) continue;
    for (const d of readdirSync(root)) {
      const manifest = join(root, d, "package.json");
      if (existsSync(manifest)) out.set(JSON.parse(readFileSync(manifest, "utf8")).name, join(root, d));
    }
  }
  return out;
};

/** kaal-core's runtime dependencies that are workspace packages, transitively. */
const runtime = () => {
  const ws = workspaces();
  const seen = new Map();
  const walk = (name) => {
    for (const dep of Object.keys(JSON.parse(readFileSync(join(ws.get(name), "package.json"), "utf8")).dependencies ?? {}))
      if (ws.has(dep) && !seen.has(dep)) {
        seen.set(dep, ws.get(dep));
        walk(dep);
      }
  };
  walk(pkg().name);
  return seen;
};

/** Every file under a directory. */
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]));

describe("Core standalone, Graph optional (core/C32)", () => {
  it("core/T81 [core/F76]: kaal-core declares no dependency of any kind on Graph's package", () => {
    const m = pkg();
    for (const kind of DEPENDENCIES)
      for (const name of Object.keys(m[kind] ?? {})) assert.doesNotMatch(name, GRAPH, `${kind} names ${name}`);
  });

  it("core/T82 [core/F77, core/A37]: no file in kaal-core's src/ imports Graph's package", () => {
    const importing = files(join(CORE, "src"))
      .filter((f) => /\.(ts|mts|js|mjs)$/.test(f))
      .filter((f) => /\bfrom\s+["'](@kaihacksai\/)?kaal-graph(\/[^"']*)?["']|\bimport\s*\(\s*["'](@kaihacksai\/)?kaal-graph/.test(readFileSync(f, "utf8")))
      .map((f) => f.slice(CORE.length + 1).replaceAll("\\", "/"));
    assert.deepEqual(importing, [], "these files import Graph's package");
  });

  it("core/T83 [core/F78, core/I24]: packed with its runtime dependencies, none of them Graph, and installed into a clean directory with no Graph package, kaal-core imports and admits its own payload", { timeout: 600_000 }, () => {
    const deps = runtime();
    for (const name of deps.keys()) assert.doesNotMatch(name, GRAPH, `kaal-core depends on ${name} at runtime, so it cannot install without Graph`);
    const work = mkdtempSync(join(tmpdir(), "kaal-core-standalone-"));
    try {
      const tarballs = [];
      for (const dir of [CORE, ...deps.values()]) {
        const r = run("npm", ["pack", "--json", "--pack-destination", work], dir);
        assert.equal(r.status, 0, r.out);
        tarballs.push(join(work, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename));
      }
      const app = join(work, "consumer");
      mkdirSync(app);
      writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }));
      const install = run("npm", ["install", ...tarballs], app);
      assert.equal(install.status, 0, install.out);
      for (const graph of [["kaal-graph"], ["@kaihacksai", "kaal-graph"]]) assert.ok(!existsSync(join(app, "node_modules", ...graph)), `the installation holds no ${graph.join("/")}`);
      const use = run(process.execPath, ["--input-type=module", "-e", `import { evaluate, payload } from "${pkg().name}"; const e = evaluate(payload()); console.log(JSON.stringify({ nodes: e.nodes.length, rejected: (e.rejections ?? e.rejected ?? []).length }));`], app);
      assert.equal(use.status, 0, use.out);
      const { nodes, rejected } = JSON.parse(use.stdout.trim().split(/\r?\n/).pop());
      assert.ok(nodes > 0, "Core's payload Nodes are admitted");
      assert.equal(rejected, 0, "no payload Node is rejected");
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });
});
