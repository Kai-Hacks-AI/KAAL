// hosting/C16 planned outer tests: portability across capabilities
// (hosting/F36–hosting/F41, hosting/N6). Immutable to DO and CHECK;
// hosting/C17 turns them GREEN. Each title names the contracts it checks.
// Hosting is the operating-system boundary, so these tests, and only these,
// may name a platform. They reach Hosting through its build, its command and
// its manifest by path, never through the package name, so a rename needs no edit.
import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execute } from "../../dist/index.js";
import * as conformance from "../../dist/conformance.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SUITE = join(PACKAGE, "dist", "boundary.js");
const FIXTURES = join(PACKAGE, "dist", "fixtures.js");
const COMMAND = join(PACKAGE, "bin", "kaal-hosting-boundary.mjs");
const GUIDE = join(PACKAGE, "skills", "kaal-hosting-boundary", "HOSTS.md");
const FACTS = ["kaal-hosting/special-entries"];
const PLATFORMS = ["linux", "darwin", "win32"];
const LINK = /^https:\/\/\S+$/;

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

async function entry(path, name) {
  assert.ok(existsSync(path), `${path} is not built`);
  const module = await import(pathToFileURL(path).href);
  assert.equal(typeof module[name], "function", `${path} exports no ${name}`);
  return module[name];
}

/** hosting/F41's table: [{ fact, platform, holds, evidence }]. */
function guide() {
  assert.ok(existsSync(GUIDE), "no per-host review guide");
  const text = readFileSync(GUIDE, "utf8");
  const start = text.indexOf("<!-- kaal-hosting:hosts -->");
  const end = text.indexOf("<!-- /kaal-hosting:hosts -->");
  assert.ok(start >= 0 && end > start, "the guide declares no host table");
  return text
    .slice(start, end)
    .split(/\r?\n/)
    .map((l) => l.split("|").slice(1, -1).map((c) => c.trim().replace(/^`|`$/g, "")))
    .filter((c) => c.length === 4 && FACTS.includes(c[0]))
    .map(([fact, platform, holds, evidence]) => ({ fact, platform, holds, evidence }));
}

