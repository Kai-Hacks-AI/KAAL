// core/C32 planned outer tests: Core standalone, with Graph's Node support delivered inside it. Immutable to DO and CHECK;
// core/C33 turns them GREEN. Each title names the contracts it checks (plan/standalone/*.md).
// Revised by core/C37: commands run through kaal-hosting, KAAL's only OS boundary (core/F88).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "@kaihacksai/kaal-hosting";
import ts from "typescript";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KAAL = resolve(CORE, "..", "..");
const pkg = () => JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const GRAPH = /^(@kaihacksai\/)?kaal-graph$/;
const RUNTIME = ["dependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"];
const DELIVERED = ["form.d.ts", "form.mjs", "node.d.ts", "node.mjs"];
const SPECIFIER = /\b(from|import)\s*["'](@kaihacksai\/)?kaal-graph(\/[^"']*)?["']|\b(import|require)\s*\(\s*["'](@kaihacksai\/)?kaal-graph/;
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Runs a command through Hosting, returning its status and output; never throws. A command that cannot start has no status. */
const run = async (cmd, args, cwd) => {
  try {
    const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
    return { status: r.status, stdout: r.stdout, out: `${r.stdout}${r.stderr}` };
  } catch (e) {
    return { status: null, stdout: "", out: String(e?.message ?? e) };
  }
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

/**
 * Packs kaal-core and its runtime workspace dependencies, none of them Graph, installs them into
 * a clean directory that holds no Graph package, and runs check in it.
 */
const withoutGraph = async (check) => {
  const deps = runtime();
  for (const name of deps.keys()) assert.doesNotMatch(name, GRAPH, `kaal-core depends on ${name} at runtime, so it cannot install without Graph`);
  const work = mkdtempSync(join(tmpdir(), "kaal-core-standalone-"));
  try {
    const tarballs = [];
    for (const dir of [CORE, ...deps.values()]) {
      const r = await run("npm", ["pack", "--json", "--pack-destination", work], dir);
      assert.equal(r.status, 0, r.out);
      tarballs.push(join(work, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename));
    }
    const app = join(work, "consumer");
    mkdirSync(app);
    writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }));
    const install = await run("npm", ["install", ...tarballs], app);
    assert.equal(install.status, 0, install.out);
    for (const graph of [["kaal-graph"], ["@kaihacksai", "kaal-graph"]]) assert.ok(!existsSync(join(app, "node_modules", ...graph)), `the installation holds no ${graph.join("/")}`);
    await check(app);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
};

describe("Core standalone, with Graph's Node support delivered inside it (core/C32)", () => {
  it("core/T81 [core/F76]: kaal-core declares no runtime dependency on Graph's package; a peer only when optional, a devDependency only for the build", () => {
    const m = pkg();
    for (const kind of RUNTIME)
      for (const name of Object.keys(m[kind] ?? {})) assert.doesNotMatch(name, GRAPH, `${kind} names ${name}`);
    for (const name of Object.keys(m.peerDependencies ?? {}))
      if (GRAPH.test(name)) assert.equal(m.peerDependenciesMeta?.[name]?.optional, true, `peerDependencies names ${name} without marking it optional`);
  });

  it("core/T82 [core/F77, core/A37]: no file in kaal-core's src/ imports Graph's package", () => {
    const importing = files(join(CORE, "src"))
      .filter((f) => /\.(ts|mts|js|mjs)$/.test(f))
      .filter((f) => SPECIFIER.test(readFileSync(f, "utf8")))
      .map((f) => f.slice(CORE.length + 1).replaceAll("\\", "/"));
    assert.deepEqual(importing, [], "these files import Graph's package");
  });

  it("core/T83 [core/F78, core/I24]: packed with its runtime dependencies, none of them Graph, and installed into a clean directory with no Graph package, kaal-core imports and admits its own payload", { timeout: 600_000 }, async () => {
    await withoutGraph(async (app) => {
      const use = await run(process.execPath, ["--input-type=module", "-e", `import { evaluate, payload } from "${pkg().name}"; const e = evaluate(payload()); console.log(JSON.stringify({ nodes: e.nodes.length, rejected: (e.rejections ?? e.rejected ?? []).length }));`], app);
      assert.equal(use.status, 0, use.out);
      const { nodes, rejected } = JSON.parse(use.stdout.trim().split(/\r?\n/).pop());
      assert.ok(nodes > 0, "Core's payload Nodes are admitted");
      assert.equal(rejected, 0, "no payload Node is rejected");
    });
  });

  it("core/T86 [core/F80, core/A39, core/N20]: installed with no Graph, registration admits traces that form a cycle with no finding for it, and reports cycles, reach and incoming as unavailable, not empty", { timeout: 600_000 }, async () => {
    await withoutGraph(async (app) => {
      const script = `
        import { assemble } from "${pkg().name}/registration";
        const r = assemble([
          { holder: "kaal-x", scope: "x", kinds: { X: { traces: ["X"] } }, instances: [] },
          { holder: "acme-product", scope: "acme", kinds: {}, instances: [
            { id: "a", kind: { scope: "x", kind: "X" }, traces: ["b"] },
            { id: "b", kind: { scope: "x", kind: "X" }, traces: ["a"] },
          ] },
        ]);
        console.log(JSON.stringify({ instances: r.instances.length, findings: r.findings, cycles: r.cycles, reach: r.reach("acme", "a"), incoming: r.incoming("acme", "a") }));`;
      const use = await run(process.execPath, ["--input-type=module", "-e", script], app);
      assert.equal(use.status, 0, use.out);
      const r = JSON.parse(use.stdout.trim().split(/\r?\n/).pop());
      assert.equal(r.instances, 2, "both instances are admitted");
      assert.deepEqual(r.findings, [], "a cycle is no finding, and Graph's absence is no reason to refuse");
      assert.equal(r.cycles, null, "without Graph, cycles are unavailable, not an empty list");
      assert.equal(r.reach, null, "without Graph, reach is unavailable");
      assert.equal(r.incoming, null, "without Graph, incoming views are unavailable");
    });
  });

  it("core/T84 [core/F79, core/A38]: no shipped file of kaal-core names Graph's package as a module, and the provenance manifest lists exactly the delivered Node support, each copy matching its SHA-256", { timeout: 600_000 }, async () => {
    const work = mkdtempSync(join(tmpdir(), "kaal-core-delivered-"));
    try {
      const r = await run("npm", ["pack", "--json", "--pack-destination", work], CORE);
      assert.equal(r.status, 0, r.out);
      const tarball = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename;
      const x = await run("tar", ["-xzf", tarball], work);
      assert.equal(x.status, 0, x.out);
      const shipped = join(work, "package");
      const naming = files(shipped)
        .filter((f) => /\.(js|mjs|cjs|ts|mts|cts)$/.test(f))
        .filter((f) => SPECIFIER.test(readFileSync(f, "utf8")))
        .map((f) => f.slice(shipped.length + 1).replaceAll("\\", "/"));
      assert.deepEqual(naming, [], "these shipped files name Graph's package as a module");
      const manifest = join(shipped, "dist", "node", "provenance.json");
      assert.ok(existsSync(manifest), "kaal-core ships dist/node/provenance.json");
      assert.deepEqual(readdirSync(join(shipped, "dist", "node")).sort(), [...DELIVERED, "provenance.json"].sort(), "dist/node/ ships exactly the delivered Node support and its manifest");
      const { files: listed } = JSON.parse(readFileSync(manifest, "utf8"));
      assert.deepEqual(Object.keys(listed ?? {}).sort(), DELIVERED, "the manifest lists exactly the delivered Node support");
      for (const [file, { sha256 }] of Object.entries(listed)) assert.equal(digest(readFileSync(join(shipped, "dist", "node", file))), sha256, `${file} matches its manifest digest`);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it("core/T85 [core/F79, core/A38]: after the build, each delivered copy is byte-identical to the Graph source its manifest names, at the Graph version kaal-core pins", { timeout: 600_000 }, async () => {
    const b = await run("npm", ["run", "build"], CORE);
    assert.equal(b.status, 0, b.out);
    const manifest = join(CORE, "dist", "node", "provenance.json");
    assert.ok(existsSync(manifest), "the build writes dist/node/provenance.json");
    assert.deepEqual(readdirSync(join(CORE, "dist", "node")).sort(), [...DELIVERED, "provenance.json"].sort(), "dist/node/ holds exactly the delivered Node support and its manifest");
    const m = JSON.parse(readFileSync(manifest, "utf8"));
    const graph = [...workspaces()].find(([name]) => GRAPH.test(name));
    assert.ok(graph, "Graph's package is a workspace");
    const [name, dir] = graph;
    assert.equal(m.name, name, "the manifest names Graph's package");
    const version = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version;
    assert.equal(m.version, version, "the manifest's Graph version is the workspace's");
    assert.equal(pkg().devDependencies?.[name], version, "kaal-core's devDependencies pins that Graph version");
    assert.deepEqual(Object.keys(m.files ?? {}).sort(), DELIVERED, "the manifest lists exactly the delivered Node support");
    // Revised by core/C38: while Graph's source holds no node.d.ts, node.mjs's declarations are selected from Graph's edges.d.ts.
    const split = existsSync(join(dir, "skills", "kaal-graph", "scripts", "node.d.ts"));
    for (const [file, { from, selected, sha256 }] of Object.entries(m.files)) {
      const select = file === "node.d.ts" && !split;
      const source = select ? "edges.d.ts" : file;
      assert.equal(from, `skills/kaal-graph/scripts/${source}`, `${file} comes from Graph's ${source}`);
      const copy = readFileSync(join(CORE, "dist", "node", file));
      assert.equal(digest(copy), sha256, `${file} matches its manifest digest`);
      if (!select) {
        assert.equal(selected, undefined, `${file} is a copy, not a selection`);
        assert.deepEqual(copy, readFileSync(join(dir, from)), `${file} is byte-identical to ${name}/${from}`);
        continue;
      }
      assert.equal(selected, true, "the manifest says node.d.ts is a selection");
      // Every statement is Graph's own, or one of Graph's import or re-export statements keeping fewer of its names.
      const graphFile = ts.createSourceFile("edges.d.ts", readFileSync(join(dir, from), "utf8"), ts.ScriptTarget.Latest, true);
      const own = new Set(graphFile.statements.map((st) => st.getText(graphFile)));
      const names = (st) => {
        const clause = ts.isExportDeclaration(st) ? st.exportClause : ts.isImportDeclaration(st) ? st.importClause?.namedBindings : undefined;
        return clause && (ts.isNamedExports(clause) || ts.isNamedImports(clause)) ? clause.elements.map((e) => e.getText()) : undefined;
      };
      const sliced = ts.createSourceFile("node.d.ts", copy.toString("utf8"), ts.ScriptTarget.Latest, true);
      for (const st of sliced.statements) {
        if (own.has(st.getText(sliced))) continue;
        const kept = names(st);
        assert.ok(kept, `node.d.ts holds a statement that is not Graph's: ${st.getText(sliced)}`);
        const spec = st.moduleSpecifier?.getText(sliced);
        assert.ok(
          graphFile.statements.some((g) => g.kind === st.kind && g.moduleSpecifier?.getText(graphFile) === spec && kept.every((k) => names(g)?.includes(k))),
          `node.d.ts narrows no statement of Graph's: ${st.getText(sliced)}`,
        );
      }
    }
  });

  // Added by core/C38 on the Owner's review of #689: the shipped declarations, checked by the TypeScript compiler (core/F79, core/A38).
  it("core/T95 [core/F79, core/A38, core/I24]: packed and installed with no Graph, the shipped declarations of the delivered Node support declare no value the delivered modules lack when they run, node.d.ts declares exactly node.mjs's, a strict TypeScript consumer type-checks Core's Node use without reaching any Graph module, and neither Graph's API nor the delivered files can be imported", { timeout: 600_000 }, async () => {
    await withoutGraph(async (app) => {
      const core = join(app, "node_modules", ...pkg().name.split("/"));
      const options = { strict: true, noEmit: true, skipLibCheck: false, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, types: ["node"], typeRoots: [join(KAAL, "node_modules", "@types")] };
      for (const mod of ["form", "node"]) {
        const dts = join(core, "dist", "node", `${mod}.d.ts`);
        assert.ok(existsSync(dts), `kaal-core ships dist/node/${mod}.d.ts`);
        const program = ts.createProgram([dts], options);
        const checker = program.getTypeChecker();
        const values = checker
          .getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(dts)))
          .filter((s) => ((s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s).flags & ts.SymbolFlags.Value) !== 0)
          .map((s) => s.name)
          .sort();
        const runtime = Object.keys(await import(pathToFileURL(join(core, "dist", "node", `${mod}.mjs`)).href)).sort();
        for (const v of values) assert.ok(runtime.includes(v), `${mod}.d.ts declares ${v}, which ${mod}.mjs does not export when it runs`);
        if (mod === "node") assert.deepEqual(values, runtime, "node.d.ts declares exactly what node.mjs exports when it runs");
      }
      const check = (name, source) => {
        const file = join(app, name);
        writeFileSync(file, source);
        const program = ts.createProgram([file], options);
        return { program, errors: ts.getPreEmitDiagnostics(program).map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`) };
      };
      const name = pkg().name;
      const use = check("use.ts", `import { evaluate, payload, foundation, type Engine, type EngineNode, type Identity } from "${name}";
const engine: Engine = evaluate(payload());
const node: EngineNode | undefined = engine.nodes.find((n) => n.id === foundation().skill.id);
const identity: Identity | undefined = node;
const type: string | undefined = identity?.type?.name;
export const used: [string | undefined, readonly string[] | undefined] = [type, node?.paths];
`);
      assert.deepEqual(use.errors, [], "a strict consumer type-checks Core's Node use with the shipped declarations");
      const reached = use.program.getSourceFiles().map((f) => f.fileName).filter((f) => /kaal-graph/.test(f));
      assert.deepEqual(reached, [], "the declarations reach no Graph module");
      for (const [label, source, code] of [
        ["Graph's class", `import { Graph } from "${name}";
export const g = Graph;
`, "TS2305"],
        ["the delivered declarations by path", `import { identify } from "${name}/dist/node/node.js";
export const i = identify;
`, "TS2307"],
        ["the delivered support by subpath import", `import { identify } from "#node/node";
export const i = identify;
`, "TS2307"],
      ]) {
        const bad = check("bad.ts", source);
        assert.ok(bad.errors.some((e) => e.startsWith(`${code}:`)), `a consumer cannot import ${label}: ${bad.errors.join("; ") || "it type-checked"}`);
      }
    });
  });

  // Added by core/C38: only what the delivered modules export at run time reaches Core's code (core/F79, core/A38).
  it("core/T94 [core/F79, core/A38]: every name kaal-core's src/ imports from #node/form or #node/node is exported by the delivered form.mjs or node.mjs when they run, and neither subpath is among the package's exports", async () => {
    const m = pkg();
    const subpaths = { "#node/form": "form.mjs", "#node/node": "node.mjs" };
    for (const subpath of Object.keys(subpaths)) assert.ok(m.imports?.[subpath], `blocked before behavioural assertion: kaal-core declares no ${subpath} import`);
    for (const key of Object.keys(m.exports ?? {})) assert.ok(!key.includes("#node") && !key.startsWith("./node/"), `${key} exposes the delivered Node support to consumers`);
    const used = { "#node/form": new Set(), "#node/node": new Set() };
    for (const f of files(join(CORE, "src")).filter((f) => /\.(ts|mts)$/.test(f))) {
      for (const [, only, clause, subpath] of readFileSync(f, "utf8").matchAll(/(?:import|export)\s*(type\s*)?\{([^}]*)\}\s*from\s*["'](#node\/(?:form|node))["']/g)) {
        if (only) continue;
        for (const part of clause.split(",").map((p) => p.trim()).filter(Boolean)) {
          if (part.startsWith("type ")) continue;
          used[subpath].add(part.split(/\s+as\s+/)[0].trim());
        }
      }
    }
    for (const [subpath, file] of Object.entries(subpaths)) {
      const path = join(CORE, "dist", "node", file);
      assert.ok(existsSync(path), `the build delivers dist/node/${file}`);
      const delivered = await import(pathToFileURL(path).href);
      for (const name of used[subpath]) assert.ok(name in delivered, `kaal-core imports ${name} from ${subpath}, which the delivered ${file} does not export when it runs`);
    }
  });
});
