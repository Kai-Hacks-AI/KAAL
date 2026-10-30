// The planned tests of graph/C4, the Graph 0.0.1 PLAN (plan/release-0.0.1/testing.md).
// DO and CHECK do not change them. A test whose subject does not exist yet fails on its first
// assertion, which says "blocked:", so a blocked RED is never mistaken for a discriminating one.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const REPO = join(PACKAGE, "..", "..", "..");
const HOSTING = join(REPO, "packages", "extensions", "kaal-hosting");
const VERIFY = join(PACKAGE, "test", "verify.mjs");
const DOCS = ["intent", "requirements", "architecture", "operations", "limitations", "testing"];
const WINDOWS = process.platform === "win32";

const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const blocked = (path, what) => assert.ok(existsSync(path), `blocked: ${what} does not exist`);
const tmp = () => realpathSync(mkdtempSync(join(tmpdir(), "kaal-graph-plan-")));
const slash = (p) => p.split(sep).join("/");
const output = (r) => `${r.stdout}${r.stderr}`;
const clean = () => {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
};

function walk(base) {
  const out = [];
  const go = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) go(p);
      else out.push(slash(relative(base, p)));
    }
  };
  go(base);
  return out.sort();
}

describe("Graph 0.0.1 consumer contract", () => {
  it("graph/T8 [graph/F5]: the package carries the six documents, linked from the README; they link only shipped files, name no plan or Engineering path, and define every identifier the delivered cases cite", () => {
    for (const d of DOCS) assert.ok(existsSync(join(PACKAGE, "docs", `${d}.md`)), `docs/${d}.md is missing`);
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    for (const d of DOCS) assert.match(readme, new RegExp(`\\(docs/${d}\\.md\\)`), `README does not link docs/${d}.md`);
    const docs = DOCS.map((d) => readFileSync(join(PACKAGE, "docs", `${d}.md`), "utf8")).join("\n");
    assert.doesNotMatch(docs, /engineering\/|plan\//);
    const shipped = new Set(pkg().files);
    for (const [, link] of docs.matchAll(/\]\((?!https?:|#)([^)#]+)/g)) {
      const target = slash(join("docs", link)).replace(/^docs\/\.\.\//, "");
      assert.ok([...shipped].some((f) => target === f || target.startsWith(`${f}/`)) || target === "README.md", `docs link ${link}, which does not ship`);
    }
    const consumer = join(PACKAGE, "test", "consumer");
    const cases = readdirSync(consumer).filter((f) => f.endsWith(".test.mjs"));
    assert.ok(cases.length > 0, "test/consumer/ has no cases");
    const cited = new Set(cases.flatMap((f) => readFileSync(join(consumer, f), "utf8").match(/graph\/[IFNAT]\d+/g) ?? []));
    for (const id of cited) assert.match(docs, new RegExp(`\\*\\*${id}\\b`), `${id} is not defined in docs/`);
  });

  it("graph/T9 [graph/F6, graph/F7, graph/A5]: npm test is node test/verify.mjs and builds nothing; test:publisher names today's test files", () => {
    const { scripts } = pkg();
    assert.equal(scripts.test, "node test/verify.mjs");
    assert.equal(scripts.pretest, undefined);
    for (const f of ["test/graph.test.mjs", "test/ownership.test.mjs", "test/structure.test.mjs", "test/plan/cycles.test.mjs"]) assert.ok(scripts["test:publisher"]?.includes(f), `test:publisher does not run ${f}`);
  });

  it("graph/T10 [graph/F7, graph/A5]: files ships docs, payload, skills, test/consumer, test/verify.mjs and test/verify.json, and not plan or test/plan", () => {
    assert.deepEqual([...pkg().files].sort(), ["docs", "payload", "skills", "test/consumer", "test/verify.json", "test/verify.mjs"]);
  });

  it("graph/T11 [graph/F8]: the name is @kaihacksai/kaal-graph and every KAAL runtime dependency is @kaihacksai/kaal-*", () => {
    const p = pkg();
    assert.equal(p.name, "@kaihacksai/kaal-graph");
    for (const d of Object.keys(p.dependencies ?? {})) assert.ok(!/^kaal-/.test(d), `runtime dependency ${d} is unscoped`);
    assert.ok(Object.keys(p.dependencies ?? {}).includes("@kaihacksai/kaal-hosting"));
  });

  it("graph/T12 [graph/F6]: in a copy of the package, verify is verified (0); a changed shipped file is failed (1), naming it; an empty case inventory is unknown (2)", () => {
    blocked(VERIFY, "test/verify.mjs");
    const copy = () => {
      const dir = join(tmp(), "package");
      for (const f of [...pkg().files, "package.json", "README.md", "LICENSE"]) cpSync(join(PACKAGE, f), join(dir, f), { recursive: true });
      symlinkSync(join(REPO, "node_modules"), join(dir, "node_modules"), WINDOWS ? "junction" : "dir");
      return dir;
    };
    const verify = (dir) => spawnSync(process.execPath, [join(dir, "test", "verify.mjs")], { cwd: dir, encoding: "utf8", env: clean() });
    const ok = verify(copy());
    assert.equal(ok.status, 0, output(ok));
    const changed = copy();
    appendFileSync(join(changed, "skills", "kaal-graph", "scripts", "structure.mjs"), "\n");
    const c = verify(changed);
    assert.equal(c.status, 1, output(c));
    assert.match(output(c), /skills\/kaal-graph\/scripts\/structure\.mjs/);
    const empty = copy();
    const manifest = JSON.parse(readFileSync(join(empty, "test", "verify.json"), "utf8"));
    writeFileSync(join(empty, "test", "verify.json"), JSON.stringify({ ...manifest, cases: [] }));
    const e = verify(empty);
    assert.equal(e.status, 2, output(e));
  });

  it("graph/T13 [graph/F9, graph/I4]: the packed tarball and its packed runtime dependencies install into a clean directory; there the installed files match docs/operations.md, npm test is verified, and kaal-graph check passes on the shipped payload (publisher)", () => {
    blocked(VERIFY, "test/verify.mjs");
    const npm = (cwd, ...args) => spawnSync("npm", args, { cwd, encoding: "utf8", shell: WINDOWS, env: clean() });
    const out = tmp();
    const tarballs = [HOSTING, PACKAGE].map((dir) => {
      const packed = npm(dir, "pack", "--pack-destination", out, "--json");
      assert.equal(packed.status, 0, output(packed));
      return join(out, JSON.parse(packed.stdout)[0].filename);
    });
    const consumer = tmp();
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true }));
    const installed = npm(consumer, "install", ...tarballs, "--no-audit", "--no-fund");
    assert.equal(installed.status, 0, output(installed));
    const name = pkg().name;
    const root = join(consumer, "node_modules", ...name.split("/"));
    const operations = readFileSync(join(root, "docs", "operations.md"), "utf8");
    const listed = [...operations.matchAll(/^- `([^`]+)`$/gm)].map(([, f]) => f).sort();
    assert.deepEqual(walk(root).filter((f) => !f.startsWith("node_modules/")), listed);
    const tested = npm(consumer, "explore", name, "--", "npm", "test");
    assert.equal(tested.status, 0, output(tested));
    assert.match(tested.stdout, /verified/);
    const bin = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).bin["kaal-graph"];
    const cli = spawnSync(process.execPath, [join(root, bin), "check", join(root, "payload")], { cwd: consumer, encoding: "utf8" });
    assert.equal(cli.status, 0, output(cli));
  });

  it("graph/T14 [graph/N7]: form.mjs, node.mjs and their declarations import only yaml, node: built-ins and each other, so a byte-for-byte copy of the four files works on its own", () => {
    const scripts = join(PACKAGE, "skills", "kaal-graph", "scripts");
    blocked(join(scripts, "node.d.ts"), "scripts/node.d.ts");
    const allowed = { "form.mjs": [], "node.mjs": ["./form.mjs"], "form.d.ts": [], "node.d.ts": ["./form.js"] };
    for (const [file, local] of Object.entries(allowed)) {
      const text = readFileSync(join(scripts, file), "utf8");
      for (const [, spec] of text.matchAll(/(?:^|\n)\s*(?:import|export)\b[^;]*?from\s*["']([^"']+)["']/g)) {
        assert.ok(spec === "yaml" || spec.startsWith("node:") || local.includes(spec), `${file} imports ${spec}`);
      }
    }
  });
});
