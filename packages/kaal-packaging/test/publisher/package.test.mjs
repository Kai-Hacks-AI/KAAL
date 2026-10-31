// packaging/C4 planned tests (plan/package/testing.md), written at the start of packaging/C5. Each
// title names the Requirements it checks. They use kaal-packaging's public interface only.
//
// Every case builds a fixture package, packs it with the npm the lane installed, and installs the
// tarball offline into a fresh consumer project, as a consumer would. A dependency the fixture
// declares is placed in the consumer beforehand, so the install needs no registry. Each case runs
// the conformance suite against a conforming package and against fixtures that break one
// Requirement, and checks that the suite names that Requirement and its cause. npm is handed to the
// suite as a command (packaging/A13), so no case here knows the operating system (packaging/N11).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { execute } from "kaal-hosting";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-conformance-"));
const WORK = join(SCRATCH, "npm");
mkdirSync(WORK, { recursive: true });
writeFileSync(join(WORK, "npmrc"), "");
/** npm, kept to the scratch directory: its cache, configuration and logs, and no network. */
const ENV = {
  ...process.env,
  npm_config_cache: join(WORK, "cache"),
  npm_config_userconfig: join(WORK, "npmrc"),
  npm_config_logs_max: "0",
  npm_config_update_notifier: "false",
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_offline: "true",
};
let made = 0;

/** kaal-packaging's conformance suite, or the reason a test is blocked before any behavioural assertion. */
async function suite() {
  try {
    return await import("kaal-packaging/conformance");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-packaging/conformance does not resolve (${e.code ?? e.message})`);
  }
}

/** A fresh, empty directory under the scratch directory. */
function fresh(name) {
  const dir = join(SCRATCH, `${name}-${++made}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** The npm the lane installed: npm's own script when npm started this run, given to the suite (packaging/A13); else none, and npm runs by name. */
const NPM = process.env.npm_execpath || undefined;

/** npm, run through Hosting as NPM names it: its stdout, or a failure naming its status. */
async function npm(args, cwd) {
  const r = await execute(NPM ? process.execPath : "npm", NPM ? [NPM, ...args] : args, { cwd, env: ENV });
  if (r.status !== 0) throw new Error(`npm ${args[0]} exited ${r.status}: ${r.stderr}`);
  return r.stdout;
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Every file under `dir`, by path relative to it with forward slashes. */
function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path, base) : [relative(base, path).split("\\").join("/")];
  });
}

function writeAll(dir, files) {
  for (const [path, body] of Object.entries(files)) {
    if (body === undefined) continue;
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), body);
  }
}

/** The summary line a conforming verifier ends on, for `cases` declared cases. */
function summary(name, { result = "verified", exit, executed, passed, failed = 0, causes = [] }) {
  return `${name}-verification ${JSON.stringify({ result, exit, cases: { executed, passed, failed }, causes })}`;
}

/**
 * The verifier a conforming fixture ships: each case it runs calls the shipped module and checks
 * its answer, and the result line names each execution by case. `cases` is how many of the
 * declared cases it runs, in order, or the exact list of case identities it runs.
 */
function verifier(name, cases) {
  const ids = Array.isArray(cases) ? cases : ["fixture/T1", "fixture/T2", "fixture/T3"].slice(0, cases);
  return `import { add } from "../lib/add.mjs";
const checks = { "fixture/T1": () => add(2, 3) === 5, "fixture/T2": () => add(0, 0) === 0, "fixture/T3": () => add(-1, 1) === 0, "fixture/T4": () => true };
const cases = ${JSON.stringify(ids)}.map((id) => ({ name: id, outcome: checks[id]() ? "pass" : "fail" }));
const failed = cases.filter((c) => c.outcome === "fail").length;
const result = failed ? "failed" : "verified";
console.log(\`\${cases.length - failed} passed\`);
console.log(${JSON.stringify(name)} + "-verification " + JSON.stringify({ result, exit: failed ? 1 : 0, cases, causes: failed ? ["a case failed"] : [] }));
process.exitCode = failed ? 1 : 0;
`;
}

/** A verifier that reports every declared case passed after checking only that `docs/requirements.md` exists. */
const PRESENCE = `import { existsSync } from "node:fs";
const ok = existsSync(new URL("../docs/requirements.md", import.meta.url));
const cases = ["fixture/T1", "fixture/T2", "fixture/T3"].map((id) => ({ name: id, outcome: ok ? "pass" : "fail" }));
console.log("3 passed");
console.log("kaal-fixture-verification " + JSON.stringify({ result: "verified", exit: 0, cases, causes: [] }));
`;

