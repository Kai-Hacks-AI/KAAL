// core/C28 planned outer tests: kaal-core 0.0.1 Release and Consumer Readiness. Immutable to DO and
// CHECK; core/C29 turns them GREEN. Each title names the contracts it checks (plan/release/*.md).
// They read the package as it is packed and installed, never the repository's plans.
// Revised by core/C37: commands run through kaal-hosting, KAAL's only OS boundary (core/F88).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "@kaihacksai/kaal-hosting";
import { inspect } from "@kaihacksai/kaal-hosting/conformance";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const KAAL = resolve(CORE, "..", "..");
const pkg = () => JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const DOCS = ["intent", "requirements", "architecture", "limitations", "operations", "testing"];
const LOOPS = ["intent", "requirements", "architecture"];
const doc = (name) => {
  const path = join(CORE, "docs", `${name}.md`);
  assert.ok(existsSync(path), `docs/${name}.md ships (core/F69)`);
  return readFileSync(path, "utf8");
};

/** Runs a command through Hosting, returning its status and output; never throws. A command that cannot start has no status. */
const run = async (cmd, args, cwd) => {
  try {
    const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
    return { status: r.status, stdout: r.stdout, out: `${r.stdout}${r.stderr}` };
  } catch (e) {
    return { status: null, stdout: "", out: String(e?.message ?? e) };
  }
};

/**
 * A directory for fixture packages under the workspace's node_modules, so a shipped script copied into a fixture
 * resolves kaal-hosting and Foundation as it would in an installation (core/A44).
 */
const fixtures = (prefix) => {
  const root = join(KAAL, "node_modules", ".kaal-core-fixtures");
  mkdirSync(root, { recursive: true });
  return mkdtempSync(join(root, prefix));
};

/** The files `npm pack` would ship for a workspace directory. */
const packed = async (dir) => {
  const r = await run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], dir);
  assert.equal(r.status, 0, r.out);
  return JSON.parse(r.stdout.slice(r.stdout.indexOf("["))).flatMap((p) => p.files.map((f) => f.path)).sort();
};