const capability = (tree) => {
  const root = mkdtempSync(join(tmpdir(), "kaal-portability-"));
  for (const [path, text] of Object.entries(tree)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
};

const outcomes = (result) => Object.fromEntries(result.cases.map((c) => [c.name, c.outcome]));
const problems = (result) => result.applicability.map((f) => [f.case, f.rule]).sort();
const C13 = ["inspection completes", "host modules are declared", "production code leaves the host to Hosting"];
const SCOPE = "applicability is not scoped by platform";
const WELL = "host exceptions are well-formed";

/** A portable guard/T114: registered on every host, with Hosting's fixture and no platform in sight. */
const portable = ['import { it } from "node:test";', 'it("guard/T114 special entries", () => {});', ""].join("\n");
const special = { host: ["kaal-hosting/special-entries"], reason: "the host can place no FIFO or socket in a tree", evidence: "https://github.com/Kai-Hacks-AI/KAAL/pull/650" };

describe("hosting/C16: portability across capabilities", () => {
  it("hosting/T42 [hosting/F36]: the operating-system boundary is declared by Hosting alone, and a package's own claim never makes it one", async () => {
    assert.ok(Array.isArray(conformance.OS_BOUNDARY), "kaal-hosting/conformance declares no OS_BOUNDARY");
    assert.deepEqual([...conformance.OS_BOUNDARY], ["@kaihacksai/kaal-hosting"]);
    assert.ok(Object.isFrozen(conformance.OS_BOUNDARY), "the declaration can be changed at run time");
    assert.equal(typeof conformance.osBoundary, "function", "kaal-hosting/conformance exports no osBoundary");
    assert.equal(conformance.osBoundary("@kaihacksai/kaal-hosting"), true);
    for (const name of ["kaal-hosting", "@kaihacksai/kaal-guard", "@kaihacksai/kaal-testing", "@kaihacksai/kaal-hosting-extra", ""]) assert.equal(conformance.osBoundary(name), false, name);
    for (const value of [undefined, null, true, 1, ["@kaihacksai/kaal-hosting"]]) assert.throws(() => conformance.osBoundary(value), TypeError, String(value));
  });

  it("hosting/T43 [hosting/F37, hosting/F38, hosting/F41]: each host fact is established on this host by trying it, agrees with the per-host guide, and the special-entry fixture makes a FIFO and a socket where it holds and nothing where it does not", async () => {
    const facts = await entry(FIXTURES, "facts");
    const specialEntries = await entry(FIXTURES, "specialEntries");
    const established = await facts();
    assert.deepEqual(Object.keys(established).sort(), FACTS);
    const rows = guide();
    for (const fact of FACTS) {
      const { holds, reason, evidence } = established[fact];
      assert.equal(typeof holds, "boolean", `${fact} is not established`);
      assert.ok(typeof reason === "string" && reason.length > 0, `${fact} gives no reason`);
      assert.match(evidence, LINK, `${fact} links no evidence`);
      assert.deepEqual(rows.filter((r) => r.fact === fact).map((r) => r.platform).sort(), [...PLATFORMS].sort(), `the guide does not cover ${fact} on every host`);
      for (const row of rows.filter((r) => r.fact === fact)) {
        assert.ok(["yes", "no"].includes(row.holds), `${fact} on ${row.platform}: neither yes nor no`);
        assert.match(row.evidence, LINK, `${fact} on ${row.platform} links no evidence`);
      }
      const here = rows.find((r) => r.fact === fact && r.platform === process.platform);
      if (here) assert.deepEqual([holds, evidence], [here.holds === "yes", here.evidence], `${fact} on ${process.platform} departs from the guide`);
    }

    const dir = mkdtempSync(join(tmpdir(), "kaal-special-"));
    const made = await specialEntries(dir);
    const fact = established["kaal-hosting/special-entries"];
    assert.equal(made.holds, fact.holds);
    if (made.holds) {
      assert.equal(made.fifo, join(dir, "fifo"));
      assert.equal(made.socket, join(dir, "socket"));
      assert.ok(lstatSync(made.fifo).isFIFO(), "no FIFO in the tree");
      assert.ok(lstatSync(made.socket).isSocket(), "no socket in the tree");
      await made.close();
      assert.ok(lstatSync(made.fifo).isFIFO(), "close removed the FIFO the case inspects");
    } else {
      assert.deepEqual(made, { holds: false, fact: "kaal-hosting/special-entries", reason: fact.reason, evidence: fact.evidence });
      assert.deepEqual(readdirSync(dir), [], "an unavailable fixture left entries behind");
    }
  });

  it("hosting/T47 [hosting/F38]: where the host fact holds but the fixture cannot be made in the directory asked for, specialEntries fails as a setup failure, never as holds: false, and a case using it fails rather than skipping or passing", async () => {
    const facts = await entry(FIXTURES, "facts");
    const specialEntries = await entry(FIXTURES, "specialEntries");
    const { SetupFailure } = await import(pathToFileURL(FIXTURES).href);
    const fact = (await facts())["kaal-hosting/special-entries"];
    const root = mkdtempSync(join(tmpdir(), "kaal-special-unsuitable-"));
    const file = join(root, "file");
    writeFileSync(file, "x");
    for (const dir of [join(root, "missing", "dir"), file]) {
      if (fact.holds) {
        assert.equal(typeof SetupFailure, "function", "kaal-hosting/fixtures exports no SetupFailure");
        await assert.rejects(specialEntries(dir), (e) => {
          assert.ok(e instanceof SetupFailure, `not a SetupFailure: ${e}`);
          assert.deepEqual([e.outcome, e.fact, e.dir, "holds" in e], ["unknown", "kaal-hosting/special-entries", dir, false]);
          assert.ok(e.reason.length > 0, "the setup failure gives no reason");
          return true;
        }, `${dir}: a failed fixture was not a setup failure`);
      } else {
        // A host that lacks the fact still says so, whatever the directory.
        assert.deepEqual(await specialEntries(dir), { holds: false, fact: "kaal-hosting/special-entries", reason: fact.reason, evidence: fact.evidence });
      }
    }
    assert.deepEqual(readdirSync(root), ["file"], "a failed fixture left entries behind");
    if (!fact.holds) return;
    // A case that uses the fixture in an unsuitable directory is a failure: never skipped, never GREEN.
    const script = join(mkdtempSync(join(tmpdir(), "kaal-special-driver-")), "driver.test.mjs");
    writeFileSync(script, `import { it } from "node:test";\nimport { specialEntries } from ${JSON.stringify(pathToFileURL(FIXTURES).href)};\nit("uses special entries", async () => { await specialEntries(${JSON.stringify(file)}); });\n`);
    const run = await execute(process.execPath, ["--test", "--test-reporter=tap", script], { cwd: tmpdir(), env });
    assert.notEqual(run.status, 0, "a setup failure passed");
    assert.match(run.stdout, /^# fail 1$/m);
    assert.match(run.stdout, /^# pass 0$/m);
    assert.match(run.stdout, /^# skipped 0$/m);
    assert.match(run.stdout, /SetupFailure/);
  });

  it("hosting/T44 [hosting/F39, hosting/F40]: the audit refuses applicability scoped by platform outside the boundary, refuses a host exception without a known fact, a reason, evidence or a registered case, or one that is stale, puts every host exception to review, and leaves complements alone", async () => {
    const portability = await entry(SUITE, "portability");
    const tests = { "test/guard.test.mjs": portable + 'it("guard/T7 links", () => {});\n' };

    // Scoped by platform, in the declaration and in the manifest: an architectural violation, never an exemption.
    const scoped = await portability({
      builtins: ["node:test"],
      name: "scoped",
      root: capability({ "package.json": JSON.stringify({ name: "@kaihacksai/kaal-guard", os: ["linux", "darwin"], osBoundary: true }), ...tests }),
      applicability: { "guard/T114 special entries": { platforms: ["linux", "darwin"], reason: "no FIFO on Windows" } },
    });
    assert.equal(scoped.osBoundary, false, "a package's own claim made it the boundary");
    assert.equal(scoped.result, "failed");
    assert.deepEqual(outcomes(scoped), { ...Object.fromEntries(C13.map((c) => [c, "pass"])), [SCOPE]: "fail", [WELL]: "pass" });
    assert.deepEqual(problems(scoped), [["guard/T114 special entries", "platform-applicability"], ["package.json", "platform-applicability"]]);
    assert.ok(scoped.challenged.includes("guard/T114 special entries"), "a platform-scoped case is not challenged");

    // A well-formed host exception: deterministic cases pass, and the exception is put to review.
    const declared = await portability({ builtins: ["node:test"], name: "declared", root: capability({ "package.json": JSON.stringify({ name: "@kaihacksai/kaal-guard" }), ...tests }), applicability: { "guard/T114 special entries": special, "guard/T7 links": { requires: ["kaal-graph"], reason: "needs Graph" } } });
    assert.deepEqual([declared.result, declared.review, declared.applicability], ["verified", "requested", []]);
    assert.deepEqual(outcomes(declared), { ...Object.fromEntries(C13.map((c) => [c, "pass"])), [SCOPE]: "pass", [WELL]: "pass" });
    const asked = declared.reviews.filter((r) => r.rule === "kaal-hosting/host-applicability");
    assert.equal(asked.length, 1, "a host exception is not put to review, or a complement is");
    assert.deepEqual(Object.keys(asked[0]).sort(), ["case", "declaration", "id", "owner", "question", "rule"], "the request carries an outcome or lacks a member");
    assert.deepEqual([asked[0].id, asked[0].owner, asked[0].case, asked[0].declaration], ["kaal-hosting/host-applicability@guard/T114 special entries", "Hosting", "guard/T114 special entries", special]);
    assert.ok(asked[0].question.length > 0, "the request asks nothing");
    const linked = await portability({ builtins: ["node:test"], name: "linked", root: capability({ "package.json": JSON.stringify({ name: "@kaihacksai/kaal-guard" }), ...tests }), applicability: { "guard/T114 special entries": { ...special, review: "https://github.com/Kai-Hacks-AI/KAAL/pull/577#pullrequestreview-1" } } });
    assert.equal(linked.review, "requested", "a linked judgment closed the request inside Hosting");
    assert.deepEqual(declared.challenged, [], "a well-formed exception is challenged");

    // Malformed and stale host exceptions are deterministic failures.
    const broken = await portability({
      builtins: ["node:test"],
      name: "broken",
      root: capability({ "package.json": JSON.stringify({ name: "@kaihacksai/kaal-guard" }), ...tests }),
      applicability: {
        "guard/T114 special entries": { host: ["kaal-hosting/windows"], reason: "x", evidence: special.evidence },
        "guard/T7 links": { host: special.host, reason: "", evidence: "on #650" },
        "guard/T9 gone": special,
      },
    });
    assert.equal(broken.result, "failed");
    assert.deepEqual(outcomes(broken), { ...Object.fromEntries(C13.map((c) => [c, "pass"])), [SCOPE]: "pass", [WELL]: "fail" });
    assert.deepEqual(problems(broken), [["guard/T114 special entries", "unknown-host-fact"], ["guard/T7 links", "unevidenced"], ["guard/T7 links", "unreasoned"], ["guard/T9 gone", "stale"]]);
    assert.deepEqual(broken.challenged, ["guard/T114 special entries", "guard/T7 links", "guard/T9 gone"]);

    // The boundary itself may scope by platform; that case is not applicable to it, and stays visible.
    const own = await portability({ builtins: ["node:test"], name: "hosting", root: capability({ "package.json": JSON.stringify({ name: "@kaihacksai/kaal-hosting", os: ["linux"] }), ...tests }), applicability: { "guard/T7 links": { platforms: ["linux"], reason: "Hosting's own" } } });
    assert.equal(own.osBoundary, true);
    assert.equal(outcomes(own)[SCOPE], "not applicable");
    assert.deepEqual([own.result, own.applicability], ["verified", []]);

    // The audit extends hosting/F33's result; it does not change it.
    assert.deepEqual(Object.keys(declared.summary).sort(), ["acknowledged", "coupling", "dilution", "registration", "setup"]);
    const unknown = await portability({ builtins: ["node:test"], name: "absent", root: join(tmpdir(), "kaal-no-such-capability"), applicability: {} });
    assert.equal(unknown.result, "unknown");
    assert.deepEqual([outcomes(unknown)[SCOPE], outcomes(unknown)[WELL]], ["not run", "not run"]);
  });

  it("hosting/T45 [hosting/F40, hosting/N6]: Guard's platform fixtures are each found in any capability's tests, and the cases they decide or weaken are challenged by name; a portable guard/T114 is not", async () => {
    const portability = await entry(SUITE, "portability");
    const WINDOWS = 'const WINDOWS = process.platform === "win32";\n';
    const fixtures = {
      "registration off one platform": [WINDOWS + '(WINDOWS ? () => {} : it)("guard/T0 a", () => {});\n', "registration", "guard/T0 a"],
      "a skip inside a case": ['it("guard/T0 b", (t) => {\n  if (process.platform === "win32") return t.skip("not here");\n});\n', "registration", "guard/T0 b"],
      "a todo inside a case": ['it("guard/T0 c", (t) => {\n  if (process.platform === "darwin") t.todo("later");\n});\n', "registration", "guard/T0 c"],
      "an undeclared skip option": ['it("guard/T0 d", { skip: process.platform === "darwin" }, () => {});\n', "registration", "guard/T0 d"],
      "a weakened assertion": [WINDOWS + 'it("guard/T0 e", () => {\n  if (!WINDOWS) assert.equal(mode(), 0o755);\n});\n', "dilution", "guard/T0 e"],
      "an unlisted platform reference": ['const fast = process.platform === "linux";\n', "setup", null],
      "fixture setup per platform inside a case": [WINDOWS + 'it("guard/T0 f", () => {\n  if (WINDOWS) prepare("a");\n  else prepare("b");\n  assert.equal(run(), 1);\n});\n', "setup", null],
    };
    for (const [label, [source, kind, title]] of Object.entries(fixtures)) {
      const result = await portability({ builtins: ["node:test"], name: label, root: capability({ "package.json": "{}", "test/x.test.mjs": source }), applicability: {} });
      assert.ok(result.findings.some((f) => f.kind === kind), `${label}: no ${kind} finding`);
      assert.ok(result.reviews.some((r) => r.finding?.kind === kind), `${label}: not put to review`);
      assert.deepEqual(result.challenged, title ? [title] : [], `${label}: the case it decides is not challenged by name`);
    }
    const clean = await portability({ builtins: ["node:test"], name: "portable", root: capability({ "package.json": "{}", "test/x.test.mjs": portable }), applicability: {} });
    assert.deepEqual([clean.result, clean.review, clean.findings, clean.challenged], ["verified", "none", [], []]);
  });

  it("hosting/T46 [hosting/F40, hosting/F41, hosting/F31]: the audit ships as a suite, through the command and as a fixtures entry, with a per-host guide; no shipped entry but the suite loads a test harness", async () => {
    const root = capability({ "package.json": JSON.stringify({ name: "@kaihacksai/kaal-guard" }), "test/guard.test.mjs": portable });
    const scoped = join(root, "applicability.scoped.json");
    const host = join(root, "applicability.host.json");
    writeFileSync(scoped, JSON.stringify({ "guard/T114 special entries": { platforms: ["linux"], reason: "x" } }));
    writeFileSync(host, JSON.stringify({ "guard/T114 special entries": special }));
    const line = (output) => {
      const found = output.stdout.split(/\r?\n/).map((l) => l.trim()).find((l) => l.startsWith("kaal-hosting-boundary "));
      assert.ok(found, `no kaal-hosting-boundary line\n${output.stdout}${output.stderr}`);
      return JSON.parse(found.slice("kaal-hosting-boundary ".length));
    };
    const command = (file) => execute(process.execPath, [COMMAND, "--name", "guard", "--root", root, "--builtin", "node:test", ...(file ? ["--applicability", file] : [])], { cwd: tmpdir(), env });
    const failed = await command(scoped);
    assert.equal(failed.status, 1, `${failed.stdout}${failed.stderr}`);
    assert.deepEqual(problems(line(failed)), [["guard/T114 special entries", "platform-applicability"]]);
    assert.equal((await command(host)).status, 3, "a host exception under review is not exit 3");
    const plain = await command();
    assert.equal(plain.status, 0);
    assert.equal(line(plain).applicability, undefined, "without --applicability the command no longer gives hosting/F33's result");

    const script = join(mkdtempSync(join(tmpdir(), "kaal-portability-driver-")), "driver.test.mjs");
    writeFileSync(script, `import { portabilitySuite } from ${JSON.stringify(pathToFileURL(SUITE).href)};\nportabilitySuite({ name: "guard", root: ${JSON.stringify(root)}, builtins: ["node:test"], applicability: ${JSON.stringify({ "guard/T114 special entries": special })} });\n`);
    const suite = await execute(process.execPath, [script], { cwd: tmpdir(), env });
    assert.equal(suite.status, 0, `${suite.stdout}${suite.stderr}`);
    for (const name of [...C13, SCOPE, WELL, "judgment requested"]) assert.ok(suite.stdout.includes(name), `the suite has no case "${name}"`);
    assert.match(suite.stdout, /todo 1\b/, "a host exception under review is reported as a passed case");
    assert.deepEqual(line(suite).reviews.map((r) => r.id), ["kaal-hosting/host-applicability@guard/T114 special entries"]);

    const manifest = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.equal(manifest.exports?.["./fixtures"]?.default, "./dist/fixtures.js");
    for (const path of ["dist/index.js", "dist/conformance.js", "dist/fixtures.js"]) assert.doesNotMatch(readFileSync(join(PACKAGE, path), "utf8"), /["']node:test["']/, `${path} loads node:test`);
    const text = readFileSync(GUIDE, "utf8");
    assert.match(text, /^# /m);
    for (const word of [...FACTS, ...PLATFORMS, "platform-applicability", "unknown-host-fact", "unreasoned", "unevidenced", "stale", "host-applicability", "requires", "absent", "PREACH"]) assert.ok(text.includes(word), `the guide does not cover ${word}`);
    assert.ok(readFileSync(join(PACKAGE, "skills", "kaal-hosting-boundary", "SKILL.md"), "utf8").includes("HOSTS.md"), "the Skill does not point to the per-host guide");
  });
});
