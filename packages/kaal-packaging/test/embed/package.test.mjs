// Packaging's Embedded cases for the KAAL Package contract (docs/testing.md): packaging/C4's planned
// tests, and packaging/T29, T30, T32 and T35 (packaging/C8). Each title names, in brackets, the
// identifiers it tests. They use kaal-packaging's public interface only, and run against the copy
// they ship in, installed or in its source workspace. Every process they start goes through
// Hosting's `execute` (packaging/N11).
//
// Every case builds a fixture package, packs it with the npm the lane installed, and installs the
// tarball offline into a fresh consumer project, as a consumer would. A dependency the fixture
// declares is placed in the consumer beforehand, so the install needs no registry. Each case runs
// the conformance suite against a conforming package and against fixtures that break one
// Requirement, and checks that the suite names that Requirement and its cause.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import { execute } from "kaal-hosting";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-conformance-"));
// The scratch space is removed when the file's cases end (packaging/N7).
after(() => rmSync(SCRATCH, { recursive: true, force: true }));
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

/** npm with `args` in `cwd`, run through Hosting; its standard output, or a failed assertion naming what it printed. */
async function npm(args, cwd) {
  const r = await execute("npm", args, { cwd, env: ENV });
  assert.equal(r.status, 0, `npm ${args.join(" ")} exited ${r.status}: ${r.stderr}`);
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
 * hold it. Returns the installed package's directory and the consumer's.
 */
async function install(files, { deps = {}, tamper = {}, around = {}, lock } = {}) {
  const source = fresh("source");
  writeAll(source, files);
  const out = fresh("packed");
  const tgz = JSON.parse(await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", out], source))[0].filename;
  const consumer = fresh("consumer");
  writeAll(consumer, { "package.json": JSON.stringify({ name: "consumer", version: "1.0.0", private: true }) + "\n" });
  writeAll(consumer, around);
  for (const [dep, version] of Object.entries(deps)) writeAll(join(consumer, "node_modules", dep), { "package.json": JSON.stringify({ name: dep, version }) });
  await npm(["install", join(out, tgz), "--ignore-scripts", "--no-save", "--no-package-lock"], consumer);
  const name = JSON.parse(files["package.json"]).name;
  const dir = join(consumer, "node_modules", name);
  writeAll(dir, tamper);
  if (lock === null) rmSync(join(consumer, "node_modules", ".package-lock.json"), { force: true });
  else if (lock !== undefined) writeAll(consumer, { "node_modules/.package-lock.json": JSON.stringify({ name: "consumer", lockfileVersion: 3, requires: true, packages: { "": { name: "consumer" }, [`node_modules/${name}`]: { version: "1.0.0" }, ...lock } }, null, 2) });
  return { dir, consumer };
}

/** An install record entry for `name@version` fetched from the npm registry, as npm writes one. */
const fromRegistry = (name, version) => ({
  version,
  resolved: `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-${version}.tgz`,
  integrity: `sha512-${Buffer.from(`${name}@${version}`).toString("base64")}`,
});

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

/** Testing's model functions, as the caller of conform hands them in. Packaging takes no dependency on Testing (packaging/N8), so its Embedded cases use the stand-in. */
const TESTING = STAND_IN;

/** The suite's findings for an installed package, by Requirement. */
async function conform(files, options) {
  const { conform } = await suite();
  const { dir, consumer } = await install(files, options);
  const testing = options && "testing" in options ? options.testing : TESTING;
  const report = await conform(dir, { consumer, env: ENV, work: options?.work === null ? undefined : fresh("probe"), testing });
  return { report, by: Object.fromEntries(report.findings.map((f) => [f.requirement, f])), dir, consumer };
}

function expect(by, requirement, result, cause) {
  const f = by[requirement];
  assert.ok(f, `the suite reports no finding for ${requirement}`);
  assert.equal(f.result, result, `${requirement}: ${f.cause}`);
  if (cause) assert.match(f.cause, cause);
}

describe("packaging/C5 the KAAL Package conformance suite", () => {
  it("packaging/T15 [packaging/F7]: name, exact version and exact registry dependencies", async () => {
    // No false RED (packaging/F19): a dependency the install shows fetched from a registry, with integrity, verifies.
    const good = await conform(conforming({ pkg: { dependencies: { "kaal-dep": "1.2.3" } } }), { deps: { "kaal-dep": "1.2.3" }, lock: { "node_modules/kaal-dep": fromRegistry("kaal-dep", "1.2.3") } });
    expect(good.by, "packaging/F7", "verified", /kaal-dep@1\.2\.3 recorded by the install as resolved from a registry\. That is recorded resolution, not independently verified provenance \(testing\/F14\)/);

    const dep = fresh("file-dep");
    writeAll(dep, { "package.json": JSON.stringify({ name: "kaal-dep", version: "1.2.3" }) });
    const file = await conform(conforming({ pkg: { dependencies: { "kaal-dep": `file:${dep}` } } }), { deps: { "kaal-dep": "1.2.3" } });
    expect(file.by, "packaging/F7", "failed", /kaal-dep is "file:.*not one exact registry version/);

    const range = await conform(conforming({ pkg: { dependencies: { "kaal-dep": "^1.0.0" } } }), { deps: { "kaal-dep": "1.2.3" } });
    expect(range.by, "packaging/F7", "failed", /kaal-dep is "\^1\.0\.0"/);
    assert.equal(range.report.result, "failed");
  });

  it("packaging/T16 [packaging/F8]: the shipped documents are present and non-empty, and the README links docs/operations.md", async () => {
    expect((await conform(conforming())).by, "packaging/F8", "verified");
    expect((await conform(conforming({ files: { "docs/limitations.md": undefined } }))).by, "packaging/F8", "failed", /docs\/limitations\.md is not shipped/);
    expect((await conform(conforming({ files: { "docs/requirements.md": "\n" } }))).by, "packaging/F8", "failed", /docs\/requirements\.md is empty/);
    const inReadme = conforming({ files: { "docs/operations.md": undefined, "README.md": "# Fixture\n\n## Operations\n\nnpm test\n" } });
    const f = (await conform(inReadme)).by["packaging/F8"];
    assert.equal(f.result, "failed");
    assert.match(f.cause, /docs\/operations\.md is not shipped/);
    assert.match(f.cause, /README\.md does not link docs\/operations\.md/);
  });

  it("packaging/T17 [packaging/F9, packaging/N9]: the installed npm test executes the Embedded verification against the installed copy", async () => {
    const good = await conform(conforming());
    expect(good.by, "packaging/F9", "verified", /installed copy/);
    expect(good.by, "packaging/N9", "verified", /depends on their behaviour/);

    // Installed inside a checkout, a relative import of the checkout resolves and the run succeeds.
    // It still does not run against the installed copy alone.
    // The import is assembled, so that this file's own text names no path outside its package (packaging/F9 on Packaging itself).
    const checkout = `import { add as fromCheckout } from ${JSON.stringify(`${"../".repeat(3)}packages/kaal-fixture/lib/add.mjs`)};\nfromCheckout(1, 1);\n${verifier("kaal-fixture", 3)}`;
    const around = { "packages/kaal-fixture/lib/add.mjs": "export const add = (a, b) => a + b;\n" };
    const reach = await conform(conforming({ files: { "test/verify.mjs": checkout } }), { around });
    expect(reach.by, "packaging/F10", "verified");
    expect(reach.by, "packaging/F9", "failed", /test\/verify\.mjs imports \.\.\/\.\.\/\.\.\/packages/);

    const publisher = conforming({ pkg: { scripts: { test: "node --test test/plan/add.test.mjs" } } });
    expect((await conform(publisher)).by, "packaging/F9", "failed", /reported no result/);
  });

  it("packaging/T18 [packaging/F10]: the entrypoint's line carries a result consistent with its exit and cases", async () => {
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

  it("packaging/T19 [packaging/F11]: a changed installed file, and a declared case missing, run twice or replaced, are reported, never verified", async () => {
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

  it("packaging/T20 [packaging/F12]: the runtime and platforms are declared", async () => {
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

  it("packaging/T21 [packaging/F13]: the traces a package ships are Testing's model, Case tests Target, and they resolve", async () => {
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
    const ran = await execute(process.execPath, ["--input-type=module", "-e", probe], { cwd: PACKAGE });
    const out = ran.stdout.trim().split(/\r?\n/).at(-1);
    assert.deepEqual(JSON.parse(out), ["verified", "unknown"]);
  });

  it("packaging/T22 [packaging/N7]: the consumer's project is byte-identical after verification", async () => {
    const good = await conform(conforming());
    expect(good.by, "packaging/N7", "verified");
    const cache = `import { writeFileSync } from "node:fs";\nwriteFileSync(new URL("../../../.fixture-cache", import.meta.url), "x");\n${verifier("kaal-fixture", 3)}`;
    const r = await conform(conforming({ files: { "test/verify.mjs": cache } }));
    expect(r.by, "packaging/N7", "failed", /changed the consumer: \.fixture-cache/);
    assert.ok(existsSync(join(r.consumer, ".fixture-cache")));
  });

  it("packaging/T23 [packaging/N8]: the installed verification needs only its declared runtime dependencies", async () => {
    expect((await conform(conforming())).by, "packaging/N8", "verified");
    // Assembled, so that this file's own text imports nothing undeclared (packaging/N8 on Packaging itself).
    const testing = `import ${JSON.stringify("kaal-testing/verify")};\n${verifier("kaal-fixture", 3)}`;
    const r = await conform(conforming({ files: { "test/verify.mjs": testing } }));
    expect(r.by, "packaging/N8", "failed", /test\/verify\.mjs imports kaal-testing/);
    assert.equal(r.report.result, "failed");
  });

  it("packaging/T24 [packaging/N9]: a verification that passes on presence, whatever the package does, is detected; a count never certifies behaviour", async () => {
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

  it("packaging/T25 [packaging/N10]: every cited ID exists in its owner's plan, and no Testing term is restated", async () => {
    const { references } = await suite();
    const testing = { "testing/requirements.md": "- **testing/F13**: Results.\n- **testing/F14**: Evidence.\n" };
    expect({ x: references("- **packaging/F10**: It reports Testing's result (testing/F13–F14).\n", testing) }, "x", "verified");
    expect({ x: references("- **packaging/F10**: It reports testing/F99.\n", testing) }, "x", "failed", /testing\/F99 does not exist/);
    expect({ x: references("- **packaging/F10**: `unknown` means the run could not decide.\n", testing) }, "x", "failed", /defines "unknown" itself/);
    expect({ x: references("- **packaging/F12**: Its meaning is hosting/F26's.\n", testing) }, "x", "unknown", /hosting\/F26/);

    // Packaging's own shipped Requirements, against its own shipped documents: every Packaging ID
    // they cite exists. Other owners' IDs exist on those owners' branches, which a caller passes as
    // `plans` (engineering/C5); here they are unresolved, never verified.
    const docs = join(PACKAGE, "docs");
    const own = {};
    for (const path of walk(docs)) if (path.endsWith(".md")) own[path] = readFileSync(join(docs, path), "utf8");
    const result = references(own["requirements.md"], own);
    assert.equal(result.result, "unknown", result.cause);
    assert.doesNotMatch(result.cause, /packaging\//);
  });

  it("packaging/T26 [packaging/F14]: the source workspace declares its Test Plan, with the Embedded verification, and npm test follows it", async () => {
    const { conformSource } = await suite();
    const source = (scripts) => {
      const dir = fresh("workspace");
      writeAll(dir, conforming({ pkg: { scripts } }));
      return conformSource(dir, { env: ENV });
    };
    const plan = { "test:consumer": "node test/verify.mjs", "test:publisher": "node -e \"\"" };
    expect({ x: await source({ ...plan, test: "npm run test:publisher && npm run test:consumer" }) }, "x", "verified", /test:publisher, test:consumer/);
    expect({ x: await source({ ...plan, test: "node test/verify.mjs" }) }, "x", "verified", /runs test:consumer/);
    expect({ x: await source({ ...plan, test: "node elsewhere.mjs" }) }, "x", "unknown", /does not state which declared suites/);
    expect({ x: await source({ ...plan, test: "npm run test:all" }) }, "x", "failed", /test:all, which the Test Plan does not declare/);
    expect({ x: await source({ "test:publisher": plan["test:publisher"], test: "npm run test:publisher" }) }, "x", "failed", /omits the Embedded verification/);
    expect({ x: await source({ test: "node test/verify.mjs" }) }, "x", "failed", /declares no Test Plan/);
  });

  it("packaging/T35 [packaging/A7]: a conforming package is verified as a whole, and the package's own result is reported beside it", async () => {
    const { report } = await conform(conforming());
    assert.equal(report.result, "verified", JSON.stringify(report.findings.filter((f) => f.result !== "verified")));
    assert.deepEqual(report.package.name, "kaal-fixture");
    assert.deepEqual(report.reported, { result: "verified", exit: 0, causes: [] });
    assert.deepEqual(
      report.findings.map((f) => f.requirement),
      ["packaging/F7", "packaging/F8", "packaging/F9", "packaging/F10", "packaging/F11", "packaging/F12", "packaging/F13", "packaging/N7", "packaging/N8", "packaging/N9"],
    );
  });

  it("packaging/T32 [packaging/F19, packaging/F7, packaging/A14]: F7 verifies a dependency the install shows resolved from a registry with integrity, fails a file:, link or other resolution, and is unknown where the install records nothing", async () => {
    const pinned = conforming({ pkg: { dependencies: { "kaal-dep": "1.2.3" } } });
    const deps = { "kaal-dep": "1.2.3" };
    const f7 = async (lock) => (await conform(pinned, { deps, lock }))["by"]["packaging/F7"];
    const check = (f, result, cause) => {
      assert.equal(f.result, result, f.cause);
      assert.match(f.cause, cause);
    };
    check(await f7({ "node_modules/kaal-dep": fromRegistry("kaal-dep", "1.2.3") }), "verified", /resolved from a registry/);
    // Placed by path, which F7 verified on syntax alone before packaging/F19: npm records it with no resolution.
    check(await f7(undefined), "unknown", /records kaal-dep with no resolved location/);
    check(await f7(null), "unknown", /no install record/);
    check(await f7({}), "unknown", /records no resolution for kaal-dep/);
    check(await f7({ "node_modules/kaal-dep": { version: "1.2.3", resolved: "file:../kaal-dep-1.2.3.tgz", integrity: "sha512-x" } }), "failed", /kaal-dep resolved from .file:\.\.\/kaal-dep-1\.2\.3\.tgz., not from a registry/); // quotes as `.`, so the text is not read as an import
    check(await f7({ "node_modules/kaal-dep": { resolved: "../kaal-dep", link: true } }), "failed", /kaal-dep is linked to "\.\.\/kaal-dep", not installed from a registry/);
    check(await f7({ "node_modules/kaal-dep": { version: "1.2.3", resolved: "git+ssh://git@example.com/kaal-dep.git#abc" } }), "failed", /not from a registry/);
    check(await f7({ "node_modules/kaal-dep": { ...fromRegistry("kaal-dep", "1.2.3"), integrity: undefined } }), "unknown", /no integrity recorded/);
    check(await f7({ "node_modules/kaal-dep": fromRegistry("kaal-dep", "1.2.4") }), "failed", /installed at "1\.2\.4", not 1\.2\.3/);
    // Resolved as Node resolves: a nested copy is the one the package loads.
    const nested = { "node_modules/kaal-dep": fromRegistry("kaal-dep", "1.2.3"), "node_modules/kaal-fixture/node_modules/kaal-dep": { version: "1.2.3", resolved: "file:../elsewhere", integrity: "sha512-x" } };
    check(await f7(nested), "failed", /elsewhere/);
    // A package with no runtime dependency needs no install record.
    expect((await conform(conforming())).by, "packaging/F7", "verified", /^kaal-fixture@1\.0\.0$/);
  });

  it("packaging/T29 [packaging/F16, packaging/N12, packaging/F13]: kaal-packaging measure and conform print what the functions return, end on one result line, exit 0, 1 or 2 by the result, and judge packaging/F13 only with Testing's model functions given through --testing", async () => {
    const bin = join(PACKAGE, "bin", "kaal-packaging.mjs");
    const run = (...args) => execute(process.execPath, [bin, ...args], { cwd: fresh("cwd"), env: ENV });
    const { measure, read, report } = await import("kaal-packaging");
    const { conform: decide, resultLine } = await suite();

    // measure: the record of packaging/F4, or the text report, exactly as the functions give them.
    const fixture = join(PACKAGE, "test", "embed", "fixtures", "kaal-guard-0.0.4.tgz");
    const m = await measure(fixture, { work: fresh("work") });
    const json = await run("measure", fixture);
    assert.equal(json.status, 0, json.stderr);
    assert.deepEqual(read(json.stdout.trim()), m);
    const text = await run("measure", fixture, "--format", "text", "--work", fresh("work"));
    assert.equal(text.status, 0, text.stderr);
    assert.equal(text.stdout.trim(), report(m, { format: "text" }).trim());
    const refused = await run("measure", join(fresh("missing"), "a.zip"));
    assert.equal(refused.status, 2);
    assert.match(refused.stderr, /format is zip/);

    // conform: one line per finding, then one result line in Testing's form, and the exit by the result.
    const decided = async (files, { testing } = {}) => {
      const { dir, consumer } = await install(files);
      const cli = await run("conform", dir, "--consumer", consumer, ...(testing ? ["--testing", testing.module] : []));
      const fn = await decide(dir, { consumer, env: ENV, work: fresh("probe"), testing: testing?.functions });
      const parsed = resultLine(cli.stdout);
      assert.equal(parsed.error, undefined, cli.stdout + cli.stderr);
      assert.equal(parsed.result, fn.result, cli.stdout);
      assert.equal(cli.status, { verified: 0, failed: 1, unknown: 2 }[fn.result], cli.stdout + cli.stderr);
      const lines = cli.stdout.trim().split(/\r?\n/).slice(0, -1).filter((l) => !l.startsWith("note: "));
      assert.deepEqual(lines.map((l) => l.split(": ").slice(0, 2).join(": ")), fn.findings.map((f) => `${f.result}: ${f.requirement}`));
      return { parsed, fn, cli };
    };
    // Foundation's form, with no identifier and no model, so nothing waits on Testing's model functions.
    const plain = { manifest: { model: undefined }, files: { "docs/requirements.md": "# Requirements\n\nIt adds.\n" } };
    const ok = await decided(conforming(plain));
    assert.equal(ok.parsed.result, "verified", ok.cli.stdout);
    const failed = await decided(conforming({ ...plain, pkg: { engines: undefined } }));
    assert.equal(failed.parsed.result, "failed");
    assert.ok(failed.parsed.causes.some((c) => /packaging\/F12 failed/.test(c)), failed.cli.stdout);
    const unknown = await decided(conforming({ manifest: null, files: plain.files }));
    assert.equal(unknown.parsed.result, "unknown");
    // A package that ships a Testing model: without Testing's model functions the command does not
    // judge packaging/F13, and says its run is not a complete judgement; given them through
    // --testing, a module file the caller provides, it judges F13 as the library does.
    const unjudged = await decided(conforming());
    assert.equal(unjudged.parsed.result, "unknown");
    assert.match(unjudged.cli.stdout, /^note: packaging\/F13 was not judged: no Testing model functions were given\..*not a complete conformance judgement\.$/m);
    const shim = join(fresh("testing"), "testing.mjs");
    writeFileSync(shim, `export const check = ${STAND_IN.check.toString().replace(/^check/, "function")};\nexport const tested = ${STAND_IN.tested.toString().replace(/^tested/, "function")};\n`);
    const judged = await decided(conforming(), { testing: { module: shim, functions: STAND_IN } });
    assert.equal(judged.parsed.result, "verified", judged.cli.stdout);
    assert.doesNotMatch(judged.cli.stdout, /^note: /m);
    const noFunctions = join(fresh("testing"), "empty.mjs");
    writeFileSync(noFunctions, "export const check = 1;\n");
    // --json prints the function's report itself.
    const { dir, consumer } = await install(conforming(plain));
    const asJson = await run("conform", dir, "--consumer", consumer, "--json");
    const body = asJson.stdout.trim().split(/\r?\n/).slice(0, -1).join("\n");
    assert.deepEqual(JSON.parse(body).findings.map((f) => f.result), ok.fn.findings.map((f) => f.result));
    // Misuse is refused, cannot run: 2.
    for (const args of [[], ["nope"], ["conform"], ["conform", dir, "--frobnicate"], ["measure", fixture, "--format", "xml"], ["conform", dir, "--testing", noFunctions], ["conform", dir, "--testing", join(fresh("missing"), "none.mjs")]]) {
      const r = await run(...args);
      assert.equal(r.status, 2, `${args.join(" ")}: ${r.stdout}${r.stderr}`);
      assert.match(r.stderr, /usage:/);
    }
  });

  it("packaging/T30 [packaging/F17]: the shipped skill is in the shared skill format, names both commands, and cites only Packaging IDs that exist and other owners' IDs as references, restating no Testing term", async () => {
    const { references } = await suite();
    const skill = readFileSync(join(PACKAGE, "skills", "kaal-packaging", "SKILL.md"), "utf8");
    const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(skill);
    assert.ok(front, "the skill opens with frontmatter");
    assert.match(front[1], /^name: kaal-packaging$/m);
    assert.match(front[1], /^description: \S.{40,}$/m);
    for (const command of ["bin/kaal-packaging.mjs measure", "bin/kaal-packaging.mjs conform", "--testing"]) assert.ok(skill.includes(command), `the skill names ${command}`);
    const docs = join(PACKAGE, "docs");
    const own = {};
    for (const path of walk(docs)) if (path.endsWith(".md")) own[path] = readFileSync(join(docs, path), "utf8");
    const r = references(skill, own);
    assert.notEqual(r.result, "failed", r.cause);
    if (r.result === "unknown") assert.doesNotMatch(r.cause, /packaging\//, "every Packaging ID the skill cites exists");
    // No false GREEN: a skill that restates a Testing term is refused.
    assert.equal(references(`${skill}\n\`unknown\` means the suite could not decide.\n`, own).result, "failed");
  });
});
