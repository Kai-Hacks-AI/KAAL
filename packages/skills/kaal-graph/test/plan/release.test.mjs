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

/** Today's cases that verify shipped behaviour: Embedded Tests, delivered once in test/embedded/ (graph/F7). */
const EMBEDDED = [
  "gives a Node the SHA-256 of its exact bytes as its id, changing with any byte",
  "reads a root, the Node that declares no type, only through identifyRoot",
  "reads the Form strictly",
  "reads reserved fields as written, whatever YAML would type them",
  "returns capability-owned frontmatter uninterpreted, typed by YAML 1.2 and frozen",
  "returns an identity frozen throughout, sequences and type included",
  "reads frontmatter keys in any order and any YAML spelling, while identity stays the exact bytes",
  "says which bytes claim to be a Node, and which names and ids are valid",
  "refuses an Edge reference whose name no Node can have",
  "reads the frontmatter of any file in Form, a Node or not, and never the body",
  "refuses what the Form refuses, with a FormError",
  "is offered alone as kaal-graph/form, which imports no host module",
  "are grouped by type, one Edge per target, sorted",
  "are none without an edges key",
  "are refused, never ignored: ${label}",
  "writes exact canonical bytes that read back as the Node given",
  "gives the same bytes and id whatever order groups, targets and keys are given in",
  "builds Nodes a Graph relates, checks and traverses",
  "takes a body as given, or none",
  "constructs only ordinary Nodes: a Node with no type is refused, never written as a root",
  "refuses what would not be a Node in Form with well-formed Edges",
  "navigates out and in, with no backlink in the target",
  "is the same whatever order Nodes are added in",
  "finds Nodes and Edges by exactly their type, whatever order Nodes are added in",
  "reads a numeric-looking id only when quoted",
  "reports unresolved and misnamed references",
  "looks a Node up by name and by reference, the name checked",
  "answers every query with records the caller cannot use to change the graph",
  "holds only Nodes that cannot change, so its indexes always agree with them",
  "refuses a Node that could still change, adding nothing",
  "answers queries with Edges as declared, which check() verifies",
  "keeps an old Edge on the old meaning when the defining Node is revised",
  "gives a Node a new identity when its Edge changes, and leaves the target unchanged",
  "traverses breadth-first, once per Node, in either direction and by type",
  "builds and traverses a long chain of Edges",
  "delivers KNIFE in Form, typed by a KAAL Definition",
  "checks and navigates Nodes on disk",
  "reverse offers no way to write, and every attempt fails without changing it",
  "reverse reads like a Map: size, get, has, keys, values, entries, forEach and iteration agree",
  "cycles cannot be changed, at either level",
  "graph/T1 [graph/F1, graph/F4]: an acyclic structure has no cycles; a self-edge is a cycle of one",
  "graph/T2 [graph/F1, graph/I1]: A1 → D1 → T2 → A1 is reported sorted; disjoint cycles apart and in order; cycles sharing a member are one component",
  "graph/T3 [graph/F2, graph/F4]: reach yields each identity once, terminates on a cycle, includes start, and reaches a successor that is not a key",
  "graph/T4 [graph/F3, graph/F4]: reverse derives sorted predecessors, including for a successor that is not a key",
  "graph/T5 [graph/N1]: the same structure in any key and successor order gives the same cycles, reach and reverse",
  "graph/T6 [graph/N2, graph/A2]: a 100 000-member chain and ring terminate without recursion exhausting the stack, and the ring is one cycle",
  "graph/T7 [graph/N3, graph/F4]: the input is unchanged, the results are frozen, and a plain object works like a Map",
];

/** Today's cases that verify Graph's repository, release or integration with Core: Engineering-side, never shipped (graph/F7). */
const ENGINEERING = [
  "has an Agent Skill that conforms",
  "names Graph's Skill Node by its kind and exact name and id, and claims Graph's tree",
  "depends at runtime on kaal-hosting and its pinned YAML parser, and not on kaal-core",
  "has a Skill Node, and KNIFE beside it, admitted by Core alone",
  "reads Core's genesis Node, the one Node that declares no type, as a root, and refuses every typed Node as one",
];

/** Every `it` title in the .test.mjs files of a directory under test/, or none when it does not exist. */
const titles = (dir) => {
  const d = join(PACKAGE, "test", dir);
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((f) => f.endsWith(".test.mjs")).flatMap((f) => [...readFileSync(join(d, f), "utf8").matchAll(/^\s*it\(\s*[`"](.+?)[`"],/gm)].map((m) => m[1]));
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
    const embedded = join(PACKAGE, "test", "embedded");
    const cases = readdirSync(embedded).filter((f) => f.endsWith(".test.mjs"));
    assert.ok(cases.length > 0, "test/embedded/ has no cases");
    const cited = new Set(cases.flatMap((f) => readFileSync(join(embedded, f), "utf8").match(/graph\/[IFNAT]\d+/g) ?? []));
    for (const id of cited) assert.match(docs, new RegExp(`\\*\\*${id}\\b`), `${id} is not defined in docs/`);
  });

  it("graph/T9 [graph/F6, graph/F7, graph/A5]: npm test is node test/verify.mjs and builds nothing; test:publisher runs the Engineering-side tests and the same verify, and never runs an embedded case a second time", () => {
    const { scripts } = pkg();
    assert.equal(scripts.test, "node test/verify.mjs");
    assert.equal(scripts.pretest, undefined);
    const publisher = scripts["test:publisher"] ?? "";
    for (const f of ["test/publisher/", "node test/verify.mjs"]) assert.ok(publisher.includes(f), `test:publisher does not run ${f}`);
    assert.doesNotMatch(publisher, /test\/embedded\//, "test:publisher runs an embedded case outside verify");
  });

  it("graph/T10 [graph/F7, graph/A5]: files ships docs, payload, skills, test/embedded, test/verify.mjs and test/verify.json, and not plan, test/plan or test/publisher", () => {
    assert.deepEqual([...pkg().files].sort(), ["docs", "payload", "skills", "test/embedded", "test/verify.json", "test/verify.mjs"]);
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

  it("graph/T15 [graph/F7]: every case today's tests hold is placed exactly once: each one that verifies shipped behaviour is an embedded case, each Engineering-side one stays out of the package, and no test file is left unplaced", () => {
    const embedded = titles("embedded");
    const engineering = [...titles("publisher"), ...titles("acceptance")];
    for (const t of EMBEDDED) {
      assert.equal(embedded.filter((e) => e === t).length, 1, `embedded case missing or duplicated: ${t}`);
      assert.ok(!engineering.includes(t), `embedded case also Engineering-side: ${t}`);
    }
    for (const t of ENGINEERING) {
      assert.equal(engineering.filter((e) => e === t).length, 1, `Engineering-side case missing or duplicated: ${t}`);
      assert.ok(!embedded.includes(t), `Engineering-side case shipped: ${t}`);
    }
    const unplaced = readdirSync(join(PACKAGE, "test")).filter((f) => f.endsWith(".test.mjs"));
    assert.deepEqual(unplaced, [], "test files outside embedded/, publisher/, acceptance/ and plan/");
    assert.ok(!existsSync(join(PACKAGE, "test", "plan", "cycles.test.mjs")), "graph/T1–graph/T7 still run from test/plan/ as well as test/embedded/");
  });
});
