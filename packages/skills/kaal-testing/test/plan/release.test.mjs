// testing/C35 planned outer tests: kaal-testing 0.0.1 as a KAAL Package to Packaging's generic contract
// (packaging/F7–F14, #658). Immutable to DO and CHECK; testing/C36–testing/C38 turn them GREEN. Each title names
// the contracts it checks (plan/release/*.md). They read the package's source workspace and its packed and
// installed copy only, and judge the installed verification with Testing's own shared contract (testing/C29).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix, relative, sep } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../..", import.meta.url));
const REPO = join(PACKAGE, "..", "..", "..");
const NAME = "@kaihacksai/kaal-testing";
const HOSTING = "@kaihacksai/kaal-hosting";
const DOCS = ["intent", "requirements", "architecture", "testing", "limitations", "operations"].map((d) => `docs/${d}.md`);
const VERIFIER = { prefix: "kaal-testing-verification ", words: { verified: "verified", failed: "failed", unknown: "unknown" } };
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const text = (path) => readFileSync(path, "utf8");
/** Every file under `dir`, relative to it with forward slashes, skipping `skip` directory names. */
function files(dir, skip = ["node_modules"]) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!skip.includes(e.name)) walk(join(d, e.name)); }
      else out.push(relative(dir, join(d, e.name)).split(sep).join("/"));
    }
  };
  walk(dir);
  return out.sort();
}
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
/** The suites the test entry names, one `kaal-testing-suite <script>` line each, when asked with `--list`. */
const suites = (stdout) => stdout.split(/\r?\n/).filter((l) => l.startsWith("kaal-testing-suite ")).map((l) => l.slice("kaal-testing-suite ".length).trim()).sort();
/** Every file of `dir` with its SHA-256, the installed packages included. */
const snapshot = (dir) => Object.fromEntries(files(dir, []).map((p) => [p, sha256(readFileSync(join(dir, p)))]));

