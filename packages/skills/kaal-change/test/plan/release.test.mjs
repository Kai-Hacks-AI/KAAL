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
/** Every subprocess is bounded: a synchronous call blocks the event loop, so a test timeout alone cannot stop it. */
const BOUND = 120_000;
const npm = (args, cwd) => execFileSync("npm", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: BOUND });

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

/** Packs a package into `out`, returning the tarball's path. A package that builds its runtime when packed (Hosting's prepack) runs its scripts. */
function pack(from, out, { scripts = false } = {}) {
  const text = npm(["pack", "--json", ...(scripts ? [] : ["--ignore-scripts"]), "--pack-destination", out], from);
  return join(out, JSON.parse(text.slice(Math.max(0, text.search(/^\[/m)))).at(-1).filename);
}

/** Runs the installed package's consumer verification, as the consumer would. */
function verify(dir, ...args) {
  const r = spawnSync("npm", ["test", "--", ...args], { cwd: join(dir, "node_modules", NAME), encoding: "utf8", timeout: BOUND });
  assert.ok(!r.error, `consumer verification ended within ${BOUND} ms: ${r.error?.message}`);
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

  it("change/T25 [change/I12, change/F20, change/A13]: the shipped docs/ covers intent, requirements, architecture, testing, limitations and operations, defines every identifier a shipped case cites, and cites no plan, record or Change as authority", () => {
    const docs = ["intent", "requirements", "architecture", "testing", "limitations", "operations"].map((d) => `docs/${d}.md`);
    for (const d of docs) assert.ok(packed().includes(d), `${d} is in the packed artifact`);
    for (const d of docs) assert.ok(existsSync(join(PACKAGE, d)), `${d} is shipped`);
    const text = docs.map((d) => readFileSync(join(PACKAGE, d), "utf8")).join("\n");
    for (const forbidden of [/plan\//, /\.kaal\/changes/, /engineering\//, /\b[a-z][a-z0-9-]*\/C[1-9][0-9]*\b/]) {
      assert.doesNotMatch(text, forbidden, `the docs cite ${forbidden} as authority`);
    }
    const cases = JSON.parse(readFileSync(join(PACKAGE, "test/verify.json"), "utf8")).cases;
    const cited = new Set(cases.flatMap((c) => String(c.name).match(/\bchange\/[INFAT][0-9]+\b/g) ?? []));
    assert.ok(cited.size > 0, "the shipped cases cite contracts");
    for (const id of cited) assert.match(text, new RegExp(`\\*\\*${id.replace("/", "\\/")}\\b`), `${id} is defined in docs/`);
  });

  it("change/T26 [change/F21, change/F30]: docs/operations.md states start, platforms, use, verify, register, remove and release notes, and the README links every shipped document and does not state operation again", () => {
    const sections = (text) => text.split("\n").filter((l) => /^#{2,3} /.test(l)).map((l) => l.replace(/^#+ /, ""));
    const OPERATIONS = ["Start", "Platforms", "Use", "Verify the installed package", "Register", "Remove", "Release notes"];
    assert.ok(existsSync(join(PACKAGE, "docs/operations.md")), "docs/operations.md is shipped");
    const operations = readFileSync(join(PACKAGE, "docs/operations.md"), "utf8");
    for (const h of OPERATIONS) assert.ok(sections(operations).some((x) => x.startsWith(h)), `docs/operations.md has a "${h}" section`);
    assert.match(operations, new RegExp(`npm install ${NAME.replace("/", "\\/")}`), "Start names the package");
    assert.match(operations, new RegExp(`${PEER.replace("/", "\\/")}[^\\n]*optional|optional[^\\n]*${PEER.replace("/", "\\/")}`, "i"), "and says Graph is optional");
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    for (const d of ["intent", "requirements", "architecture", "testing", "limitations", "operations"]) {
      assert.match(readme, new RegExp(`\\]\\((\\./)?docs/${d}\\.md\\)`), `the README links docs/${d}.md`);
    }
    for (const h of OPERATIONS) assert.ok(!sections(readme).some((x) => x.startsWith(h)), `the README does not state "${h}" again: docs/operations.md is authoritative`);
  });

  it("change/T27 [change/F22, change/F23, change/F24, change/F30, change/N7, change/A14, change/A15]: the manifest declares every consumer case with when it applies, and the hash of every other shipped file; there are absence and Graph cases; its cases import only public entry points, the verifier only built-ins, and no publisher-only test is shipped", () => {
    const files = packed();
    assert.ok(existsSync(join(PACKAGE, "test/verify.json")), "the package ships test/verify.json");
    const m = JSON.parse(readFileSync(join(PACKAGE, "test/verify.json"), "utf8"));
    assert.ok(Array.isArray(m.cases) && m.cases.length > 0, "the manifest declares cases");
    for (const c of m.cases) {
      assert.match(String(c.name), /^test\/consumer\/[^>]+\.test\.mjs > /, `${JSON.stringify(c)} is a consumer case`);
      assert.ok(["always", "graph", "no-graph"].includes(c.when), `${c.name} declares when it applies`);
    }
    for (const when of ["always", "graph", "no-graph"]) assert.ok(m.cases.some((c) => c.when === when), `there are ${when} cases`);
    const hashed = Object.keys(m.files ?? {}).sort();
    assert.deepEqual(hashed, files.filter((f) => f !== "test/verify.json"), "every other shipped file is hashed");
    for (const [f, h] of Object.entries(m.files)) assert.equal(h, createHash("sha256").update(readFileSync(join(PACKAGE, f))).digest("hex"), `${f} matches its hash`);
    const consumerTests = files.filter((f) => f.startsWith("test/consumer/") && f.endsWith(".mjs"));
    assert.ok(consumerTests.length > 0);
    for (const f of [...consumerTests, "test/verify.mjs"]) {
      const src = readFileSync(join(PACKAGE, f), "utf8");
      // Every way a module is loaded: `from`, a side-effect import, a dynamic import, and require.
      for (const [, from, bare, dynamic, required] of src.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\s+["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)|\brequire\(\s*["']([^"']+)["']\s*\)/g)) {
        const spec = from ?? bare ?? dynamic ?? required;
        if (f === "test/verify.mjs") {
          assert.ok(spec.startsWith("node:"), `the verifier imports ${spec}: it uses only Node's built-ins, never the runtime it verifies`);
          continue;
        }
        const ok = spec.startsWith("node:") || spec.startsWith(`${NAME}/`) || (spec.startsWith(".") && !spec.includes("lib/"));
        assert.ok(ok, `${f} imports ${spec}, not a public entry point or a built-in`);
      }
    }
    assert.ok(!files.some((f) => /^test\/(plan|acceptance)\//.test(f) || /^test\/[^/]+\.test\.mjs$/.test(f)), "no publisher-only test is shipped");
    assert.ok(manifest().scripts?.["test:publisher"], "the publisher's tests run as test:publisher");
    assert.equal(manifest().scripts?.["test:embedded"], "node test/verify.mjs", "the Embedded verification is a declared suite");
    assert.equal(manifest().scripts?.test, "npm run test:embedded", "npm test runs the Embedded verification, in the source workspace and once installed");
  });

  it("change/T28 [change/I11, change/I13, change/I14, change/F19, change/F22, change/F23, change/F25]: in a clean consumer, the packed package verifies with Graph over the full delivery path, and verifies without Graph over the cannot-assess contract, with the Graph cases not applicable; a failing case is failed, and a changed file, a missing manifest or an applicable case that did not run is unknown", () => {
    verifier();
    const out = mkdtempSync(join(tmpdir(), "kaal-change-pack-"));
    const cases = (when) => JSON.parse(readFileSync(join(PACKAGE, "test/verify.json"), "utf8")).cases.filter((c) => c.when === when).map((c) => c.name);
    try {
      const change = pack(PACKAGE, out);
      const alone = consumer([change]);
      const without = verify(alone);
      assert.equal(without.status, 0, `without Graph, the installation verifies over what applies to it:\n${without.out}`);
      assert.match(without.out, /cannot-assess/, "including the cannot-assess contract");
      assert.match(without.out, new RegExp(`${PEER.replace("/", "\\/")}.*(absent|not installed)`, "i"), "and the evidence names Graph as absent");
      for (const name of cases("graph")) assert.ok(without.out.includes(name), `${name} is listed`);
      assert.match(without.out, /not applicable/i, "as not applicable");
      assert.match(without.out, new RegExp(`${NAME.replace("/", "\\/")}.*0\\.0\\.1`), "the evidence names the package and its version");
      const withGraph = consumer([change, pack(HOSTING, out, { scripts: true }), pack(GRAPH, out)]);
      const full = verify(withGraph);
      assert.equal(full.status, 0, `with Graph, the full delivery path verifies:\n${full.out}`);
      for (const name of cases("graph")) assert.ok(full.out.includes(name), `${name} ran`);
      assert.doesNotMatch(full.out, new RegExp(`${PEER.replace("/", "\\/")}.*(absent|not installed)`, "i"), "and Graph is not reported absent");
      const installed = join(withGraph, "node_modules", NAME);
      const manifestPath = join(installed, "test", "verify.json");
      const shipped = readFileSync(manifestPath);
      const broken = join(installed, "lib", "record.mjs");
      const original = readFileSync(broken);
      writeFileSync(broken, "export {};\n");
      const tampered = verify(withGraph);
      assert.equal(tampered.status, 2, `installed bytes that differ from the manifest are unknown:\n${tampered.out}`);
      assert.match(tampered.out, /lib\/record\.mjs/, "naming the changed file");
      const m = JSON.parse(shipped);
      m.files["lib/record.mjs"] = createHash("sha256").update(readFileSync(broken)).digest("hex");
      writeFileSync(manifestPath, JSON.stringify(m));
      const failed = verify(withGraph);
      assert.equal(failed.status, 1, `with the manifest matching, a consumer case that fails is failed:\n${failed.out}`);
      writeFileSync(broken, original);
      const unrun = JSON.parse(shipped);
      unrun.cases.push({ name: "test/consumer/record.test.mjs > a declared case no test file holds", when: "always" });
      writeFileSync(manifestPath, JSON.stringify(unrun));
      const notRun = verify(withGraph);
      assert.equal(notRun.status, 2, `an applicable case that did not run is unknown:\n${notRun.out}`);
      assert.match(notRun.out, /a declared case no test file holds/, "naming it");
      rmSync(manifestPath);
      const missing = verify(withGraph);
      assert.equal(missing.status, 2, `a missing manifest is unknown:\n${missing.out}`);
      writeFileSync(manifestPath, shipped);
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
      verify(dir);
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
  it("change/T33 [change/F19, change/F29]: without Graph, the installed package's cannot-assess names @kaihacksai/kaal-graph and offers exactly install-and-retry and analyze, gives no verdict, installs and writes nothing, and consumer verification states the same next step", { timeout: 300_000 }, () => {
    verifier();
    const out = mkdtempSync(join(tmpdir(), "kaal-change-pack-"));
    try {
      const dir = consumer([pack(PACKAGE, out)]);
      writeFileSync(join(dir, "sample-C1.md"), "---\nname: sample/C1\n---\n\n# sample/C1\n");
      const before = snapshot(dir);
      const modules = readdirSync(join(dir, "node_modules"), { recursive: true }).sort();
      const probe = `const { assess } = await import(${JSON.stringify(`${NAME}/delivery`)});
        const node = { name: "sample/C1", bytes: new TextEncoder().encode("---\\nname: sample/C1\\n---\\n") };
        const r = await assess([node], { evidence: { by: "consumer", evaluations: [] } });
        const plain = (v) => typeof v === "function" ? "<function>" : v;
        process.stdout.write(JSON.stringify(r, (k, v) => plain(v)));`;
      const run = spawnSync(process.execPath, ["--input-type=module", "-e", probe], { cwd: dir, encoding: "utf8", timeout: BOUND });
      assert.equal(run.status, 0, `./delivery loads and assess returns without Graph:\n${run.stdout}${run.stderr}`);
      const r = JSON.parse(run.stdout);
      assert.deepEqual(r.findings, [{
        kind: "cannot-assess",
        peer: PEER,
        next: [{ action: "install", peer: PEER }, { action: "analyze" }],
      }], "exactly one finding: the missing peer and exactly the two next steps, in order");
      const text = run.stdout;
      for (const verdict of ["satisfied", "delivered", "unmet", "awaiting", "failed", "passed"]) {
        assert.ok(!text.includes(`"${verdict}"`), `no ${verdict} appears: inability to assess is never a delivery result`);
      }
      assert.ok(!/npm (i|install)\b|https?:|\.(mjs|js|json)\b/.test(JSON.stringify(r.findings)), "no invented remedy: no command, URL or file is named");
      assert.deepEqual(readdirSync(join(dir, "node_modules"), { recursive: true }).sort(), modules, "nothing was installed");
      assert.ok(!existsSync(join(dir, "node_modules", PEER)), "Graph was not installed silently");
      assert.deepEqual(snapshot(dir), before, "assess wrote nothing in the consumer");
      const evidence = verify(dir);
      assert.equal(evidence.status, 0, `the installation still verifies:\n${evidence.out}`);
      const reasons = evidence.out.split("\n").filter((l) => /not applicable/i.test(l));
      assert.ok(reasons.length > 0, `the Graph cases are listed as not applicable:\n${evidence.out}`);
      for (const line of reasons) {
        assert.ok(line.includes(PEER), `the reason names ${PEER}: ${line}`);
        assert.match(line, /install/i, `and the next step, install and retry: ${line}`);
        assert.match(line, /analy[sz]e/i, `or analyze: ${line}`);
      }
      rmSync(dir, { recursive: true, force: true });
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });

  it("change/T34 [change/F31, change/A14]: the runtime is declared as Node.js 24 or later and the platforms as Linux, Windows and macOS; lib/ imports no host module, and the verifier starts its cases with the running Node executable, never through a shell", () => {
    assert.equal(manifest().engines?.node, ">=24", "engines declares Node.js 24 or later");
    assert.ok(existsSync(join(PACKAGE, "docs/operations.md")), "docs/operations.md is shipped");
    const platforms = readFileSync(join(PACKAGE, "docs/operations.md"), "utf8").split(/^#{2,3} /m).find((x) => x.startsWith("Platforms")) ?? "";
    for (const os of ["Linux", "Windows", "macOS"]) assert.match(platforms, new RegExp(`\\b${os}\\b`), `the Platforms section names ${os}`);
    for (const f of packed().filter((f) => f.startsWith("lib/"))) {
      assert.doesNotMatch(readFileSync(join(PACKAGE, f), "utf8"), /["']node:(fs|child_process|os|path|process|net|http|https|worker_threads)["']/, `${f} imports no host module`);
    }
    assert.ok(existsSync(join(PACKAGE, "test/verify.mjs")), "the package ships test/verify.mjs");
    const verifier = readFileSync(join(PACKAGE, "test/verify.mjs"), "utf8");
    assert.match(verifier, /process\.execPath/, "the verifier starts cases with the running Node executable");
    assert.doesNotMatch(verifier, /shell\s*:\s*true|\bexecSync\(|\bexec\(/, "and never through a shell");
  });

  it("change/T35 [change/F32, change/F29, change/A14]: the manifest traces every Requirement docs/requirements.md defines to declared cases or an allocation; without Graph, a Requirement traced only to Graph cases is reported unresolved with the peer and the next step, and never as covered", { timeout: 300_000 }, () => {
    verifier();
    const m = JSON.parse(readFileSync(join(PACKAGE, "test/verify.json"), "utf8"));
    const defined = [...new Set(readFileSync(join(PACKAGE, "docs/requirements.md"), "utf8").match(/\*\*change\/[NF][0-9]+\*\*/g) ?? [])].map((x) => x.replace(/\*/g, "")).sort();
    assert.ok(defined.length > 0, "docs/requirements.md defines Requirements");
    assert.deepEqual(Object.keys(m.requirements ?? {}).sort(), defined, "the manifest traces exactly the defined Requirements");
    const names = new Set(m.cases.map((c) => c.name));
    const graphOnly = [];
    for (const [id, trace] of Object.entries(m.requirements)) {
      if (Array.isArray(trace)) {
        assert.ok(trace.length > 0, `${id} is traced to at least one case`);
        for (const n of trace) assert.ok(names.has(n), `${id} is traced to ${n}, a declared case`);
        if (trace.every((n) => m.cases.find((c) => c.name === n).when === "graph")) graphOnly.push(id);
      } else {
        assert.match(String(trace?.allocated ?? ""), /\S/, `${id} is traced to a case or names its allocation`);
      }
    }
    assert.ok(graphOnly.length > 0, "some Requirement is decided only with Graph");
    const out = mkdtempSync(join(tmpdir(), "kaal-change-pack-"));
    try {
      const dir = consumer([pack(PACKAGE, out)]);
      const evidence = verify(dir);
      assert.equal(evidence.status, 0, `an absent complement does not by itself make the result unknown:\n${evidence.out}`);
      const lines = evidence.out.split("\n");
      for (const id of graphOnly) {
        const about = lines.filter((l) => new RegExp(`\\b${id.replace("/", "\\/")}\\b`).test(l));
        assert.ok(about.some((l) => /unresolved/i.test(l) && l.includes(PEER) && /install/i.test(l) && /analy[sz]e/i.test(l)), `${id} is unresolved, naming ${PEER} and the next step:\n${about.join("\n")}`);
        assert.ok(!about.some((l) => /\b(covered|verified)\b/i.test(l) && !/unresolved/i.test(l)), `${id} is never reported covered or verified`);
      }
      rmSync(dir, { recursive: true, force: true });
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
