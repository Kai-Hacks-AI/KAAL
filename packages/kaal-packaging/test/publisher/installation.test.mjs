// RED Cases for packaging/C26 (plan/installation-check/plan.md, #1055): the one installation check
// every package shares, packaging/T113 to T134. They fail until lib/installation.mjs exists, and they
// define its contract. They are not in test:publisher yet: run them with
//   node --test test/publisher/installation.test.mjs
// The DO makes them GREEN and wires them into test:publisher.
//
// Contract under test: await await verifyInstalled(dir, { run, resolve }) judges ONE installed package folder.
//   run      async (command, args, { cwd }) => { status, stdout, stderr }  runs the package's own self check;
//            it has the shape of Hosting's `execute` (the DO passes it as it is). Never called when the
//            installation check failed.
//   resolve  (dir, name) => version | undefined  reads the install record for a prerequisite; never fetches.
// checkShippedPayload(packed) judges the file list `npm pack` would deliver (T134).
// checkShippedPayload returns { result, findings } like the others.
//   verifier  optional { dir, version }: a separately installed verifier that must be at the exact pinned
//             version and pass its own installation check before it judges; else unknown, `verifier-untrusted`.
// verifyInstalled resolves to { result, installation, self, profile, findings, line, exitCode }:
//   result / installation / self  "verified" | "failed" | "unknown" (self may also be "not run")
//   profile   "layout" | "legacy" | undefined
//   findings  [{ kind, path }]
//   line      the one final output line `<name>-verification {json}`
//   exitCode  0 verified, 1 failed, 2 unknown
// Fixtures only. No network.
import assert from "node:assert/strict";
import { sha256 as foundationSha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const INSTALLATION = join(HERE, "..", "..", "lib", "installation.mjs");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-installation-"));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

const missing = (e) => () => assert.fail(`lib/installation.mjs does not exist yet (${e.code ?? e.message})`);
const { verifyInstalled, checkShippedPayload } = await import(INSTALLATION).catch((e) => ({
  // RED: the module does not exist yet. Every Case below then fails on this one assertion.
  verifyInstalled: missing(e),
  checkShippedPayload: missing(e),
}));

// Every KAAL SHA-256 comes from Foundation, including these fixture manifests.
const sha = (text) => foundationSha256(Buffer.from(text, "utf8"));
let made = 0;
const write = (root, rel, text = "x\n") => {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
};

/** A self check runner that prints a given line and exits with a given code. */
const runner = (status, stdout, calls = []) => async (command, args, options) => {
  calls.push({ command, args, cwd: options?.cwd });
  return { status, stdout, stderr: "" };
};
const verifiedLine = (name) => `${name}-verification ${JSON.stringify({ result: "verified", cases: 3, executed: 3 })}\n`;

/** An installed package in the layout: only dist/ and npm's fixed root files exist. */
function layout({ name = "kaal-fixture", deps = {}, extra = {}, manifest = {} } = {}) {
  const dir = join(SCRATCH, `${name}-${++made}`);
  const payload = {
    "dist/AGENTS.md": "agents\n",
    "dist/skills/fixture/SKILL.md": "skill\n",
    "dist/test/package-check/cases.md": "cases\n",
    ...extra,
  };
  write(dir, "package.json", JSON.stringify({ name, version: "0.0.1", files: ["dist"], dependencies: deps }, null, 2));
  write(dir, "LICENSE", "MIT License\n");
  write(dir, "README.md", "# fixture\n");
  for (const [rel, text] of Object.entries(payload)) write(dir, rel, text);
  // The manifest lists the delivered payload: dist/ and npm's fixed root files. It cannot list itself.
  const delivered = { ...payload, "package.json": readFileSync(join(dir, "package.json"), "utf8"), LICENSE: "MIT License\n", "README.md": "# fixture\n" };
  const files = Object.fromEntries(Object.entries(delivered).map(([rel, text]) => [rel, sha(text)]));
  write(
    dir,
    "dist/test/package-check/manifest.json",
    JSON.stringify({ files, self: { command: "node", args: ["dist/test/package-check/run.mjs"] }, ...manifest }, null, 2),
  );
  return dir;
}

/** An installed package on today's layout: test/verify.json lists files anywhere; the self check is a script. */
function legacy({ name = "kaal-old", withDist = false, scripts = { "test:embedded": "node test/verify.mjs" } } = {}) {
  const dir = join(SCRATCH, `${name}-${++made}`);
  const payload = {
    "lib/index.mjs": "export {};\n",
    "docs/intent.md": "intent\n",
    "test/verify.mjs": "// self check\n",
    ...(withDist ? { "dist/index.js": "module.exports = {};\n", "dist/cli.js": "#!/usr/bin/env node\n" } : {}),
  };
  write(dir, "package.json", JSON.stringify({ name, version: "0.0.1", scripts }, null, 2));
  write(dir, "LICENSE", "MIT License\n");
  for (const [rel, text] of Object.entries(payload)) write(dir, rel, text);
  const delivered = { ...payload, "package.json": readFileSync(join(dir, "package.json"), "utf8"), LICENSE: "MIT License\n" };
  write(dir, "test/verify.json", JSON.stringify({ files: Object.fromEntries(Object.entries(delivered).map(([r, t]) => [r, sha(t)])) }, null, 2));
  return dir;
}

const kinds = (r) => r.findings.map((f) => f.kind);
const ok = (name) => runner(0, verifiedLine(name));
const noRecord = () => undefined;

describe("packaging/C26: one installation check for every package", () => {
  it("T113 a sound fixture package: installation verified, self check verified, result verified", async () => {
    const dir = layout();
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.profile, "layout");
    assert.equal(r.installation, "verified");
    assert.equal(r.self, "verified");
    assert.equal(r.result, "verified");
    assert.equal(r.exitCode, 0);
  });

  it("T114 a changed, removed, extra and linked file are each failed and named; the manifest and node_modules are not unlisted files", async () => {
    const changed = layout();
    write(changed, "dist/AGENTS.md", "tampered\n");
    const removed = layout();
    rmSync(join(removed, "dist/AGENTS.md"));
    const extra = layout();
    write(extra, "dist/skills/fixture/sneaky.mjs");
    const linked = layout();
    rmSync(join(linked, "dist/AGENTS.md"));
    symlinkSync(join(linked, "README.md"), join(linked, "dist/AGENTS.md"));
    for (const [dir, path] of [
      [changed, "dist/AGENTS.md"],
      [removed, "dist/AGENTS.md"],
      [extra, "dist/skills/fixture/sneaky.mjs"],
      [linked, "dist/AGENTS.md"],
    ]) {
      const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
      assert.equal(r.installation, "failed");
      assert.ok(r.findings.some((f) => f.path === path), `names ${path}`);
    }
    // The two stated exceptions: the manifest itself, and package-local node_modules.
    const sound = layout();
    write(sound, "node_modules/dep/package.json", '{"name":"dep","version":"1.0.0"}');
    write(sound, "node_modules/dep/index.js");
    const r = await verifyInstalled(sound, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.installation, "verified");
  });

  it("T115 an unreadable or malformed manifest, and an unlistable folder, are unknown, never verified", async () => {
    const malformed = layout();
    write(malformed, "dist/test/package-check/manifest.json", "{ not json");
    const rm = await verifyInstalled(malformed, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(rm.installation, "unknown");
    assert.notEqual(rm.result, "verified");
    const missing = join(SCRATCH, "does-not-exist");
    const rn = await verifyInstalled(missing, { run: ok("x"), resolve: noRecord });
    assert.equal(rn.installation, "unknown");
    assert.equal(rn.exitCode, 2);
  });

  it("T116 a manifest path outside dist/, with .., absolute, or with a backslash is refused", async () => {
    for (const bad of ["../escape.txt", "/etc/passwd", "dist\\x.txt", "lib/outside.mjs", "dist/../lib/x.mjs"]) {
      const dir = layout();
      const manifest = JSON.parse(readFileSync(join(dir, "dist/test/package-check/manifest.json"), "utf8"));
      manifest.files[bad] = sha("x\n");
      write(dir, "dist/test/package-check/manifest.json", JSON.stringify(manifest));
      const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
      assert.equal(r.installation, "failed", `refuses ${bad}`);
      assert.ok(kinds(r).includes("refused-path"), `names ${bad}`);
    }
  });

  it("T117 installation failed: the self check is not run and is reported so; the result is failed", async () => {
    const dir = layout();
    write(dir, "dist/AGENTS.md", "tampered\n");
    const calls = [];
    const r = await verifyInstalled(dir, { run: runner(0, verifiedLine("kaal-fixture"), calls), resolve: noRecord });
    assert.equal(calls.length, 0, "the self check must not run");
    assert.equal(r.self, "not run");
    assert.match(r.line, /not run: installation failed/);
    assert.equal(r.result, "failed");
    assert.equal(r.exitCode, 1);
  });

  it("T118 installation unknown with a verified self check: the result is unknown, not verified", async () => {
    const dir = layout();
    write(dir, "dist/test/package-check/manifest.json", "{ not json");
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.result, "unknown");
    assert.equal(r.exitCode, 2);
  });

  it("T119 installation verified, self check failed: failed; a self check that runs zero cases is never verified", async () => {
    const failing = await verifyInstalled(layout(), { run: runner(1, `kaal-fixture-verification ${JSON.stringify({ result: "failed" })}\n`), resolve: noRecord });
    assert.equal(failing.self, "failed");
    assert.equal(failing.result, "failed");
    const zero = await verifyInstalled(layout(), {
      run: runner(0, `kaal-fixture-verification ${JSON.stringify({ result: "verified", cases: 0, executed: 0 })}\n`),
      resolve: noRecord,
    });
    assert.notEqual(zero.self, "verified");
    assert.notEqual(zero.result, "verified");
  });

  it("T120 a package that declares no self check: unknown, naming the missing declaration", async () => {
    const dir = layout();
    const manifest = JSON.parse(readFileSync(join(dir, "dist/test/package-check/manifest.json"), "utf8"));
    delete manifest.self;
    write(dir, "dist/test/package-check/manifest.json", JSON.stringify(manifest));
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.result, "unknown");
    assert.ok(kinds(r).includes("self-check-undeclared"));
  });

  it("T121 the output is exactly one final line <name>-verification {json} with the two parts and exit codes 0, 1, 2", async () => {
    const r = await verifyInstalled(layout(), { run: ok("kaal-fixture"), resolve: noRecord });
    assert.match(r.line, /^kaal-fixture-verification \{.*\}$/);
    assert.ok(!r.line.includes("\n"), "one line");
    const json = JSON.parse(r.line.slice("kaal-fixture-verification ".length));
    assert.ok("installation" in json && "self" in json && "result" in json);
    const nope = await verifyInstalled(join(SCRATCH, "nope"), { run: ok("x"), resolve: noRecord });
    assert.deepEqual([r.exitCode, nope.exitCode], [0, 2]);
  });

  it("T122 a prerequisite not at its exact version, or a range, is failed (F7 reused)", async () => {
    const wrong = layout({ deps: { "@kaihacksai/kaal-hosting": "0.0.1" } });
    const r1 = await verifyInstalled(wrong, { run: ok("kaal-fixture"), resolve: () => "0.0.2" });
    assert.equal(r1.installation, "failed");
    const range = layout({ deps: { "@kaihacksai/kaal-hosting": "^0.0.1" } });
    const r2 = await verifyInstalled(range, { run: ok("kaal-fixture"), resolve: () => "0.0.1" });
    assert.equal(r2.installation, "failed");
    const exact = layout({ deps: { "@kaihacksai/kaal-hosting": "0.0.1" } });
    const r3 = await verifyInstalled(exact, { run: ok("kaal-fixture"), resolve: () => "0.0.1" });
    assert.equal(r3.installation, "verified");
  });

  it("T123 the verifier reads no package name and judges any package the same way", async () => {
    const source = readFileSync(INSTALLATION, "utf8").replace(/\/\/.*$/gm, "");
    for (const name of ["kaal-guard", "kaal-core", "kaal-foundation", "kaal-hosting", "kaal-testing", "kaal-packaging"]) {
      assert.ok(!source.includes(name), `lib/installation.mjs must not name ${name}`);
    }
    const a = await verifyInstalled(layout({ name: "kaal-alpha" }), { run: ok("kaal-alpha"), resolve: noRecord });
    const b = await verifyInstalled(layout({ name: "kaal-beta" }), { run: ok("kaal-beta"), resolve: noRecord });
    assert.equal(a.result, b.result);
  });

  it("T124 the verifier reads the install record and installed bytes only; a run with the network refused gives the same result", async () => {
    const source = readFileSync(INSTALLATION, "utf8");
    assert.ok(!/\b(fetch|https?:\/\/|node:https?|node:net|node:dns)\b/.test(source), "no network access in lib/installation.mjs");
    const dir = layout({ deps: { dep: "1.0.0" } });
    const calls = [];
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: (d, n) => (calls.push(n), "1.0.0") });
    assert.equal(r.installation, "verified");
    assert.deepEqual(calls, ["dep"]);
  });

  it("T125 a package that imports Packaging in its own code is a boundary finding, not a pass", async () => {
    const dir = layout({ extra: { "dist/skills/fixture/scripts/own.mjs": 'import { verifyInstalled } from "@kaihacksai/kaal-packaging";\n' } });
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.ok(kinds(r).includes("imports-packaging"));
    assert.notEqual(r.result, "verified");
  });

  it("T126 the manifest generator produces the same bytes twice, and a hand-edited manifest is failed", async () => {
    const { generateManifest } = await import(INSTALLATION).catch(() => ({}));
    assert.equal(typeof generateManifest, "function", "lib/installation.mjs exports generateManifest(dir)");
    const dir = layout();
    const first = generateManifest(dir);
    const second = generateManifest(dir);
    assert.equal(first, second);
    const edited = JSON.parse(first);
    edited.files["dist/AGENTS.md"] = sha("not the file\n");
    write(dir, "dist/test/package-check/manifest.json", JSON.stringify(edited));
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.installation, "failed");
  });

  it("T127 Packaging's own installed copy passes the shared check (self-application, consistency only)", async () => {
    const dir = layout({ name: "kaal-packaging" });
    const r = await verifyInstalled(dir, { run: ok("kaal-packaging"), resolve: noRecord });
    assert.equal(r.result, "verified");
    assert.match(r.line, /consistency/i, "says it is consistency, not provenance");
  });

  it("T128 the old per-package output still parses with the new reader", async () => {
    const r = await verifyInstalled(layout(), { run: ok("kaal-fixture"), resolve: noRecord });
    const json = JSON.parse(r.line.replace(/^kaal-fixture-verification /, ""));
    assert.equal(json.result, "verified", "the old `result` field is kept");
  });

  it("T129 the consumer journey: the verifier is a separately installed, exactly pinned package that must itself pass before it judges anything", async () => {
    // The verifier is installed on its own (tools); the package under test is a different folder.
    const tools = layout({ name: "kaal-packaging" });
    const subject = layout({ name: "kaal-subject" });
    assert.notEqual(tools, subject);
    const run = ok("kaal-subject");
    const pinned = { dir: tools, version: "0.0.1" };
    // The pinned verifier is itself consistent and at the pinned exact version: it judges the subject.
    const good = await verifyInstalled(subject, { run, resolve: noRecord, verifier: pinned });
    assert.equal(good.result, "verified");
    assert.match(good.line, /^kaal-subject-verification /, "the line names the package under test, not the verifier");
    // A verifier at another version than the pin, or a range as the pin, is refused before it judges.
    for (const bad of [{ dir: tools, version: "0.0.2" }, { dir: tools, version: "^0.0.1" }]) {
      const calls = [];
      const r = await verifyInstalled(subject, { run: runner(0, verifiedLine("kaal-subject"), calls), resolve: noRecord, verifier: bad });
      assert.equal(r.result, "unknown", `refuses a verifier pinned ${bad.version}`);
      assert.ok(kinds(r).includes("verifier-untrusted"));
      assert.equal(calls.length, 0, "the subject's self check is not run");
    }
    // A tampered verifier (a changed shipped file) is refused the same way: its own installation check is failed.
    const tampered = layout({ name: "kaal-packaging" });
    write(tampered, "dist/AGENTS.md", "tampered\n");
    const rt = await verifyInstalled(subject, { run, resolve: noRecord, verifier: { dir: tampered, version: "0.0.1" } });
    assert.equal(rt.result, "unknown");
    assert.ok(kinds(rt).includes("verifier-untrusted"));
  });

  it("T130 a package's standalone self check states that the installation was not checked and never prints a combined verified", async () => {
    const standalone = readFileSync(join(HERE, "..", "verify.mjs"), "utf8");
    assert.match(standalone, /installation (was )?not checked/i, "the standalone run says so");
  });

  it("T131 Packaging applied to its own installed copy reports consistency, not provenance, and says so", async () => {
    const r = await verifyInstalled(layout({ name: "kaal-packaging" }), { run: ok("kaal-packaging"), resolve: noRecord });
    assert.match(r.line, /consistency/i);
    assert.match(r.line, /provenance/i);
  });

  it("T132 a legacy fixture is judged by the legacy profile, including one that ships compiled dist/ output; Core's real output form is adapted", async () => {
    const old = legacy();
    const coreForm = (code, verdict) => runner(code, `kaal-old-execution: {"cases":[]}\nkaal-old: ${verdict}: kaal-old@0.0.1: 2 declared, 2 executed\n`);
    const sound = await verifyInstalled(old, { run: coreForm(0, "verified"), resolve: noRecord });
    assert.equal(sound.profile, "legacy");
    assert.equal(sound.result, "verified");
    write(old, "lib/index.mjs", "export const changed = 1;\n");
    assert.equal((await verifyInstalled(old, { run: coreForm(0, "verified"), resolve: noRecord })).installation, "failed");
    // Core's shape: compiled output under dist/, no dist/test/package-check/.
    const core = legacy({ name: "kaal-core-like", withDist: true });
    const rc = await verifyInstalled(core, { run: runner(0, "kaal-core-like-execution: {}\nkaal-core-like: verified: kaal-core-like@0.0.1: 1 declared, 1 executed\n"), resolve: noRecord });
    assert.equal(rc.profile, "legacy", "a compiled dist/ is not evidence of the layout");
    assert.equal(rc.result, "verified");
    // The exit code and the printed verdict disagree: unknown, never verified.
    const mismatch = await verifyInstalled(legacy({ name: "kaal-mix" }), { run: runner(0, "kaal-mix: failed: kaal-mix@0.0.1: 1 declared, 1 executed\n"), resolve: noRecord });
    assert.equal(mismatch.result, "unknown");
    // A layout package is never judged by the legacy profile.
    assert.equal((await verifyInstalled(layout(), { run: ok("kaal-fixture"), resolve: noRecord })).profile, "layout");
  });

  it("T133 a packed-and-installed layout fixture is selected by its marker; the marker folder without its manifest is failed; neither manifest is unknown", async () => {
    const dir = layout();
    // An installed copy holds no 01-intent/ or other source folder; the marker is the manifest.
    const r = await verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.profile, "layout");
    const noManifest = layout();
    rmSync(join(noManifest, "dist/test/package-check/manifest.json"));
    const rf = await verifyInstalled(noManifest, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(rf.installation, "failed");
    const neither = join(SCRATCH, `neither-${++made}`);
    write(neither, "package.json", JSON.stringify({ name: "kaal-bare", version: "0.0.1" }));
    const rn = await verifyInstalled(neither, { run: ok("kaal-bare"), resolve: noRecord });
    assert.equal(rn.installation, "unknown");
  });

  it("T134 a checker-only public dist: the packed file list holds only the installer-side checker, its Skill, and the docs the shipped-docs list names", async () => {
    const pkg = JSON.parse(readFileSync(join(HERE, "..", "..", "package.json"), "utf8"));
    assert.deepEqual(pkg.files, ["dist"], "only dist/ is shipped");
    assert.notEqual(pkg.private, true, "Packaging 0.0.1 is public (Kai A, 5 Nov)");
    // The judgment is on the delivered file list, never on `exports`: an unexported file still ships.
    const sound = ["package.json", "LICENSE", "README.md", "dist/AGENTS.md", "dist/skills/kaal-packaging/SKILL.md", "dist/skills/kaal-packaging/scripts/installation.mjs", "dist/docs/intent/intent.md", "dist/test/package-check/manifest.json"];
    assert.equal(checkShippedPayload(sound).result, "verified");
    // Publisher-side files are refused even when nothing exports them.
    for (const bad of [
      "dist/skills/kaal-packaging/scripts/registry-match.mjs",
      "dist/skills/kaal-packaging/scripts/structure.mjs",
      "dist/skills/kaal-packaging/scripts/boundary-check.mjs",
      "dist/test/boundary-check/boundary-check.md",
      "plan/installation-check/plan.md",
      "lib/structure.mjs",
    ]) {
      const r = checkShippedPayload([...sound, bad]);
      assert.equal(r.result, "failed", `refuses ${bad}`);
      assert.ok(r.findings.some((f) => f.path === bad), `names ${bad}`);
    }
    // The real package: what `npm pack` would deliver is judged the same way.
    const out = execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: join(HERE, "..", ".."), encoding: "utf8", shell: process.platform === "win32" });
    const packed = JSON.parse(out)[0].files.map((f) => f.path);
    assert.equal(checkShippedPayload(packed).result, "verified");
  });
});