describe("kaal-testing 0.0.1 as a KAAL Package (testing/C35)", () => {
  it("testing/T74 [testing/F59]: the package states its scoped name, its version, public access and exact registry dependencies, and no importer uses its old name", async () => {
    const pkg = json(join(PACKAGE, "package.json"));
    assert.equal(pkg.name, NAME);
    assert.equal(pkg.version, "0.0.1");
    assert.equal(pkg.publishConfig?.access, "public");
    assert.equal(pkg.repository?.directory, "packages/skills/kaal-testing");
    assert.deepEqual(pkg.dependencies, { c8: "12.0.0", [HOSTING]: "0.0.1" }, "the runtime dependencies are exact, and Hosting is named as it publishes");
    for (const v of Object.values({ ...pkg.dependencies, ...pkg.devDependencies })) assert.match(v, /^\d+\.\d+\.\d+$/, `${v} is an exact version, not a workspace, file or Git dependency`);
    const r = await execute("git", ["grep", "-l", "-E", "[\"'`]kaal-testing(/[a-z.]+)?[\"'`]", "--", "*.mjs", "*.js", "*.ts", "*.json"], { cwd: REPO });
    assert.equal(r.stdout.trim(), "", "no module specifier, dependency or workspace entry names kaal-testing by its old name");
  });

  it("testing/T75 [testing/F60]: the package ships its six documents; they cite no plan, Change or repository path as authority, and the README links each", async () => {
    const packed = JSON.parse((await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE })).stdout)[0].files.map((f) => f.path);
    for (const d of [...DOCS, "README.md"]) assert.ok(packed.includes(d), `${d} is in the packed package`);
    const local = (from, target) => posix.normalize(posix.join(posix.dirname(from), target));
    for (const d of DOCS) {
      const body = text(join(PACKAGE, d));
      assert.doesNotMatch(body, /\bplan\/|\btesting\/C\d+|\bengineering\/|github\.com\/[^)\s]*\/pull\//, `${d} cites no plan, Change, Engineering path or pull request`);
      for (const [, target] of body.matchAll(/\]\(([^)#\s]+)/g)) if (!/^https?:/.test(target)) assert.ok(packed.includes(local(d, target)), `${d} links ${target}, which is packed`);
    }
    const readme = text(join(PACKAGE, "README.md"));
    for (const d of DOCS) assert.ok(readme.includes(`](${d})`), `the README links ${d}`);
    assert.match(text(join(PACKAGE, "docs/operations.md")), /^## Shipped files$/m, "Operations lists the shipped files");
  });

  it("testing/T76 [testing/F61, testing/F64, testing/F65, testing/F66]: the shipped manifest gives every other shipped file's SHA-256, the delivered cases as a model that checks clean and traces each to identifiers the documents define, every supported platform, and no platform-scoped applicability", async () => {
    const { check, tested } = await import(`${NAME}/model`);
    const manifest = json(join(PACKAGE, "test/verify.json"));
    const listed = (await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE })).stdout;
    const shipped = JSON.parse(listed)[0].files.map((f) => f.path).filter((p) => p !== "test/verify.json").sort();
    assert.deepEqual(Object.keys(manifest.hashes).sort(), shipped, "the manifest hashes exactly the other shipped files");
    for (const p of shipped) assert.equal(manifest.hashes[p], sha256(readFileSync(join(PACKAGE, p))), `${p}'s hash`);
    assert.ok(Array.isArray(manifest.cases) && manifest.cases.length > 0 && new Set(manifest.cases).size === manifest.cases.length, "the delivered cases are named, once each");
    const delivered = shipped.filter((p) => /^test\/(acceptance|unit)\/.+\.test\.mjs$/.test(p)).map((p) => text(join(PACKAGE, p))).join("\n");
    for (const c of manifest.cases) assert.ok(delivered.includes(c), `${c} is a delivered case`);
    assert.deepEqual([...manifest.platforms].sort(), ["darwin", "linux", "win32"], "Linux, macOS and Windows are supported");
    assert.equal(json(join(PACKAGE, "package.json")).engines?.node, ">=24");
    assert.deepEqual(check(manifest.model), [], "the delivered cases form a model with no finding");
    const modelled = (manifest.model.cases ?? []).filter((c) => !c.retired);
    assert.deepEqual(modelled.map((c) => c.id).sort(), [...manifest.cases].sort(), "the model's Cases are exactly the delivered cases");
    for (const c of modelled) assert.ok(Array.isArray(c.tests) && c.tests.length > 0, `${c.id} names what it tests`);
    const identifiers = new Set(DOCS.flatMap((d) => [...text(join(PACKAGE, d)).matchAll(/\*\*(testing\/[IFNA]\d+)\*\*/g)].map((m) => m[1])));
    for (const target of Object.keys(tested(manifest.model))) assert.ok(identifiers.has(target), `${target}, which a delivered case tests, is defined in the documents`);
    assert.equal(Object.hasOwn(manifest, "coverage"), false, "no coverage map stands beside the model: evidence is derived from it");
    for (const [c, a] of Object.entries(manifest.applicability ?? {})) {
      assert.ok(manifest.cases.includes(c) && typeof a.reason === "string" && a.reason.length > 0, `${c}'s applicability is a declared case's, with a reason`);
      assert.equal(Object.hasOwn(a, "platforms"), false, `${c} is not scoped by platform: only Hosting owns OS-specific behaviour`);
      assert.ok([a.requires, a.absent].some((l) => Array.isArray(l) && l.length > 0), `${c}'s applicability names an optional complement`);
    }
  });

  it("testing/T77 [testing/F62]: in the source workspace npm test runs every declared suite, the publisher's and the consumer's; nothing it needs runs in an installation", async () => {
    const { scripts } = json(join(PACKAGE, "package.json"));
    assert.ok(scripts["test:publisher"] && scripts["test:consumer"], "the source Test Plan declares the publisher's and the consumer's suites");
    assert.equal(scripts.pretest, undefined, "no pretest step runs before the installed verification");
    assert.match(scripts["test:consumer"], /test\/verify\.mjs/, "the consumer suite is the installed verification");
    assert.doesNotMatch(scripts.test, /npm (run )?test(\s|$)/, "npm test never invokes itself");
    const plan = await execute("npm", ["test", "--", "--list"], { cwd: PACKAGE });
    assert.equal(plan.status, 0, plan.stderr);
    const declared = Object.keys(scripts).filter((k) => /^test:[a-z][a-z0-9-]*$/.test(k)).sort();
    assert.deepEqual(suites(plan.stdout), declared, "in the source workspace the entry runs every declared test:<name> suite");
  });

  it("testing/T78 [testing/F59, testing/F61, testing/F63, testing/F64, testing/N12]: packed and installed alone in a fresh consumer, npm test there verifies the installed copy and conforms to the shared verifier contract's clean scenario", async () => {
    const { observe, judge } = await import(`${NAME}/verifiers`);
    const out = mkdtempSync(join(tmpdir(), "kaal-testing-pack-"));
    const tarballs = [];
    for (const dir of [PACKAGE, join(REPO, "packages/extensions/kaal-hosting")]) {
      const r = await execute("npm", ["pack", "--json", "--pack-destination", out], { cwd: dir });
      assert.equal(r.status, 0, r.stderr);
      tarballs.push(join(out, JSON.parse(r.stdout)[0].filename));
    }
    const shipped = JSON.parse((await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE })).stdout)[0].files.map((f) => f.path);
    for (const p of shipped) assert.doesNotMatch(p, /^(plan\/|test\/plan\/|evidence\.kaal\.json$|ownership\.kaal\.json$)/, `${p} is the publisher's and does not ship`);
    const consumer = mkdtempSync(join(tmpdir(), "kaal-testing-consumer-"));
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }));
    const install = await execute("npm", ["install", "--no-audit", "--no-fund", ...tarballs], { cwd: consumer });
    assert.equal(install.status, 0, install.stderr);
    const location = realpathSync(join(consumer, "node_modules", ...NAME.split("/")));
    const listed = await execute("npm", ["explore", NAME, "--", "npm", "test", "--", "--list"], { cwd: consumer });
    assert.deepEqual(suites(listed.stdout), ["test:consumer"], "in an installation the entry runs the consumer verification only");
    const before = snapshot(consumer);
    const run = await execute("npm", ["explore", NAME, "--", "npm", "test"], { cwd: consumer });
    assert.deepEqual(snapshot(consumer), before, "the verification leaves the whole consumer, its installed packages included, as it was");
    const manifest = json(join(location, "test/verify.json"));
    const lines = files(location).filter((p) => p !== "test/verify.json").map((p) => `${p}\0${sha256(readFileSync(join(location, p)))}\n`);
    const facts = {
      package: { name: NAME, version: "0.0.1", location },
      platform: process.platform,
      node: process.version,
      digest: sha256(lines.join("")),
      cases: manifest.cases,
      applicability: manifest.applicability ?? {},
      dependencies: Object.keys(json(join(location, "package.json")).dependencies),
      complements: {},
    };
    const j = judge("clean", observe({ exit: run.status, stdout: run.stdout }, VERIFIER), facts);
    assert.deepEqual(j.differences, [], run.stdout + run.stderr);
  });

  it("testing/T79 [testing/F65, testing/N12, testing/N13]: the installed verification imports only Node's built-ins, so a broken library cannot mask itself; no delivered case reads this repository; and no shipped file branches on the operating system", async () => {
    const entry = text(join(PACKAGE, "test/verify.mjs"));
    for (const m of entry.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']/g)) assert.match(m[1] ?? m[2], /^node:/, `the verification imports ${m[1] ?? m[2]}`);
    for (const p of files(join(PACKAGE, "test")).filter((x) => /^(acceptance|unit)\//.test(x))) {
      const body = text(join(PACKAGE, "test", p));
      assert.doesNotMatch(body, /\.\.\/\.\.\/\.\.|\bplan\/|packages\/|engineering\//, `test/${p} reads only the installed package`);
    }
    const packed = JSON.parse((await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE })).stdout)[0].files.map((f) => f.path);
    for (const p of packed.filter((x) => /\.(mjs|cjs|js)$/.test(x))) {
      assert.doesNotMatch(text(join(PACKAGE, p)), /["'`](win32|darwin|linux)["'`]|\bos\.platform\(|\bplatform\(\)|node:os["']/, `${p} names no operating system: OS-specific behaviour is Hosting's`);
    }
  });
});
