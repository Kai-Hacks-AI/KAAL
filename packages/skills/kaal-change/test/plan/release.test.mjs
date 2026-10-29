// change/C4 planned outer tests: the kaal-change 0.0.1 release.
// Immutable to DO and CHECK; the DO Changes turn them GREEN. Each title names
// the contracts it checks (plan/release/*.md). They read the package as npm
// would pack it, and exercise the packed artifact in a clean consumer.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const GRAPH = join(PACKAGE, "../kaal-graph");
const HOSTING = join(PACKAGE, "../../extensions/kaal-hosting");
const NAME = "@kaihacksai/kaal-change";
const PEER = "@kaihacksai/kaal-graph";
const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const npm = (args, cwd) => execFileSync("npm", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** The files npm would pack, relative to the package. */
const packed = () => JSON.parse(npm(["pack", "--dry-run", "--json", "--ignore-scripts"], PACKAGE))[0].files.map((f) => f.path).sort();

const SHIPPED = /^(package\.json|README\.md|LICENSE|capability\/.+|lib\/.+|docs\/.+|test\/consumer\/.+|test\/verify\.(mjs|json))$/;

/** The consumer verification the package ships, or the reason the acceptance tests are blocked. */
function verifier() {
  for (const f of ["test/verify.mjs", "test/verify.json"]) {
    assert.ok(existsSync(join(PACKAGE, f)), `blocked before behavioural assertion: the package ships no ${f}`);
  }
}

/** A fresh consumer directory with the given packed artifacts installed, and nothing else. */
function consumer(tarballs) {
  const dir = mkdtempSync(join(tmpdir(), "kaal-change-consumer-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
  if (tarballs.length) npm(["install", "--no-audit", "--no-fund", "--ignore-scripts", ...tarballs], dir);
  return dir;
}

/** Packs a package into `out`, returning the tarball's path. */
const pack = (from, out) => join(out, JSON.parse(npm(["pack", "--json", "--ignore-scripts", "--pack-destination", out], from))[0].filename);

/** Runs the installed package's consumer verification, as the consumer would. */
function verify(dir, ...args) {
  const r = spawnSync("npm", ["test", "--", ...args], { cwd: join(dir, "node_modules", NAME), encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

/** Every file under a directory except node_modules, by path, with its SHA-256. */
function snapshot(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[relative(dir, p)] = createHash("sha256").update(readFileSync(p)).digest("hex");
    }
  };
  walk(dir);
  return out;
}

describe("kaal-change 0.0.1 release (change/C4)", () => {
  it("change/T24 [change/N6, change/F18, change/A11]: the package is @kaihacksai/kaal-change 0.0.1, with no runtime dependency, Graph as an optional peer, and ships exactly its declared files", () => {
    const m = manifest();
    assert.equal(m.name, NAME);
    assert.equal(m.version, "0.0.1");
    assert.equal(m.license, "MIT");
    assert.deepEqual(m.dependencies ?? {}, {}, "no runtime dependency");
    assert.ok(m.peerDependencies?.[PEER], "Graph is a peer");
    assert.equal(m.peerDependenciesMeta?.[PEER]?.optional, true, "and an optional one");
    for (const entry of ["./record", "./lifecycle", "./delivery"]) assert.ok(m.exports?.[entry], `exports ${entry}`);
    const files = packed();
    for (const f of files) assert.match(f, SHIPPED, `${f} is not a shipped file`);
    for (const f of ["docs/intent.md", "test/verify.mjs", "test/verify.json", "lib/delivery.mjs"]) assert.ok(files.includes(f), `${f} is shipped`);
  });

  it("change/T25 [change/I12, change/F20, change/A13]: the shipped docs/ covers intent, requirements, architecture, testing and limitations, defines every identifier a shipped case cites, and cites no plan, record or Change as authority", () => {
    const docs = ["intent", "requirements", "architecture", "testing", "limitations"].map((d) => `docs/${d}.md`);
    for (const d of docs) assert.ok(existsSync(join(PACKAGE, d)), `${d} is shipped`);
    const text = docs.map((d) => readFileSync(join(PACKAGE, d), "utf8")).join("\n");
    for (const forbidden of [/plan\//, /\.kaal\/changes/, /engineering\//, /\b[a-z][a-z0-9-]*\/C[1-9][0-9]*\b/]) {
      assert.doesNotMatch(text, forbidden, `the docs cite ${forbidden} as authority`);
    }
    const cases = JSON.parse(readFileSync(join(PACKAGE, "test/verify.json"), "utf8")).cases;
    const cited = new Set(cases.flatMap((c) => c.match(/\bchange\/[INFAT][0-9]+\b/g) ?? []));
    assert.ok(cited.size > 0, "the shipped cases cite contracts");
    for (const id of cited) assert.match(text, new RegExp(`\\*\\*${id.replace("/", "\\/")}\\b`), `${id} is defined in docs/`);
  });

  it("change/T26 [change/F21]: the README states start, use, verify, register, remove and release notes", () => {
    const headings = readFileSync(join(PACKAGE, "README.md"), "utf8").split("\n").filter((l) => /^#{2,3} /.test(l)).map((l) => l.replace(/^#+ /, ""));
    for (const h of ["Start", "Use", "Verify the installed package", "Register", "Remove", "Release notes"]) {
      assert.ok(headings.some((x) => x.startsWith(h)), `the README has a "${h}" section`);
    }
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.match(readme, new RegExp(`npm install ${NAME.replace("/", "\\/")}`), "Start names the package");
    assert.match(readme, /optional/i, "and says Graph is optional");
  });

  it("change/T27 [change/F22, change/F24, change/N7, change/A14, change/A15]: the manifest declares every consumer case and the hash of every other shipped file, its cases import only public entry points, and no publisher-only test is shipped", () => {
    const files = packed();
    assert.ok(existsSync(join(PACKAGE, "test/verify.json")), "the package ships test/verify.json");
    const m = JSON.parse(readFileSync(join(PACKAGE, "test/verify.json"), "utf8"));
    assert.ok(Array.isArray(m.cases) && m.cases.length > 0, "the manifest declares cases");
    for (const c of m.cases) assert.match(c, /^test\/consumer\/[^>]+\.test\.mjs > /, `${c} is a consumer case`);
    const hashed = Object.keys(m.files ?? {}).sort();
    assert.deepEqual(hashed, files.filter((f) => f !== "test/verify.json"), "every other shipped file is hashed");
    for (const [f, h] of Object.entries(m.files)) assert.equal(h, createHash("sha256").update(readFileSync(join(PACKAGE, f))).digest("hex"), `${f} matches its hash`);
    const consumerTests = files.filter((f) => f.startsWith("test/consumer/") && f.endsWith(".mjs"));
    assert.ok(consumerTests.length > 0);
    for (const f of [...consumerTests, "test/verify.mjs"]) {
      const src = readFileSync(join(PACKAGE, f), "utf8");
      for (const [, from, dynamic] of src.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = from ?? dynamic;
        const ok = spec.startsWith("node:") || spec.startsWith(`${NAME}/`) || (spec.startsWith(".") && !spec.includes("lib/"));
        assert.ok(ok, `${f} imports ${spec}, not a public entry point or a built-in`);
      }
    }
    assert.ok(!files.some((f) => /^test\/(plan|acceptance)\//.test(f) || /^test\/[^/]+\.test\.mjs$/.test(f)), "no publisher-only test is shipped");
    assert.ok(manifest().scripts?.["test:publisher"], "the publisher's tests run as test:publisher");
    assert.equal(manifest().scripts?.test, "node test/verify.mjs", "npm test is the consumer verification");
  });

  it("change/T28 [change/I11, change/I13, change/I14, change/F19, change/F22, change/F23, change/F25]: in a clean consumer, the packed package verifies with Graph; without Graph, delivery cannot assess and the result is unknown, then verified once delivery is excluded; a case that fails is failed", () => {
    verifier();
    const out = mkdtempSync(join(tmpdir(), "kaal-change-pack-"));
    try {
      const change = pack(PACKAGE, out);
      const alone = consumer([change]);
      const unknown = verify(alone);
      assert.equal(unknown.status, 2, `without Graph the result is unknown:\n${unknown.out}`);
      assert.match(unknown.out, new RegExp(PEER.replace("/", "\\/")), "naming the absent optional peer");
      assert.match(unknown.out, /cannot-assess/, "and delivery cannot assess");
      const scoped = verify(alone, "--exclude", "delivery");
      assert.equal(scoped.status, 0, `with delivery excluded, the rest is verified:\n${scoped.out}`);
      assert.match(scoped.out, /exclud\w* delivery/i, "and the exclusion is in the evidence");
      assert.match(scoped.out, new RegExp(`${NAME.replace("/", "\\/")}.*0\\.0\\.1`), "the evidence names the package and its version");
      const withGraph = consumer([change, pack(HOSTING, out), pack(GRAPH, out)]);
      const verified = verify(withGraph);
      assert.equal(verified.status, 0, `with Graph the result is verified:\n${verified.out}`);
      const broken = join(withGraph, "node_modules", NAME, "lib", "record.mjs");
      writeFileSync(broken, "export {};\n");
      const failed = verify(withGraph);
      assert.ok(failed.status === 1 || failed.status === 2, `a broken install is never verified:\n${failed.out}`);
      assert.match(failed.out, /lib\/record\.mjs/, "and names the changed file");
      for (const d of [alone, withGraph]) rmSync(d, { recursive: true, force: true });
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  it("change/T29 [change/I15, change/F26, change/N7]: uninstalling leaves the consumer's Change Records and Change Nodes byte-identical, and verification writes nothing outside its temporary directory", () => {
    verifier();
    const out = mkdtempSync(join(tmpdir(), "kaal-change-pack-"));
    try {
      const dir = consumer([pack(PACKAGE, out)]);
      const record = join(dir, ".kaal/changes/sample/26/10/29/01/README.md");
      mkdirSync(dirname(record), { recursive: true });
      writeFileSync(record, "# sample/C1\n");
      writeFileSync(join(dir, "sample-C1.md"), "---\nname: sample/C1\n---\n\n# sample/C1\n");
      const before = snapshot(dir);
      verify(dir, "--exclude", "delivery");
      assert.deepEqual(snapshot(dir), before, "verification wrote nothing in the consumer");
      npm(["uninstall", "--no-audit", "--no-fund", NAME], dir);
      const after = snapshot(dir);
      for (const f of [relative(dir, record), "sample-C1.md"]) assert.equal(after[f], before[f], `${f} is unchanged`);
      assert.ok(!existsSync(join(dir, "node_modules", NAME)), "the machinery is gone");
      rmSync(dir, { recursive: true, force: true });
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