/** A verifier that reports every declared case passed after checking only the shipped files' digests against the manifest. */
const DIGESTS = `import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const at = (p) => new URL("../" + p, import.meta.url);
const manifest = JSON.parse(readFileSync(at("test/verify.json"), "utf8"));
const ok = Object.entries(manifest.files).every(([p, d]) => createHash("sha256").update(readFileSync(at(p))).digest("hex") === d);
const cases = manifest.cases.map((id) => ({ name: id, outcome: ok ? "pass" : "fail" }));
console.log(cases.length + " passed");
console.log("kaal-fixture-verification " + JSON.stringify({ result: ok ? "verified" : "unknown", exit: ok ? 0 : 2, cases, causes: ok ? [] : ["a file differs"] }));
process.exitCode = ok ? 0 : 2;
`;

/**
 * A conforming KAAL package's files, with `change` applied: a path set to `undefined` is left out,
 * and `manifest` and `pkg` patch the shipped manifest and package.json.
 */
function conforming(change = {}) {
  const name = change.name ?? "kaal-fixture";
  const pkg = {
    name,
    version: "1.0.0",
    license: "MIT",
    type: "module",
    scripts: { test: "node test/verify.mjs" },
    engines: { node: ">=24" },
    ...change.pkg,
  };
  for (const [key, value] of Object.entries(change.pkg ?? {})) if (value === undefined) delete pkg[key];
  const files = {
    "README.md": "# Fixture\n\nSee [Operations](docs/operations.md).\n",
    "docs/intent.md": "# Intent\n\nfixture/I1.\n",
    "docs/requirements.md": "# Requirements\n\n- **fixture/F1**: It adds.\n",
    "docs/architecture.md": "# Architecture\n\nOne module.\n",
    "docs/testing.md": "# Testing\n\nfixture/T1 covers fixture/F1.\n",
    "docs/limitations.md": "# Limitations\n\nNone known.\n",
    "docs/operations.md": "# Operations\n\nnpm test\n",
    "lib/add.mjs": "export const add = (a, b) => a + b;\n",
    "test/verify.mjs": verifier(name, 3),
    ...change.files,
  };
  files["package.json"] = JSON.stringify(pkg, null, 2) + "\n";
  const manifest = {
    cases: ["fixture/T1", "fixture/T2", "fixture/T3"],
    model: { cases: [{ id: "fixture/T1", tests: ["fixture/F1"] }, { id: "fixture/T2", tests: ["fixture/F1"] }, { id: "fixture/T3", tests: ["fixture/F1"] }] },
    ...change.manifest,
  };
  if (change.manifest !== null) {
    manifest.files = Object.fromEntries(Object.entries(files).filter(([, b]) => b !== undefined).map(([p, b]) => [p, sha256(Buffer.from(b))]).sort());
    Object.assign(manifest, change.manifestFiles ? { files: change.manifestFiles(manifest.files) } : {});
    files["test/verify.json"] = JSON.stringify(manifest, null, 2) + "\n";
  }
  return files;
}

/**
 * `files` packed with npm and installed offline into a fresh consumer project; `deps` are placed in
 * the consumer first, and `around` is written into the consumer's project, as a checkout would
 * hold it. `record` adds entries to the consumer's install record (node_modules/.package-lock.json),
 * as an install from a registry would have written them; `lockfile` writes them to the consumer's
 * package-lock.json instead. Returns the installed package's directory and the consumer's.
 */
