// RED Cases for packaging/C26 (plan/installation-check/plan.md, #1055): the one installation check
// every package shares, packaging/T113 to T134. They fail until lib/installation.mjs exists, and they
// define its contract. They are not in test:publisher yet: run them with
//   node --test test/publisher/installation.test.mjs
// The DO makes them GREEN and wires them into test:publisher.
//
// Contract under test: verifyInstalled(dir, { run, resolve }) judges ONE installed package folder.
//   run      (command, args, cwd) => { code, stdout }  runs the package's own self check; supplied by the
//            caller (the DO passes Hosting's execute). Never called when the installation check failed.
//   resolve  (dir, name) => version | undefined  reads the install record for a prerequisite; never fetches.
// It returns { result, installation, self, profile, findings, line, exitCode }:
//   result / installation / self  "verified" | "failed" | "unknown" (self may also be "not run")
//   profile   "layout" | "legacy" | undefined
//   findings  [{ kind, path }]
//   line      the one final output line `<name>-verification {json}`
//   exitCode  0 verified, 1 failed, 2 unknown
// Fixtures only. No network.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const INSTALLATION = join(HERE, "..", "..", "lib", "installation.mjs");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-installation-"));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

const { verifyInstalled } = await import(INSTALLATION).catch((e) => ({
  // RED: the module does not exist yet. Every Case below then fails on this one assertion.
  verifyInstalled: () => assert.fail(`lib/installation.mjs does not exist yet (${e.code ?? e.message})`),
}));

const sha = (text) => createHash("sha256").update(text).digest("hex");
let made = 0;
const write = (root, rel, text = "x\n") => {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
};

/** A self check runner that prints a given line and exits with a given code. */
const runner = (code, stdout, calls = []) => (command, args, cwd) => {
  calls.push({ command, args, cwd });
  return { code, stdout };
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
  const files = Object.fromEntries(Object.entries(payload).map(([rel, text]) => [rel, sha(text)]));
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
  write(dir, "test/verify.json", JSON.stringify({ files: Object.fromEntries(Object.entries(payload).map(([r, t]) => [r, sha(t)])) }, null, 2));
  return dir;
}

const kinds = (r) => r.findings.map((f) => f.kind);
const ok = (name) => runner(0, verifiedLine(name));
const noRecord = () => undefined;