/** Every file under a directory, as sorted relative POSIX paths. */
const listed = (root) => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else out.push(path.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(root);
  return out.sort();
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

describe("kaal-core 0.0.1 release and consumer readiness (core/C28)", () => {
  it("core/T74 [core/F69, core/N19, core/A33]: the package ships Intent, Requirements, Architecture, limitations, operations and testing documents, the README links each, none sends a consumer to a file that does not ship, and the limitations name what 0.0.1 leaves out", async () => {
    const files = await packed(CORE);
    const readme = readFileSync(join(CORE, "README.md"), "utf8");
    for (const name of DOCS) {
      doc(name);
      assert.ok(files.includes(`docs/${name}.md`), `docs/${name}.md is in the packed file list`);
      assert.ok(readme.includes(`docs/${name}.md`), `the README links docs/${name}.md`);
    }
    for (const name of [...DOCS.map((n) => `docs/${n}.md`), "README.md"]) {
      const text = readFileSync(join(CORE, name), "utf8");
      for (const [, target] of text.matchAll(/\]\((?!https?:|#)([^)#\s]+)/g)) {
        const path = join(dirname(join(CORE, name)), target).slice(CORE.length + 1).replaceAll("\\", "/");
        assert.ok(files.some((f) => f === path || f.startsWith(`${path}/`)), `${name} links ${target}, which ships`);
      }
      assert.doesNotMatch(text, /\bplan\/[a-z]/, `${name} sends no consumer to a repository plan`);
    }
    const limits = doc("limitations").toLowerCase();
    for (const left of ["align", "relationship", "complement"]) assert.ok(limits.includes(left), `docs/limitations.md names what 0.0.1 leaves out: ${left}`);
  });

  it("core/T75 [core/F70, core/F71, core/F75, core/A33, core/A34]: the consumer and publisher suites are named, npm test is the shipped runner, the runner, verifier and delivered loops ship, and docs/testing.md names every delivered test file and the publisher's tests as not delivered", async () => {
    const { scripts = {}, files = [] } = pkg();
    assert.equal(scripts["test:consumer"], "node test/verify.mjs", "test:consumer runs the delivered verification");
    assert.ok(scripts["test:publisher"], "the publisher's tests are a suite of their own");
    assert.equal(scripts.test, "node test/run.mjs", "npm test is the runner");
    for (const f of ["docs", "test/embed", "test/verify.mjs", "test/run.mjs"]) assert.ok(files.includes(f), `files includes ${f}`);
    const shipped = (await packed(CORE)).filter((f) => f.startsWith("test/"));
    for (const loop of LOOPS) assert.ok(shipped.includes(`test/embed/${loop}.test.mjs`), `the ${loop} loop ships`);
    assert.ok(shipped.includes("test/embed/code.test.mjs"), "the Code loop ships");
    assert.ok(!shipped.some((f) => f.startsWith("test/plan/")), "the planned outer tests are the publisher's and do not ship");
    const testing = doc("testing");
    for (const f of shipped.filter((f) => f.endsWith(".test.mjs"))) assert.ok(testing.includes(f), `docs/testing.md names ${f}`);
    assert.ok(testing.includes("test/plan/"), "docs/testing.md names the publisher's planned tests");
    assert.match(testing, /not (delivered|shipped)|do(es)? not ship/i, "and says they are not delivered");
  });

  // Revised by core/C36: the shipped manifest replaces the operations document's file list, and a changed delivered test file is cannot verify (core/F72).
  it("core/T76 [core/F72, core/F70, core/F85, core/A35, core/I23]: packed and installed into a clean directory, kaal-core's installed files are exactly those its manifest lists and `npm test` ends in verified; a corrupted file is never verified, and changing or emptying any one loop's delivered tests, or removing them all, gives cannot verify", { timeout: 600_000 }, async () => {
    assert.equal(pkg().scripts?.["test:consumer"], "node test/verify.mjs", "blocked before release acceptance: no consumer suite");
    assert.equal(pkg().scripts?.test, "node test/run.mjs", "blocked before release acceptance: npm test is not the runner");
    const work = mkdtempSync(join(tmpdir(), "kaal-core-release-"));
    try {
      const tarballs = [];
      for (const dir of [CORE, ...runtime().values()]) {
        const r = await run("npm", ["pack", "--json", "--pack-destination", work], dir);
        assert.equal(r.status, 0, r.out);
        tarballs.push(join(work, JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].filename));
      }
      const app = join(work, "consumer");
      mkdirSync(app);
      writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }));
      const install = await run("npm", ["install", ...tarballs], app);
      assert.equal(install.status, 0, install.out);
      const installed = join(app, "node_modules", ...pkg().name.split("/"));
      const shipped = listed(installed);
      const manifest = JSON.parse(readFileSync(join(installed, "test", "verify.json"), "utf8"));
      assert.deepEqual(shipped, [...Object.keys(manifest.files), "test/verify.json"].sort(), "the installed files are exactly the manifest's, plus the manifest");
      const verify = () => run("npm", ["test"], installed);
      const ok = await verify();
      assert.equal(ok.status, 0, ok.out);
      const last = (r) => r.stdout.trim().split(/\r?\n/).pop() ?? "";
      assert.match(last(ok), /\bverified\b/, ok.out);
      assert.doesNotMatch(ok.out, /test:publisher/, "the installed npm test never starts the publisher suite");
      const index = join(installed, "dist", "index.js");
      const original = readFileSync(index);
      writeFileSync(index, "throw new Error('corrupted');\n");
      const bad = await verify();
      assert.notEqual(bad.status, 0, "a corrupted installation does not pass");
      assert.match(bad.out, /\bfailed\b|\bcannot verify\b/);
      assert.doesNotMatch(last(bad), /^\W*verified\b/, bad.out);
      writeFileSync(index, original);
      const loops = [...LOOPS, "code"].map((l) => [l, [join(installed, "test", "embed", `${l}.test.mjs`)]]);
      for (const [loop, paths] of loops) {
        const kept = paths.map((path) => [path, readFileSync(path)]);
        for (const [path] of kept) writeFileSync(path, 'import "node:test";\n');
        const empty = await verify();
        writeFileSync(kept[0][0], 'import { it } from "node:test";\nit("fails on purpose", () => { throw new Error("deliberate"); });\n');
        const failing = await verify();
        for (const [path, bytes] of kept) writeFileSync(path, bytes);
        assert.equal(empty.status, 2, `the ${loop} loop ran no test while the others passed: ${empty.out}`);
        assert.match(last(empty), /cannot verify/, `an empty ${loop} loop is never verified: ${empty.out}`);
        assert.equal(failing.status, 2, `a changed ${loop} test file no longer matches the manifest: ${failing.out}`);
        assert.match(last(failing), /cannot verify/, `a changed ${loop} test file is never verified: ${failing.out}`);
      }
      rmSync(join(installed, "test", "embed"), { recursive: true, force: true });
      const none = await verify();
      assert.equal(none.status, 2, none.out);
      assert.match(none.out, /cannot verify/, "zero delivered tests is never verified");
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it("core/T80 [core/F75, core/A34]: the shipped runner tells source from installed explicitly: in source it runs every declared test:<name> suite once and never test itself; installed under node_modules it runs only test:consumer; damaged, ambiguous, empty or incomplete layouts are cannot verify and run nothing; a failing suite fails it", { timeout: 300_000 }, async () => {
    const runner = join(CORE, "test", "run.mjs");
    assert.ok(existsSync(runner), "blocked before behavioural assertion: test/run.mjs does not exist");
    const work = fixtures("runner-");
    try {
      let n = 0;
      const say = (word, code = 0) => `node -e "console.log(['ran', '${word}'].join(' '));process.exit(${code})"`;
      /** A fixture package with the shipped runner, in a source directory or installed under node_modules, with the given source markers. */
      const fixture = (scripts, { installed = false, markers = installed ? [] : ["src", "test/plan"] } = {}) => {
        const dir = installed ? join(work, `app-${++n}`, "node_modules", "fixture") : join(work, `src-${++n}`);
        mkdirSync(join(dir, "test"), { recursive: true });
        writeFileSync(join(dir, "test", "run.mjs"), readFileSync(runner));
        for (const m of markers) mkdirSync(join(dir, m), { recursive: true });
        writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "fixture", version: "0.0.0", private: true, type: "module", scripts: { test: "node test/run.mjs", ...scripts } }));
        return run("npm", ["test"], dir);
      };
      const ran = (r) => [...r.out.matchAll(/^ran (\w+)$/gm)].map((m) => m[1]);
      const all = { "test:consumer": say("consumer"), "test:publisher": say("publisher"), "test:extra": say("extra") };

      const source = await fixture(all);
      assert.equal(source.status, 0, source.out);
      assert.deepEqual(ran(source), ["consumer", "publisher", "extra"], `in source every declared suite runs once, in order, and npm test never invokes itself: ${source.out}`);

      const installed = await fixture(all, { installed: true });
      assert.equal(installed.status, 0, installed.out);
      assert.deepEqual(ran(installed), ["consumer"], "installed, only test:consumer runs");
      const cannot = await fixture({ ...all, "test:consumer": say("consumer", 2) }, { installed: true });
      assert.equal(cannot.status, 2, `installed, the runner exits with the consumer's result: ${cannot.out}`);

      const failing = await fixture({ ...all, "test:publisher": say("publisher", 1) });
      assert.notEqual(failing.status, 0, "a failing suite fails the source npm test");
      assert.deepEqual(ran(failing), ["consumer", "publisher", "extra"], "a failing suite does not hide the suites after it");

      const refused = {
        "a damaged source checkout, missing test/plan/": await fixture(all, { markers: ["src"] }),
        "a damaged source checkout, missing src/": await fixture(all, { markers: ["test/plan"] }),
        "a damaged source checkout, missing both markers": await fixture(all, { markers: [] }),
        "an installed package carrying a source marker": await fixture(all, { installed: true, markers: ["test/plan"] }),
        "no declared suite": await fixture({}),
        "no test:publisher in source": await fixture({ "test:consumer": say("consumer") }),
        "no test:consumer in source": await fixture({ "test:publisher": say("publisher") }),
        "no test:consumer installed": await fixture({ "test:publisher": say("publisher") }, { installed: true }),
      };
      for (const [layout, r] of Object.entries(refused)) {
        assert.equal(r.status, 2, `${layout} is cannot verify: ${r.out}`);
        assert.match(r.out, /cannot verify/, `${layout} says cannot verify`);
        assert.deepEqual(ran(r), [], `${layout} runs no suite`);
      }
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  // Added by core/C36: the shipped verifier decides on the declared inventory, never on counts (core/F70, core/A43).
  it("core/T91 [core/F70, core/F85, core/F87, core/N23, core/A43]: on fixture packages, the shipped verifier gives verified only when the files match the manifest and exactly the declared cases ran and passed; a missing, skipped, todo or undeclared case, a changed or missing file, a file added to an installation, a missing manifest and an empty inventory are each cannot verify, while a source workspace's unshipped files are not added files, a declared failing case is failed, each run emits one execution record naming its candidate and each required case's outcome, each result names its candidate, evidence and cause, and the fixture is left as it was", { timeout: 300_000 }, async () => {
    const verifier = join(CORE, "test", "verify.mjs");
    assert.ok(existsSync(verifier), "blocked before behavioural assertion: no shipped test/verify.mjs");
    const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
    const PASSING = {
      "test/embed/intent.test.mjs": 'import { describe, it } from "node:test";\ndescribe("S", () => { it("a", () => {}); });\n',
      "test/embed/requirements.test.mjs": 'import { it } from "node:test";\nit("b", () => {});\n',
      "test/embed/architecture.test.mjs": 'import { it } from "node:test";\nit("c", () => {});\n',
      // A case that writes to its working directory, as a consumer's test may: the verifier must run it in a scratch directory (core/N23).
      "test/embed/code.test.mjs": 'import { writeFileSync } from "node:fs";\nimport { it } from "node:test";\nit("d", () => { writeFileSync("written-by-a-case.txt", "x"); });\n',
    };
    const DECLARED = [
      { file: "test/embed/intent.test.mjs", name: "S > a", tests: ["core/I1"] },
      { file: "test/embed/requirements.test.mjs", name: "b", tests: ["core/F1"] },
      { file: "test/embed/architecture.test.mjs", name: "c", tests: ["core/A1"] },
      { file: "test/embed/code.test.mjs", name: "d", tests: ["core/F1"] },
    ];
    const work = fixtures("verifier-");
    try {
      let n = 0;
      /** A fixture package: its files, then a manifest consistent with them unless `after` changes the files afterwards. */
      // Installed-shaped unless `source`: the verifier tells an installation by its directory sitting directly in node_modules (core/A34, core/A43).
      const fixture = ({ files = PASSING, cases = DECLARED, manifest = true, after, source = false } = {}) => {
        const dir = source ? join(work, `f${n++}`) : join(work, `f${n++}`, "node_modules", "fixture");
        const all = { "package.json": JSON.stringify({ name: "fixture", version: "1.0.0", type: "module" }), ...files };
        for (const [path, text] of Object.entries(all)) {
          mkdirSync(dirname(join(dir, path)), { recursive: true });
          writeFileSync(join(dir, path), text);
        }
        mkdirSync(join(dir, "test"), { recursive: true });
        writeFileSync(join(dir, "test", "verify.mjs"), readFileSync(verifier));
        const hashed = Object.fromEntries(listed(dir).map((path) => [path, sha(join(dir, path))]));
        if (manifest) writeFileSync(join(dir, "test", "verify.json"), JSON.stringify({ files: hashed, cases }, null, 2));
        after?.(dir);
        return dir;
      };
      const verify = async (dir) => {
        const r = await run(process.execPath, [join(dir, "test", "verify.mjs")], dir);
        const lines = r.stdout.trim().split(/\r?\n/);
        const records = lines.filter((l) => l.startsWith("kaal-core-execution: "));
        return { ...r, last: lines.pop() ?? "", record: records.length === 1 ? JSON.parse(records[0].slice("kaal-core-execution: ".length)) : undefined, records: records.length };
      };
      /** The execution record's outcome for each case, by name (core/F87). */
      const outcomes = (r) => Object.fromEntries((r.record?.cases ?? []).map((c) => [c.name, c.outcome]));
      const expect = async (dir, status, word, why, cause) => {
        const r = await verify(dir);
        assert.equal(r.status, status, `${why}: ${r.out}`);
        assert.match(r.last, new RegExp(`\\b${word}\\b`), `${why}: ${r.out}`);
        assert.match(r.last, /fixture@1\.0\.0/, `the result line names the candidate: ${r.out}`);
        assert.match(r.last, /\d+ declared, \d+ executed/, `the result line states its evidence: ${r.out}`);
        assert.equal(r.records, 1, `each run emits exactly one execution record before its result (core/F87): ${r.out}`);
        assert.deepEqual({ name: r.record.candidate?.name, version: r.record.candidate?.version }, { name: "fixture", version: "1.0.0" }, `the record names its candidate: ${r.out}`);
        if (cause) assert.ok(r.last.includes(cause), `the result line names its cause, ${cause}: ${r.out}`);
        return r;
      };

      const good = fixture();
      const before = Object.fromEntries(listed(good).map((path) => [path, sha(join(good, path))]));
      const ok = await expect(good, 0, "verified", "an intact fixture whose declared cases all pass");
      assert.match(ok.last, /4 declared, 4 executed/, ok.out);
      assert.equal(ok.record.candidate.manifest, sha(join(good, "test", "verify.json")), "the record identifies the candidate by its manifest's SHA-256");
      assert.deepEqual(outcomes(ok), { "S > a": "passed", b: "passed", c: "passed", d: "passed" }, "every required case executed successfully");
      assert.deepEqual(Object.fromEntries(listed(good).map((path) => [path, sha(join(good, path))])), before, "verification leaves the package as it was (core/N23)");

      await expect(fixture({ cases: [...DECLARED, { file: "test/embed/code.test.mjs", name: "e" }] }), 2, "cannot verify", "a declared case that never ran", "e");
      const skipped = await expect(fixture({ files: { ...PASSING, "test/embed/code.test.mjs": 'import { it } from "node:test";\nit.skip("d", () => {});\n' } }), 2, "cannot verify", "a declared case that was skipped", "d");
      assert.equal(outcomes(skipped).d, "skipped", `the record shows the case as skipped, not passed: ${skipped.out}`);
      await expect(fixture({ files: { ...PASSING, "test/embed/code.test.mjs": 'import { it } from "node:test";\nit.todo("d", () => {});\n' } }), 2, "cannot verify", "a declared case marked todo", "d");
      await expect(fixture({ files: { ...PASSING, "test/embed/code.test.mjs": 'import { it } from "node:test";\nit("d", () => {});\nit("extra", () => {});\n' } }), 2, "cannot verify", "an undeclared case that ran", "extra");
      const failing = await expect(fixture({ files: { ...PASSING, "test/embed/code.test.mjs": 'import { it } from "node:test";\nit("d", () => { throw new Error("deliberate"); });\n' } }), 1, "failed", "a declared case that failed, with the files intact", "d");
      assert.equal(outcomes(failing).d, "failed", `the record shows the failed execution: ${failing.out}`);
      const changed = await expect(fixture({ after: (dir) => writeFileSync(join(dir, "test", "embed", "code.test.mjs"), 'import { it } from "node:test";\nit("d", () => {});\n// changed\n') }), 2, "cannot verify", "a file changed after the manifest was made", "test/embed/code.test.mjs");
      assert.ok(Object.values(outcomes(changed)).every((o) => o === "not run"), `an inconsistent candidate runs no case, so its record evidences nothing about it: ${changed.out}`);
      await expect(fixture({ after: (dir) => writeFileSync(join(dir, "added.mjs"), "export {};\n") }), 2, "cannot verify", "a file the manifest does not list", "added.mjs");
      await expect(fixture({ after: (dir) => rmSync(join(dir, "test", "embed", "architecture.test.mjs")) }), 2, "cannot verify", "a file the manifest lists is missing", "test/embed/architecture.test.mjs");
      const nested = fixture({ after: (dir) => { mkdirSync(join(dir, "node_modules", "dep"), { recursive: true }); writeFileSync(join(dir, "node_modules", "dep", "index.js"), ""); } });
      await expect(nested, 0, "verified", "a nested node_modules is the consumer's, not the package's");
      const checkout = fixture({ source: true, after: (dir) => { for (const marker of ["src", "test/plan"]) { mkdirSync(join(dir, marker), { recursive: true }); writeFileSync(join(dir, marker, "unshipped.mjs"), "export {};\n"); } } });
      await expect(checkout, 0, "verified", "a source workspace holds files that do not ship, and they are not added files");
      await expect(fixture({ source: true, after: (dir) => writeFileSync(join(dir, "test", "embed", "code.test.mjs"), 'import { it } from "node:test";\nit("d", () => {});\n// changed\n') }), 2, "cannot verify", "in source too, a shipped file changed after the manifest was made", "test/embed/code.test.mjs");
      const bare = await verify(fixture({ manifest: false }));
      assert.equal(bare.status, 2, `no manifest: ${bare.out}`);
      assert.match(bare.last, /cannot verify/, `no manifest is never verified: ${bare.out}`);
      await expect(fixture({ files: {}, cases: [] }), 2, "cannot verify", "an empty inventory");
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  // Added by core/C36: declared runtime and platforms, and a manifest made from what is packed (core/F85, core/F86).
  it("core/T92 [core/F85, core/F86, core/A43]: kaal-core declares Node.js 24 or later, its operations document names Linux, macOS and Windows as supported platforms, and once built its manifest lists exactly the files npm packs, each at its SHA-256, and declares each case with the core/ subjects it tests", async () => {
    assert.equal(pkg().engines?.node, ">=24", "kaal-core declares its runtime");
    const operations = doc("operations");
    const platforms = /^## Supported platforms\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(operations);
    assert.ok(platforms, "docs/operations.md has a Supported platforms section");
    for (const host of ["Linux", "macOS", "Windows"]) assert.match(platforms[1], new RegExp(`\\b${host}\\b`), `${host} is named`);
    const path = join(CORE, "test", "verify.json");
    assert.ok(existsSync(path), "the build writes test/verify.json");
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    const files = await packed(CORE);
    assert.ok(files.includes("test/verify.json"), "the manifest ships");
    assert.deepEqual(Object.keys(manifest.files).sort(), files.filter((f) => f !== "test/verify.json"), "the manifest lists exactly the other packed files");
    for (const [file, digest] of Object.entries(manifest.files)) assert.equal(digest, createHash("sha256").update(readFileSync(join(CORE, file))).digest("hex"), `${file} is listed at its SHA-256`);
    assert.ok(Array.isArray(manifest.cases) && manifest.cases.length > 0, "the manifest declares the Embedded Test Cases");
    for (const c of manifest.cases) {
      assert.ok(files.includes(c.file) && typeof c.name === "string" && c.name.length > 0, `each declared case names a shipped file and a name: ${JSON.stringify(c)}`);
      assert.ok(Array.isArray(c.tests) && c.tests.length > 0 && c.tests.every((id) => /^core\/[IFNAD]\d+$/.test(id)), `each declared case names the core/ subjects it tests: ${JSON.stringify(c)}`);
    }
  });

  // Added by core/C37: Hosting is KAAL's only OS boundary, test implementations included (core/F88, core/A44).
  it("core/T93 [core/F88, core/A44]: Hosting's conformance inspection finds no violation in the shipped runner and verifier and leaves nothing for validation; they reach the host only through kaal-hosting and hash through Foundation, the verifier alone touching node:fs and node:os for its scratch directory; and neither decides by platform", async () => {
    const scripts = { "run.mjs": ["node:path", "node:url"], "verify.mjs": ["node:fs", "node:os", "node:path", "node:url"] };
    for (const [file, builtins] of Object.entries(scripts)) {
      const path = join(CORE, "test", file);
      assert.ok(existsSync(path), `blocked before behavioural assertion: no shipped test/${file}`);
      const bytes = readFileSync(path);
      const report = await inspect({ [file]: bytes }, { builtins });
      assert.deepEqual(report.inspected, [file], `Hosting inspects test/${file}`);
      assert.deepEqual(report.violations.map(({ line, builtin }) => `${line}: ${builtin}`), [], `test/${file} imports no host module beyond ${builtins.join(", ")}`);
      assert.deepEqual(report.validation.map(({ line, construct }) => `${line}: ${construct}`), [], `test/${file} leaves nothing for validation`);
      const outside = [...new Set(report.outside.map((o) => o.specifier))].sort();
      for (const specifier of outside) assert.ok(["@kaihacksai/kaal-foundation/sha256", "@kaihacksai/kaal-hosting"].includes(specifier), `test/${file} imports ${specifier}; only kaal-hosting and Foundation's sha256 are allowed`);
      assert.ok(outside.includes("@kaihacksai/kaal-hosting"), `test/${file} reaches the host through kaal-hosting`);
      const text = bytes.toString("utf8");
      assert.doesNotMatch(text, /\bprocess\.platform\b|\b(platform|type)\(\s*\)/, `test/${file} decides nothing by platform`);
      assert.doesNotMatch(text, /\bshell\s*:/, `test/${file} chooses no shell`);
    }
  });

  it("core/T77 [core/F68]: 0.0.1 contains registration: kaal-core/registration ships and exports assemble", async () => {
    let m;
    try {
      m = await import(`${pkg().name}/registration`);
    } catch (e) {
      assert.fail(`blocked before behavioural assertion: ${pkg().name} exports no ./registration (${e.code ?? e.message})`);
    }
    assert.equal(typeof m.assemble, "function");
    assert.ok((await packed(CORE)).some((f) => f === "dist/registration.js"), "dist/registration.js is in the packed file list");
  });

  it("core/T78 [core/F73]: every workspace package kaal-core depends on at runtime can be published", () => {
    const deps = runtime();
    assert.ok(deps.size > 0, "kaal-core's runtime dependencies are found");
    for (const [name, dir] of deps) assert.notEqual(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).private, true, `${name} is private, so a consumer cannot install it`);
  });

  it("core/T79 [core/F74]: kaal-core and every workspace package it depends on at runtime publish under the @kaihacksai/kaal-* namespace", () => {
    assert.equal(pkg().name, "@kaihacksai/kaal-core");
    const deps = runtime();
    assert.ok(deps.size > 0, "kaal-core's runtime dependencies are found");
    for (const name of deps.keys()) assert.match(name, /^@kaihacksai\/kaal-/, `${name} is not named under @kaihacksai/kaal-`);
  });
});