async function install(files, { deps = {}, tamper = {}, around = {}, record, lockfile } = {}) {
  const source = fresh("source");
  writeAll(source, files);
  const out = fresh("packed");
  const tgz = JSON.parse(await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", out], source))[0].filename;
  const consumer = fresh("consumer");
  writeAll(consumer, { "package.json": JSON.stringify({ name: "consumer", version: "1.0.0", private: true }) + "\n" });
  writeAll(consumer, around);
  for (const [dep, version] of Object.entries(deps)) writeAll(join(consumer, "node_modules", dep), { "package.json": JSON.stringify({ name: dep, version }) });
  await npm(["install", join(out, tgz), "--ignore-scripts", "--no-save", "--no-package-lock"], consumer);
  const dir = join(consumer, "node_modules", JSON.parse(files["package.json"]).name);
  writeAll(dir, tamper);
  const hidden = join(consumer, "node_modules", ".package-lock.json");
  if (record) {
    const prior = existsSync(hidden) ? JSON.parse(readFileSync(hidden, "utf8")) : { name: "consumer", lockfileVersion: 3, packages: {} };
    writeFileSync(hidden, JSON.stringify({ ...prior, packages: { ...prior.packages, ...record } }));
  }
  if (lockfile) {
    // A consumer whose install left no hidden record, only its project lockfile.
    rmSync(hidden, { force: true });
    writeAll(consumer, { "package-lock.json": JSON.stringify({ name: "consumer", lockfileVersion: 3, packages: lockfile }) });
  }
  return { dir, consumer };
}

/**
 * A stand-in for Testing's model functions (testing/F24–F25), used only while the installed Testing
 * does not yet export kaal-testing/model. It holds to that interface's contract as far as these
 * fixtures reach: a sound model of uniquely named Cases, each `tests` a list of nonempty strings,
 * and the reverse traversal of Case —tests→ Target.
 */
const STAND_IN = {
  check(model) {
    if (model === null || typeof model !== "object" || Array.isArray(model)) return ["a model is an object"];
    if (model.cases !== undefined && !Array.isArray(model.cases)) return ["cases must be a list"];
    const seen = new Set(), problems = [];
    for (const c of model.cases ?? []) {
      if (seen.has(c.id)) problems.push(`${c.id}: duplicate identity`);
      seen.add(c.id);
      if (c.tests !== undefined && !(Array.isArray(c.tests) && c.tests.every((t) => typeof t === "string" && t !== ""))) problems.push(`${c.id}: tests must be nonempty strings`);
    }
    return problems;
  },
  tested(model) {
    const out = {};
    for (const c of model.cases ?? []) if (!c.retired) for (const t of c.tests ?? []) (out[t] ??= []).push(c.id);
    return out;
  },
};

/** Testing's model functions as installed, or the stand-in while Testing does not export them yet. */
const INSTALLED = await import("kaal-testing/model").then((m) => (typeof m.check === "function" && typeof m.tested === "function" ? m : null), () => null);
const TESTING = INSTALLED ?? STAND_IN;

/** The suite's findings for an installed package, by Requirement. */
async function conform(files, options) {
  const { conform } = await suite();
  const { dir, consumer } = await install(files, options);
  const testing = options && "testing" in options ? options.testing : TESTING;
  const report = await conform(dir, { consumer, env: ENV, work: options?.work === null ? undefined : fresh("probe"), testing, npm: NPM });
  return { report, by: Object.fromEntries(report.findings.map((f) => [f.requirement, f])), dir, consumer };
}

function expect(by, requirement, result, cause) {
  const f = by[requirement];
  assert.ok(f, `the suite reports no finding for ${requirement}`);
  assert.equal(f.result, result, `${requirement}: ${f.cause}`);
  if (cause) assert.match(f.cause, cause);
}

describe("packaging/C5 the KAAL Package conformance suite", () => {
  it("packaging/T15 F7: name, exact version and exact registry dependencies", async () => {
    const pinned = conforming({ pkg: { dependencies: { "kaal-dep": "1.2.3" } } });
    const deps = { "kaal-dep": "1.2.3" };
    const registry = { version: "1.2.3", resolved: "https://registry.example/kaal-dep/-/kaal-dep-1.2.3.tgz", integrity: `sha512-${"A".repeat(86)}==` };
    const good = await conform(pinned, { deps, record: { "node_modules/kaal-dep": registry } });
    expect(good.by, "packaging/F7", "verified", /records each of its 1 runtime dependencies as resolved from a registry with integrity\. That is recorded resolution, not independently verified provenance/);

    const dep = fresh("file-dep");
    writeAll(dep, { "package.json": JSON.stringify({ name: "kaal-dep", version: "1.2.3" }) });
    const file = await conform(conforming({ pkg: { dependencies: { "kaal-dep": `file:${dep}` } } }), { deps: { "kaal-dep": "1.2.3" } });
    expect(file.by, "packaging/F7", "failed", /kaal-dep is "file:.*not one exact registry version/);

    const range = await conform(conforming({ pkg: { dependencies: { "kaal-dep": "^1.0.0" } } }), { deps: { "kaal-dep": "1.2.3" } });
    expect(range.by, "packaging/F7", "failed", /kaal-dep is "\^1\.0\.0"/);
    assert.equal(range.report.result, "failed");
  });

  it("packaging/T32 F19: F7 verifies a dependency the install records as resolved from a registry with integrity, fails a file:, link or git resolution or a missing integrity, and is unknown when nothing is recorded", async () => {
    const pinned = conforming({ pkg: { dependencies: { "kaal-dep": "1.2.3" } } });
    const deps = { "kaal-dep": "1.2.3" };
    const registry = { version: "1.2.3", resolved: "https://registry.example/kaal-dep/-/kaal-dep-1.2.3.tgz", integrity: `sha512-${"A".repeat(86)}==` };
    expect((await conform(pinned, { deps, lockfile: { "node_modules/kaal-dep": registry } })).by, "packaging/F7", "verified", /not independently verified provenance/);
    const nested = { "node_modules/kaal-dep": { ...registry, resolved: "file:../elsewhere" }, "node_modules/kaal-fixture/node_modules/kaal-dep": registry };
    expect((await conform(pinned, { deps, record: nested })).by, "packaging/F7", "verified", /resolved from a registry/);

    // A pinned version placed by path, which F7 verified before F19: the install records no resolution.
    expect((await conform(pinned, { deps })).by, "packaging/F7", "unknown", /records no resolution for kaal-dep/);
    const recorded = (entry) => conform(pinned, { deps, record: { "node_modules/kaal-dep": entry } });
    expect((await recorded({ ...registry, resolved: "file:../kaal-dep-1.2.3" })).by, "packaging/F7", "failed", /kaal-dep resolved from "file:\.\.\/kaal-dep-1\.2\.3", not a registry/);
    expect((await recorded({ resolved: "../kaal-dep", link: true })).by, "packaging/F7", "failed", /"a link", not a registry/);
    expect((await recorded({ ...registry, resolved: "git+https://example.invalid/kaal-dep.git#abc" })).by, "packaging/F7", "failed", /not a registry/);
    expect((await recorded({ ...registry, integrity: undefined })).by, "packaging/F7", "failed", /no recorded integrity/);
  });

  it("packaging/T16 F8: the shipped documents are present and non-empty, and the README links docs/operations.md", async () => {
    expect((await conform(conforming())).by, "packaging/F8", "verified");
    expect((await conform(conforming({ files: { "docs/limitations.md": undefined } }))).by, "packaging/F8", "failed", /docs\/limitations\.md is not shipped/);
    expect((await conform(conforming({ files: { "docs/requirements.md": "\n" } }))).by, "packaging/F8", "failed", /docs\/requirements\.md is empty/);
    const inReadme = conforming({ files: { "docs/operations.md": undefined, "README.md": "# Fixture\n\n## Operations\n\nnpm test\n" } });
    const f = (await conform(inReadme)).by["packaging/F8"];
    assert.equal(f.result, "failed");
    assert.match(f.cause, /docs\/operations\.md is not shipped/);
    assert.match(f.cause, /README\.md does not link docs\/operations\.md/);
  });

  it("packaging/T17 F9, N9: the installed npm test executes the Embedded verification against the installed copy", async () => {
    const good = await conform(conforming());
    expect(good.by, "packaging/F9", "verified", /installed copy/);
    expect(good.by, "packaging/N9", "verified", /depends on their behaviour/);

    // Installed inside a checkout, a relative import of the checkout resolves and the run succeeds.
    // It still does not run against the installed copy alone.
    const checkout = `import { add as fromCheckout } from "../../../packages/kaal-fixture/lib/add.mjs";\nfromCheckout(1, 1);\n${verifier("kaal-fixture", 3)}`;
    const around = { "packages/kaal-fixture/lib/add.mjs": "export const add = (a, b) => a + b;\n" };
    const reach = await conform(conforming({ files: { "test/verify.mjs": checkout } }), { around });
    expect(reach.by, "packaging/F10", "verified");
    expect(reach.by, "packaging/F9", "failed", /test\/verify\.mjs imports \.\.\/\.\.\/\.\.\/packages/);

    const publisher = conforming({ pkg: { scripts: { test: "node --test test/plan/add.test.mjs" } } });
    expect((await conform(publisher)).by, "packaging/F9", "failed", /reported no result/);
  });

  it("packaging/T18 F10: the entrypoint's line carries a result consistent with its exit and cases", async () => {
    expect((await conform(conforming())).by, "packaging/F10", "verified", /verified, exit 0/);

    const lying = `console.log(${JSON.stringify(summary("kaal-fixture", { exit: 0, executed: 3, passed: 2, failed: 1 }))});\n`;
    expect((await conform(conforming({ files: { "test/verify.mjs": lying } }))).by, "packaging/F10", "failed", /verified with 1 cases failed/);

    const silent = `console.log(${JSON.stringify(summary("kaal-fixture", { result: "failed", exit: 1, executed: 3, passed: 2, failed: 1 }))}); process.exitCode = 1;\n`;
    const r = await conform(conforming({ files: { "test/verify.mjs": silent } }));
    expect(r.by, "packaging/F10", "failed", /reported failed without a cause/);
    assert.deepEqual(r.report.reported, { result: "failed", exit: 1, causes: [] });

    const exit = `console.log("1 passed"); console.log("verified"); process.exitCode = 1;\n`;
    expect((await conform(conforming({ files: { "test/verify.mjs": exit } }))).by, "packaging/F10", "failed", /reported verified but exited 1/);
  });

  it("packaging/T19 F11: a changed installed file, and a declared case missing, run twice or replaced, are reported, never verified", async () => {
    expect((await conform(conforming())).by, "packaging/F11", "verified", /each of the 3 declared cases ran exactly once/);

    const tampered = await conform(conforming(), { tamper: { "lib/add.mjs": "export const add = (a, b) => a - b;\n" } });
    expect(tampered.by, "packaging/F11", "unknown", /lib\/add\.mjs differs from the manifest/);

    const ran = async (cases) => (await conform(conforming({ files: { "test/verify.mjs": verifier("kaal-fixture", cases) } }))).by;
    expect(await ran(["fixture/T1", "fixture/T2"]), "packaging/F11", "unknown", /declared cases did not run: fixture\/T3/);
    // Three executions, as many as declared: one case twice, another not at all.
    const twice = (await ran(["fixture/T1", "fixture/T1", "fixture/T2"]))["packaging/F11"];
    assert.equal(twice.result, "unknown");
    assert.match(twice.cause, /fixture\/T1 \(2 times\)/);
    assert.match(twice.cause, /did not run: fixture\/T3/);
    // Three executions again: a stand-in in place of a declared case.
    const standIn = (await ran(["fixture/T1", "fixture/T2", "fixture/T4"]))["packaging/F11"];
    assert.equal(standIn.result, "unknown");
    assert.match(standIn.cause, /the manifest does not declare: fixture\/T4/);
    assert.match(standIn.cause, /did not run: fixture\/T3/);

    // Counts only, however right, say nothing about which cases ran.
    const counts = `console.log("3 passed");\nconsole.log(${JSON.stringify(summary("kaal-fixture", { exit: 0, executed: 3, passed: 3 }))});\n`;
    expect((await conform(conforming({ files: { "test/verify.mjs": counts } }))).by, "packaging/F11", "unknown", /reports counts, not each case by name/);
    // A declared case reported as not run is not run.
    const notRun = verifier("kaal-fixture", 3).replace('const failed =', 'cases[2].outcome = "not run";\nconst failed =');
    expect((await conform(conforming({ files: { "test/verify.mjs": notRun } }))).by, "packaging/F11", "unknown", /reported but did not run: fixture\/T3 \(not run\)/);

    expect((await conform(conforming({ manifest: null }))).by, "packaging/F11", "unknown", /no manifest/);
  });

  it("packaging/T20 F12: the runtime and platforms are declared", async () => {
    // No false RED: a portable package, which declares its runtime and correctly omits os and cpu, conforms.
    expect((await conform(conforming())).by, "packaging/F12", "verified", /node >=24, with no os or cpu restriction/);
    expect((await conform(conforming({ pkg: { engines: undefined } }))).by, "packaging/F12", "failed", /no runtime/);
    const { platforms } = await suite();
    // No false GREEN: an os or cpu restriction outside Hosting's OS boundary never earns a positive result.
    const boundary = (name) => name === "@kaihacksai/kaal-hosting";
    const pkg = { name: "fixture", engines: { node: ">=24" } };
    const by = (f) => ({ [f.requirement]: f });
    expect(by(platforms({ ...pkg, os: ["linux"] }, { osBoundary: boundary })), "packaging/F12", "failed", /only Hosting's OS boundary may/);
    expect(by(platforms({ ...pkg, cpu: ["x64"] }, { osBoundary: boundary })), "packaging/F12", "failed", /cpu \["x64"\]/);
    expect(by(platforms({ ...pkg, os: [] }, { osBoundary: boundary })), "packaging/F12", "failed", /os \[\]/);
    expect(by(platforms({ ...pkg, os: ["linux"], osBoundary: true }, { osBoundary: boundary })), "packaging/F12", "failed", /fixture is not it/);
    expect(by(platforms({ ...pkg, name: "@kaihacksai/kaal-hosting", os: ["linux"] }, { osBoundary: boundary })), "packaging/F12", "verified", /Hosting's OS boundary/);
    expect(by(platforms({ ...pkg, os: ["linux"] }, { osBoundary: undefined })), "packaging/F12", "unknown", /declares no OS boundary/);
    // Installed: the same restriction, decided by the installed Hosting, is never verified.
    const restricted = (await conform(conforming({ pkg: { os: ["linux"] } }))).by["packaging/F12"];
    assert.notEqual(restricted.result, "verified", restricted.cause);
  });

  it("packaging/T21 F13: the traces a package ships are Testing's model, Case tests Target, and they resolve", async () => {
    // No false RED or unknown: a package whose traces are a sound model of its delivered cases conforms.
    expect((await conform(conforming())).by, "packaging/F13", "verified", /3 delivered cases are its model's Cases, and they test 1 of the 1 identifiers/);
    // A package such as Foundation, which defines no identifier and ships neither a model nor a coverage registry, conforms.
    const foundation = conforming({ manifest: null, files: { "docs/requirements.md": "# Requirements\n\nIt hashes bytes with SHA-256, as FIPS 180-4 states.\n" } });
    expect((await conform(foundation)).by, "packaging/F13", "verified", /no trace to resolve/);
    // No false GREEN: identifiers defined with no model to derive their Cases from are unknown, whatever a registry declares.
    const registry = { model: undefined, identifiers: ["fixture/F1"], coverage: { "fixture/F1": { embedded: ["fixture/T1"] } }, allocated: {}, unverified: {} };
    expect((await conform(conforming({ manifest: registry }))).by, "packaging/F13", "unknown", /ships no Testing model.*coverage declaration, not evidence/);
    // Installed: without Testing's model functions, a shipped model is never verified.
    const bare = (await conform(conforming(), { testing: null })).by["packaging/F13"];
    assert.equal(bare.result, "unknown", bare.cause);
    // Decided from the shipped files and manifest.
    const { traceability } = await suite();
    const decide = (change, ...given) => {
      const testing = given.length ? given[0] : TESTING;
      const files = Object.fromEntries(Object.entries(conforming(change)).filter(([, b]) => b !== undefined).map(([p, b]) => [p, Buffer.from(b)]));
      const verify = files["test/verify.json"] ? JSON.parse(files["test/verify.json"].toString("utf8")) : null;
      return { x: traceability(files, verify, { testing }) };
    };
    const model = (...cases) => ({ cases: cases.map(([id, ...tests]) => ({ id, tests })) });
    const two = { "docs/requirements.md": "# Requirements\n\n- **fixture/F1**: It adds.\n- **fixture/F2**: It adds zero.\n" };
    // No coverage rule is Packaging's (it waits on the Owner's decision on Testing #667): an identifier no Case tests is reported, not judged.
    expect(decide({ files: two }), "x", "verified", /test 1 of the 2 identifiers/);
    expect(decide({ manifest: { identifiers: ["fixture/F1"], allocated: { "fixture/F2": "elsewhere" } } }), "x", "verified", /identifiers, allocated are a coverage declaration, not evidence, and were not read/);
    expect(decide({ manifest: { model: undefined } }), "x", "unknown", /define 1 identifiers, and it ships no Testing model/);
    expect(decide({ manifest: { model: model(["fixture/T1", "fixture/F9"], ["fixture/T2"], ["fixture/T3"]) } }), "x", "failed", /do not define: fixture\/F9 \(by fixture\/T1\)/);
    expect(decide({ manifest: { model: model(["fixture/T1", "fixture/F1"], ["fixture/T2"], ["fixture/T3"], ["fixture/T4", "fixture/F1"]) } }), "x", "failed", /model's Cases are not delivered: fixture\/T4/);
    expect(decide({ manifest: { model: model(["fixture/T1", "fixture/F1"], ["fixture/T2"]) } }), "x", "failed", /delivered cases are not Cases of its model: fixture\/T3/);
    expect(decide({ manifest: { model: model(["fixture/T1", "fixture/F1"], ["fixture/T1"], ["fixture/T2"], ["fixture/T3"]) } }), "x", "failed", /Testing's check: .*duplicate/);
    expect(decide({ manifest: { cases: undefined } }), "x", "failed", /declares no delivered cases/);
    expect(decide({}, null), "x", "unknown", /no Testing model functions .* were given/);
    expect(decide({}, undefined), "x", "unknown", /no Testing model functions .* were given/);
    // Packaging does not need Testing installed: with every kaal-testing resolution refused, the suite loads,
    // Foundation's form verifies, and a shipped model is unknown, never verified.
    const probe = `import { registerHooks } from "node:module";
registerHooks({ resolve(specifier, context, next) { if (specifier === "kaal-testing" || specifier.startsWith("kaal-testing/")) throw new Error("kaal-testing is not installed"); return next(specifier, context); } });
const { traceability } = await import("kaal-packaging/conformance");
const docs = (requirements) => ({ "docs/requirements.md": new TextEncoder().encode(requirements) });
const foundation = traceability(docs("# Requirements\\n\\nIt hashes bytes.\\n"), null);
const model = traceability(docs("- **fixture/F1**: It adds.\\n"), { cases: ["fixture/T1"], model: { cases: [{ id: "fixture/T1", tests: ["fixture/F1"] }] } });
console.log(JSON.stringify([foundation.result, model.result]));`;
    const child = await execute(process.execPath, ["--input-type=module", "-e", probe], { cwd: PACKAGE });
    assert.equal(child.status, 0, child.stderr);
    const out = child.stdout.trim().split(/\r?\n/).at(-1);
    assert.deepEqual(JSON.parse(out), ["verified", "unknown"]);
  });

  it("packaging/T22 N7: the consumer's project is byte-identical after verification", async () => {
    const good = await conform(conforming());
    expect(good.by, "packaging/N7", "verified");
    const cache = `import { writeFileSync } from "node:fs";\nwriteFileSync(new URL("../../../.fixture-cache", import.meta.url), "x");\n${verifier("kaal-fixture", 3)}`;
    const r = await conform(conforming({ files: { "test/verify.mjs": cache } }));
    expect(r.by, "packaging/N7", "failed", /changed the consumer: \.fixture-cache/);
    assert.ok(existsSync(join(r.consumer, ".fixture-cache")));
  });

  it("packaging/T23 N8: the installed verification needs only its declared runtime dependencies", async () => {
    expect((await conform(conforming())).by, "packaging/N8", "verified");
    const testing = `import "kaal-testing/verify";\n${verifier("kaal-fixture", 3)}`;
    const r = await conform(conforming({ files: { "test/verify.mjs": testing } }));
    expect(r.by, "packaging/N8", "failed", /test\/verify\.mjs imports kaal-testing/);
    assert.equal(r.report.result, "failed");
  });

  it("packaging/T24 N9: a verification that passes on presence, whatever the package does, is detected; a count never certifies behaviour", async () => {
    // Its documents are all shipped and docs/requirements.md says fixture/F1: "It adds". Its
    // module subtracts, and its verifier checks only that the document exists.
    const subtracts = { "lib/add.mjs": "export const add = (a, b) => a - b;\n" };
    const presence = await conform(conforming({ files: { ...subtracts, "test/verify.mjs": PRESENCE } }));
    expect(presence.by, "packaging/F8", "verified");
    assert.deepEqual(presence.report.reported, { result: "verified", exit: 0, causes: [] });
    expect(presence.by, "packaging/N9", "failed", /still reports verified: it decides from presence, not behaviour/);
    assert.equal(presence.report.result, "failed");

    // Digests are presence too: the probe keeps the manifest consistent with what it broke.
    expect((await conform(conforming({ files: { "test/verify.mjs": DIGESTS } }))).by, "packaging/N9", "failed", /from presence/);

    // A bare verified, with no count, is decided the same way.
    expect((await conform(conforming({ files: { "test/verify.mjs": `console.log("verified");\n` } }))).by, "packaging/N9", "failed", /from presence/);

    const empty = `console.log("0 passed");\nconsole.log(${JSON.stringify(summary("kaal-fixture", { exit: 0, executed: 0, passed: 0 }))});\n`;
    expect((await conform(conforming({ files: { "test/verify.mjs": empty } }))).by, "packaging/N9", "failed", /no case ran/);

    // A verification whose cases call the module: verified, for exactly that, and no more.
    expect((await conform(conforming())).by, "packaging/N9", "verified", /no longer reports verified .*Whether its assertions are adequate is its owner's/);
    expect((await conform(conforming(), { work: null })).by, "packaging/N9", "unknown", /no working directory/);
  });

  it("packaging/T25 N10: every cited ID exists in its owner's plan, and no Testing term is restated", async () => {
    const { references } = await suite();
    const testing = { "testing/requirements.md": "- **testing/F13**: Results.\n- **testing/F14**: Evidence.\n" };
    expect({ x: references("- **packaging/F10**: It reports Testing's result (testing/F13–F14).\n", testing) }, "x", "verified");
    expect({ x: references("- **packaging/F10**: It reports testing/F99.\n", testing) }, "x", "failed", /testing\/F99 does not exist/);
    expect({ x: references("- **packaging/F10**: `unknown` means the run could not decide.\n", testing) }, "x", "failed", /defines "unknown" itself/);
    expect({ x: references("- **packaging/F12**: Its meaning is hosting/F26's.\n", testing) }, "x", "unknown", /hosting\/F26/);

    // Packaging's own Requirements, against Packaging's own plan: every Packaging ID they cite
    // exists. Other owners' IDs exist on those owners' branches, which a caller passes as `plans`
    // (engineering/C5); here they are unresolved, never verified.
    const plan = join(PACKAGE, "plan");
    const own = {};
    for (const path of walk(plan)) if (path.endsWith(".md")) own[path] = readFileSync(join(plan, path), "utf8");
    const result = references(own["package/requirements.md"], own);
    assert.equal(result.result, "unknown", result.cause);
    assert.doesNotMatch(result.cause, /packaging\//);
  });

  it("packaging/T26 F14: the source workspace declares its Test Plan, with the Embedded verification, and npm test follows it", async () => {
    const { conformSource } = await suite();
    const source = (scripts) => {
      const dir = fresh("workspace");
      writeAll(dir, conforming({ pkg: { scripts } }));
      return conformSource(dir, { env: ENV, npm: NPM });
    };
    const plan = { "test:consumer": "node test/verify.mjs", "test:publisher": "node -e \"\"" };
    expect({ x: await source({ ...plan, test: "npm run test:publisher && npm run test:consumer" }) }, "x", "verified", /test:publisher, test:consumer/);
    expect({ x: await source({ ...plan, test: "node test/verify.mjs" }) }, "x", "verified", /runs test:consumer/);
    expect({ x: await source({ ...plan, test: "node elsewhere.mjs" }) }, "x", "unknown", /does not state which declared suites/);
    expect({ x: await source({ ...plan, test: "npm run test:all" }) }, "x", "failed", /test:all, which the Test Plan does not declare/);
    expect({ x: await source({ "test:publisher": plan["test:publisher"], test: "npm run test:publisher" }) }, "x", "failed", /omits the Embedded verification/);
    expect({ x: await source({ test: "node test/verify.mjs" }) }, "x", "failed", /declares no Test Plan/);
  });

  it("packaging/A7: a conforming package is verified as a whole, and the package's own result is reported beside it", async () => {
    const { report } = await conform(conforming());
    assert.equal(report.result, "verified", JSON.stringify(report.findings.filter((f) => f.result !== "verified")));
    assert.deepEqual(report.package.name, "kaal-fixture");
    assert.deepEqual(report.reported, { result: "verified", exit: 0, causes: [] });
    assert.deepEqual(
      report.findings.map((f) => f.requirement),
      ["packaging/F7", "packaging/F8", "packaging/F9", "packaging/F10", "packaging/F11", "packaging/F12", "packaging/F13", "packaging/N7", "packaging/N8", "packaging/N9"],
    );
  });
});