describe("packaging/C26: one installation check for every package", () => {
  it("T113 a sound fixture package: installation verified, self check verified, result verified", () => {
    const dir = layout();
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.profile, "layout");
    assert.equal(r.installation, "verified");
    assert.equal(r.self, "verified");
    assert.equal(r.result, "verified");
    assert.equal(r.exitCode, 0);
  });

  it("T114 a changed, removed, extra and linked file are each failed and named; the manifest and node_modules are not unlisted files", () => {
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
      const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
      assert.equal(r.installation, "failed");
      assert.ok(r.findings.some((f) => f.path === path), `names ${path}`);
    }
    // The two stated exceptions: the manifest itself, and package-local node_modules.
    const sound = layout();
    write(sound, "node_modules/dep/package.json", '{"name":"dep","version":"1.0.0"}');
    write(sound, "node_modules/dep/index.js");
    const r = verifyInstalled(sound, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.installation, "verified");
  });

  it("T115 an unreadable or malformed manifest, and an unlistable folder, are unknown, never verified", () => {
    const malformed = layout();
    write(malformed, "dist/test/package-check/manifest.json", "{ not json");
    const rm = verifyInstalled(malformed, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(rm.installation, "unknown");
    assert.notEqual(rm.result, "verified");
    const missing = join(SCRATCH, "does-not-exist");
    const rn = verifyInstalled(missing, { run: ok("x"), resolve: noRecord });
    assert.equal(rn.installation, "unknown");
    assert.equal(rn.exitCode, 2);
  });

  it("T116 a manifest path outside dist/, with .., absolute, or with a backslash is refused", () => {
    for (const bad of ["../escape.txt", "/etc/passwd", "dist\\x.txt", "lib/outside.mjs", "dist/../lib/x.mjs"]) {
      const dir = layout();
      const manifest = JSON.parse(readFileSync(join(dir, "dist/test/package-check/manifest.json"), "utf8"));
      manifest.files[bad] = sha("x\n");
      write(dir, "dist/test/package-check/manifest.json", JSON.stringify(manifest));
      const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
      assert.equal(r.installation, "failed", `refuses ${bad}`);
      assert.ok(kinds(r).includes("refused-path"), `names ${bad}`);
    }
  });

  it("T117 installation failed: the self check is not run and is reported so; the result is failed", () => {
    const dir = layout();
    write(dir, "dist/AGENTS.md", "tampered\n");
    const calls = [];
    const r = verifyInstalled(dir, { run: runner(0, verifiedLine("kaal-fixture"), calls), resolve: noRecord });
    assert.equal(calls.length, 0, "the self check must not run");
    assert.equal(r.self, "not run");
    assert.match(r.line, /not run: installation failed/);
    assert.equal(r.result, "failed");
    assert.equal(r.exitCode, 1);
  });

  it("T118 installation unknown with a verified self check: the result is unknown, not verified", () => {
    const dir = layout();
    write(dir, "dist/test/package-check/manifest.json", "{ not json");
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.result, "unknown");
    assert.equal(r.exitCode, 2);
  });

  it("T119 installation verified, self check failed: failed; a self check that runs zero cases is never verified", () => {
    const failing = verifyInstalled(layout(), { run: runner(1, `kaal-fixture-verification ${JSON.stringify({ result: "failed" })}\n`), resolve: noRecord });
    assert.equal(failing.self, "failed");
    assert.equal(failing.result, "failed");
    const zero = verifyInstalled(layout(), {
      run: runner(0, `kaal-fixture-verification ${JSON.stringify({ result: "verified", cases: 0, executed: 0 })}\n`),
      resolve: noRecord,
    });
    assert.notEqual(zero.self, "verified");
    assert.notEqual(zero.result, "verified");
  });

  it("T120 a package that declares no self check: unknown, naming the missing declaration", () => {
    const dir = layout();
    const manifest = JSON.parse(readFileSync(join(dir, "dist/test/package-check/manifest.json"), "utf8"));
    delete manifest.self;
    write(dir, "dist/test/package-check/manifest.json", JSON.stringify(manifest));
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.result, "unknown");
    assert.ok(kinds(r).includes("self-check-undeclared"));
  });

  it("T121 the output is exactly one final line <name>-verification {json} with the two parts and exit codes 0, 1, 2", () => {
    const r = verifyInstalled(layout(), { run: ok("kaal-fixture"), resolve: noRecord });
    assert.match(r.line, /^kaal-fixture-verification \{.*\}$/);
    assert.ok(!r.line.includes("\n"), "one line");
    const json = JSON.parse(r.line.slice("kaal-fixture-verification ".length));
    assert.ok("installation" in json && "self" in json && "result" in json);
    assert.deepEqual(
      [r.exitCode, verifyInstalled(join(SCRATCH, "nope"), { run: ok("x"), resolve: noRecord }).exitCode],
      [0, 2],
    );
  });

  it("T122 a prerequisite not at its exact version, or a range, is failed (F7 reused)", () => {
    const wrong = layout({ deps: { "@kaihacksai/kaal-hosting": "0.0.1" } });
    const r1 = verifyInstalled(wrong, { run: ok("kaal-fixture"), resolve: () => "0.0.2" });
    assert.equal(r1.installation, "failed");
    const range = layout({ deps: { "@kaihacksai/kaal-hosting": "^0.0.1" } });
    const r2 = verifyInstalled(range, { run: ok("kaal-fixture"), resolve: () => "0.0.1" });
    assert.equal(r2.installation, "failed");
    const exact = layout({ deps: { "@kaihacksai/kaal-hosting": "0.0.1" } });
    const r3 = verifyInstalled(exact, { run: ok("kaal-fixture"), resolve: () => "0.0.1" });
    assert.equal(r3.installation, "verified");
  });

  it("T123 the verifier reads no package name and judges any package the same way", () => {
    const source = readFileSync(INSTALLATION, "utf8").replace(/\/\/.*$/gm, "");
    for (const name of ["kaal-guard", "kaal-core", "kaal-foundation", "kaal-hosting", "kaal-testing", "kaal-packaging"]) {
      assert.ok(!source.includes(name), `lib/installation.mjs must not name ${name}`);
    }
    const a = verifyInstalled(layout({ name: "kaal-alpha" }), { run: ok("kaal-alpha"), resolve: noRecord });
    const b = verifyInstalled(layout({ name: "kaal-beta" }), { run: ok("kaal-beta"), resolve: noRecord });
    assert.equal(a.result, b.result);
  });

  it("T124 the verifier reads the install record and installed bytes only; a run with the network refused gives the same result", () => {
    const source = readFileSync(INSTALLATION, "utf8");
    assert.ok(!/\b(fetch|https?:\/\/|node:https?|node:net|node:dns)\b/.test(source), "no network access in lib/installation.mjs");
    const dir = layout({ deps: { dep: "1.0.0" } });
    const calls = [];
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: (d, n) => (calls.push(n), "1.0.0") });
    assert.equal(r.installation, "verified");
    assert.deepEqual(calls, ["dep"]);
  });

  it("T125 a package that imports Packaging in its own code is a boundary finding, not a pass", () => {
    const dir = layout({ extra: { "dist/skills/fixture/scripts/own.mjs": 'import { verifyInstalled } from "@kaihacksai/kaal-packaging";\n' } });
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
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
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.installation, "failed");
  });

  it("T127 Packaging's own installed copy passes the shared check (self-application, consistency only)", () => {
    const dir = layout({ name: "kaal-packaging" });
    const r = verifyInstalled(dir, { run: ok("kaal-packaging"), resolve: noRecord });
    assert.equal(r.result, "verified");
    assert.match(r.line, /consistency/i, "says it is consistency, not provenance");
  });

  it("T128 the old per-package output still parses with the new reader", () => {
    const r = verifyInstalled(layout(), { run: ok("kaal-fixture"), resolve: noRecord });
    const json = JSON.parse(r.line.replace(/^kaal-fixture-verification /, ""));
    assert.equal(json.result, "verified", "the old `result` field is kept");
  });

  it("T129 the consumer journey: a verifier from an exact pinned registry version judges a separately installed package", () => {
    // The verifier is a package installed on its own; the package under test is a different folder.
    const tools = layout({ name: "kaal-packaging" });
    const subject = layout({ name: "kaal-subject" });
    assert.notEqual(tools, subject);
    const r = verifyInstalled(subject, { run: ok("kaal-subject"), resolve: noRecord });
    assert.equal(r.result, "verified");
    assert.match(r.line, /^kaal-subject-verification /, "the line names the package under test, not the verifier");
  });

  it("T130 a package's standalone self check states that the installation was not checked and never prints a combined verified", () => {
    const standalone = readFileSync(join(HERE, "..", "verify.mjs"), "utf8");
    assert.match(standalone, /installation (was )?not checked/i, "the standalone run says so");
  });

  it("T131 Packaging applied to its own installed copy reports consistency, not provenance, and says so", () => {
    const r = verifyInstalled(layout({ name: "kaal-packaging" }), { run: ok("kaal-packaging"), resolve: noRecord });
    assert.match(r.line, /consistency/i);
    assert.match(r.line, /provenance/i);
  });

  it("T132 a legacy fixture is judged by the legacy profile, including one that ships compiled dist/ output; Core's real output form is adapted", () => {
    const old = legacy();
    const coreForm = (code, verdict) => runner(code, `kaal-old-execution: {"cases":[]}\nkaal-old: ${verdict}: kaal-old@0.0.1: 2 declared, 2 executed\n`);
    const sound = verifyInstalled(old, { run: coreForm(0, "verified"), resolve: noRecord });
    assert.equal(sound.profile, "legacy");
    assert.equal(sound.result, "verified");
    write(old, "lib/index.mjs", "export const changed = 1;\n");
    assert.equal(verifyInstalled(old, { run: coreForm(0, "verified"), resolve: noRecord }).installation, "failed");
    // Core's shape: compiled output under dist/, no dist/test/package-check/.
    const core = legacy({ name: "kaal-core-like", withDist: true });
    const rc = verifyInstalled(core, { run: runner(0, "kaal-core-like-execution: {}\nkaal-core-like: verified: kaal-core-like@0.0.1: 1 declared, 1 executed\n"), resolve: noRecord });
    assert.equal(rc.profile, "legacy", "a compiled dist/ is not evidence of the layout");
    assert.equal(rc.result, "verified");
    // The exit code and the printed verdict disagree: unknown, never verified.
    const mismatch = verifyInstalled(legacy({ name: "kaal-mix" }), { run: runner(0, "kaal-mix: failed: kaal-mix@0.0.1: 1 declared, 1 executed\n"), resolve: noRecord });
    assert.equal(mismatch.result, "unknown");
    // A layout package is never judged by the legacy profile.
    assert.equal(verifyInstalled(layout(), { run: ok("kaal-fixture"), resolve: noRecord }).profile, "layout");
  });

  it("T133 a packed-and-installed layout fixture is selected by its marker; the marker folder without its manifest is failed; neither manifest is unknown", () => {
    const dir = layout();
    // An installed copy holds no 01-intent/ or other source folder; the marker is the manifest.
    const r = verifyInstalled(dir, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(r.profile, "layout");
    const noManifest = layout();
    rmSync(join(noManifest, "dist/test/package-check/manifest.json"));
    const rf = verifyInstalled(noManifest, { run: ok("kaal-fixture"), resolve: noRecord });
    assert.equal(rf.installation, "failed");
    const neither = join(SCRATCH, `neither-${++made}`);
    write(neither, "package.json", JSON.stringify({ name: "kaal-bare", version: "0.0.1" }));
    const rn = verifyInstalled(neither, { run: ok("kaal-bare"), resolve: noRecord });
    assert.equal(rn.installation, "unknown");
  });

  it("T134 a checker-only public dist: the packed tarball holds only the installer-side checker, its Skill, the shipped-docs list and the docs it names", () => {
    const pkg = JSON.parse(readFileSync(join(HERE, "..", "..", "package.json"), "utf8"));
    assert.deepEqual(pkg.files, ["dist"], "only dist/ is shipped");
    assert.notEqual(pkg.private, true, "Packaging 0.0.1 is public (Kai A, 5 Nov)");
    const shipped = [...JSON.stringify(pkg.exports ?? {}).matchAll(/"\.\/([^"]+)"/g)].map((m) => m[1]);
    for (const path of shipped) {
      assert.ok(!/registry-match|boundary-check|structure/.test(path), `${path} is publisher-side and must not ship`);
    }
  });
});
