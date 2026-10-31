// foundation/C3 planned outer tests: publication readiness to Guard's consumer bar, revised by
// foundation/C6 to run npm with no platform decision. Immutable to DO and CHECK; foundation/C4 turns
// them GREEN. Each title names the contracts it checks
// (plan/publication/*.md). They read the package as it is packed and installed.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NAME = "@kaihacksai/kaal-foundation";
const manifest = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const DOCS = ["intent", "requirements", "architecture", "limitations", "operations", "testing"];
const ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";

/**
 * Runs a command, returning its status and output; never throws. npm runs as its own CLI script under
 * this Node, named by npm_execpath, which npm sets for the suite that runs these tests; any other
 * command is an executable path. No shell is chosen and no platform is consulted (foundation/C6, #668).
 * Run outside npm, there is no npm to run, and the result says so.
 */
const run = (cmd, args, cwd) => {
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false" };
  const cli = process.env.npm_execpath;
  if (cmd === "npm" && (!cli || !/\.[cm]?js$/.test(cli))) return { status: null, stdout: "", out: "npm_execpath names no npm CLI script: run these tests through npm" };
  const r = cmd === "npm" ? spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env }) : spawnSync(cmd, args, { cwd, encoding: "utf8", env });
  return { status: r.status, stdout: r.stdout ?? "", out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};
const last = (r) => r.stdout.trim().split(/\r?\n/).pop() ?? "";

/** Every file under a directory, as sorted relative POSIX paths. */
const listed = (root) => {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else out.push(path.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  walk(root);
  return out.sort();
};

/** The files a docs/operations.md lists under "Shipped files". */
const documented = (operations) => {
  const section = /^## Shipped files\s*\n+```text\n([\s\S]*?)\n```/m.exec(operations);
  assert.ok(section, "docs/operations.md has a Shipped files section with a text block");
  return section[1].split("\n").map((l) => l.trim()).filter(Boolean).sort();
};

describe("Foundation publication readiness (foundation/C3)", () => {
  it("foundation/T9 [foundation/F4, foundation/N2, foundation/N6]: the package is publishable, keeps its name and version, and declares no dependencies", () => {
    const m = manifest();
    assert.notEqual(m.private, true, "the package is private, so it cannot be published");
    assert.equal(m.name, NAME);
    assert.equal(m.version, "0.0.1");
    for (const kind of ["dependencies", "peerDependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies"])
      assert.equal(Object.keys(m[kind] ?? {}).length, 0, `the package declares no ${kind}`);
  });

  it("foundation/T10 [foundation/F5, foundation/F8, foundation/A5, foundation/I4, foundation/I6]: packed and installed into a clean directory, the installed files are exactly the documented ones, the subpath hashes abc, and the installed npm test is verified; a wrong digest, a wrong FIPS answer, an accepted string, a broken module, a failing test, an empty test file and missing tests are never verified", { timeout: 600_000 }, () => {
    assert.equal(manifest().scripts?.test, "node test/run.mjs", "blocked before release acceptance: npm test is not the runner");
    const work = mkdtempSync(join(tmpdir(), "kaal-foundation-release-"));
    try {
      const pack = run("npm", ["pack", "--json", "--pack-destination", work], PACKAGE);
      assert.equal(pack.status, 0, pack.out);
      const tarball = join(work, JSON.parse(pack.stdout.slice(pack.stdout.indexOf("[")))[0].filename);
      const app = join(work, "consumer");
      mkdirSync(app);
      writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }));
      const install = run("npm", ["install", tarball], app);
      assert.equal(install.status, 0, install.out);
      const installed = join(app, "node_modules", "@kaihacksai", "kaal-foundation");
      assert.deepEqual(listed(installed), documented(readFileSync(join(installed, "docs", "operations.md"), "utf8")), "the installed files are exactly the documented ones");
      const use = run(process.execPath, ["--input-type=module", "-e", `import { sha256 } from "${NAME}/sha256"; console.log(sha256(new TextEncoder().encode("abc")));`], app);
      assert.equal(use.status, 0, use.out);
      assert.equal(use.stdout.trim(), ABC);

      const verify = () => run("npm", ["test"], installed);
      const ok = verify();
      assert.equal(ok.status, 0, ok.out);
      assert.match(last(ok), /\bverified\b/, ok.out);
      assert.doesNotMatch(ok.out, /test:publisher/, "the installed npm test never starts the publisher suite");

      const lib = join(installed, "lib", "sha256.mjs");
      const original = readFileSync(lib);
      const swap = (source, expect, why) => {
        writeFileSync(lib, source);
        const r = verify();
        writeFileSync(lib, original);
        assert.equal(r.status, expect, `${why}: ${r.out}`);
        assert.doesNotMatch(last(r), /^\W*verified\b/, `${why} is never verified`);
      };
      swap('export function sha256(bytes) { if (!(bytes instanceof Uint8Array)) throw new TypeError("bytes"); return "0".repeat(64); }\n', 1, "a module with wrong digests fails the known-answer vectors");
      renameSync(lib, join(installed, "lib", "real.mjs"));
      try {
        swap('import { sha256 as real } from "./real.mjs";\nexport function sha256(bytes) { return real(typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes); }\n', 1, "a module that accepts a string fails the refusals");
        swap('import { sha256 as real } from "./real.mjs";\nexport function sha256(bytes) { const d = real(bytes); return bytes.length === 0 || bytes.length === 112 ? "0".repeat(64) : d; }\n', 1, "a module wrong only on the FIPS empty and 896-bit messages fails the known-answer vectors");
      } finally {
        renameSync(join(installed, "lib", "real.mjs"), lib);
      }
      writeFileSync(lib, "throw new Error('corrupted');\n");
      const broken = verify();
      writeFileSync(lib, original);
      assert.notEqual(broken.status, 0, `a module that cannot be imported does not pass: ${broken.out}`);
      assert.doesNotMatch(last(broken), /^\W*verified\b/);

      const delivered = readdirSync(join(installed, "test", "consumer")).filter((f) => f.endsWith(".test.mjs")).map((f) => join(installed, "test", "consumer", f));
      assert.ok(delivered.length > 0, "at least one delivered test file ships");
      const kept = delivered.map((path) => [path, readFileSync(path)]);
      writeFileSync(delivered[0], 'import { it } from "node:test";\nit("fails on purpose", () => { throw new Error("deliberate"); });\n');
      const failing = verify();
      for (const [path] of kept) writeFileSync(path, 'import "node:test";\n');
      const empty = verify();
      for (const [path, bytes] of kept) writeFileSync(path, bytes);
      assert.equal(failing.status, 1, `a failing delivered test gives failed: ${failing.out}`);
      assert.match(last(failing), /\bfailed\b/);
      assert.equal(empty.status, 2, `delivered files that declare no test give cannot verify: ${empty.out}`);
      assert.match(last(empty), /cannot verify/);
      rmSync(join(installed, "test", "consumer"), { recursive: true, force: true });
      const none = verify();
      assert.equal(none.status, 2, `missing delivered tests give cannot verify: ${none.out}`);
      assert.match(last(none), /cannot verify/);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  });

  it("foundation/T11 [foundation/F6]: the README gives the install command, links each delivered document, does not call the package private or unpublished, and keeps the provisional ownership statement", () => {
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.ok(readme.includes(`npm install ${NAME}`), "the README gives the install command");
    for (const d of DOCS) assert.ok(readme.includes(`docs/${d}.md`), `the README links docs/${d}.md`);
    assert.doesNotMatch(readme, /\bnot published\b|\bis private\b|\bunpublished\b/i, "the README does not call the package private or unpublished");
    assert.match(readme, /provisional/i, "the README keeps the provisional ownership statement (foundation/N4)");
  });

  it("foundation/T12 [foundation/F7]: the six documents ship, link only shipped files and no plan, and the limitations and testing documents say what they must", () => {
    const r = run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], PACKAGE);
    assert.equal(r.status, 0, r.out);
    const shipped = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path);
    for (const d of DOCS) assert.ok(shipped.includes(`docs/${d}.md`), `docs/${d}.md ships`);
    for (const d of DOCS) {
      const text = readFileSync(join(PACKAGE, "docs", `${d}.md`), "utf8");
      assert.doesNotMatch(text, /(?<!test\/)\bplan\//, `docs/${d}.md names no repository plan path`);
      for (const [, target] of text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
        if (/^[a-z]+:/i.test(target)) continue;
        assert.ok(shipped.includes(posix.normalize(posix.join("docs", target))), `docs/${d}.md links ${target}, which does not ship`);
      }
    }
    const limitations = readFileSync(join(PACKAGE, "docs", "limitations.md"), "utf8");
    for (const [what, pattern] of [["text must be encoded as UTF-8 first", /UTF-8/], ["only SHA-256 is held", /SHA-256/], ["it is slower than the native hash", /slower|native/i], ["ownership is provisional", /provisional/i]])
      assert.match(limitations, pattern, `docs/limitations.md says ${what}`);
    const testing = readFileSync(join(PACKAGE, "docs", "testing.md"), "utf8");
    for (const f of shipped.filter((f) => f.startsWith("test/consumer/") && f.endsWith(".test.mjs"))) assert.ok(testing.includes(f), `docs/testing.md names ${f}`);
    assert.ok(testing.includes("test/plan/"), "docs/testing.md names the publisher's tests");
    assert.match(testing, /not (delivered|shipped)|do(es)? not ship/i, "and says they are not delivered");
  });

  it("foundation/T13 [foundation/F9, foundation/A6]: the scripts name the consumer and publisher suites and the runner, and files ships the delivered layout and no publisher test", () => {
    const { scripts = {}, files = [] } = manifest();
    assert.equal(scripts.test, "node test/run.mjs", "npm test is the runner");
    assert.equal(scripts["test:consumer"], "node test/verify.mjs", "test:consumer runs the delivered verification");
    assert.ok(/test\/plan\//.test(scripts["test:publisher"] ?? ""), "test:publisher runs the publisher's tests");
    for (const f of ["lib", "docs", "test/consumer", "test/verify.mjs", "test/run.mjs"]) assert.ok(files.includes(f), `files includes ${f}`);
    assert.ok(!files.some((f) => f === "test" || f.startsWith("test/plan") || f.startsWith("plan")), "files ships no plan and no publisher test");
  });

  it("foundation/T14 [foundation/F9, foundation/A6]: the shipped runner tells source from installed explicitly: in source it runs every declared test:<name> suite once and never test itself; installed under node_modules it runs only test:consumer; damaged, ambiguous, empty or incomplete layouts are cannot verify and run nothing; a failing suite fails it", { timeout: 300_000 }, () => {
    const runner = join(PACKAGE, "test", "run.mjs");
    assert.ok(existsSync(runner), "blocked before behavioural assertion: test/run.mjs does not exist");
    const work = mkdtempSync(join(tmpdir(), "kaal-foundation-runner-"));
    try {
      let n = 0;
      const say = (word, code = 0) => `node -e "console.log(['ran', '${word}'].join(' '));process.exit(${code})"`;
      const fixture = (scripts, { installed = false, markers = installed ? [] : ["plan", "test/plan"] } = {}) => {
        const dir = installed ? join(work, `app-${++n}`, "node_modules", "fixture") : join(work, `src-${++n}`);
        mkdirSync(join(dir, "test"), { recursive: true });
        writeFileSync(join(dir, "test", "run.mjs"), readFileSync(runner));
        for (const m of markers) mkdirSync(join(dir, m), { recursive: true });
        writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "fixture", version: "0.0.0", private: true, type: "module", scripts: { test: "node test/run.mjs", ...scripts } }));
        return run("npm", ["test"], dir);
      };
      const ran = (r) => [...r.out.matchAll(/^ran (\w+)$/gm)].map((m) => m[1]);
      const all = { "test:consumer": say("consumer"), "test:publisher": say("publisher"), "test:extra": say("extra") };

      const source = fixture(all);
      assert.equal(source.status, 0, source.out);
      assert.deepEqual(ran(source), ["consumer", "publisher", "extra"], `in source every declared suite runs once, in order, and npm test never invokes itself: ${source.out}`);
      const installed = fixture(all, { installed: true });
      assert.equal(installed.status, 0, installed.out);
      assert.deepEqual(ran(installed), ["consumer"], "installed, only test:consumer runs");
      const cannot = fixture({ ...all, "test:consumer": say("consumer", 2) }, { installed: true });
      assert.equal(cannot.status, 2, `installed, the runner exits with the consumer's result: ${cannot.out}`);
      const failing = fixture({ ...all, "test:publisher": say("publisher", 1) });
      assert.notEqual(failing.status, 0, "a failing suite fails the source npm test");
      assert.deepEqual(ran(failing), ["consumer", "publisher", "extra"], "a failing suite does not hide the suites after it");

      const refused = {
        "a damaged source checkout, missing test/plan/": fixture(all, { markers: ["plan"] }),
        "a damaged source checkout, missing plan/": fixture(all, { markers: ["test/plan"] }),
        "a damaged source checkout, missing both markers": fixture(all, { markers: [] }),
        "an installed package carrying a source marker": fixture(all, { installed: true, markers: ["test/plan"] }),
        "no declared suite": fixture({}),
        "no test:publisher in source": fixture({ "test:consumer": say("consumer") }),
        "no test:consumer in source": fixture({ "test:publisher": say("publisher") }),
        "no test:consumer installed": fixture({ "test:publisher": say("publisher") }, { installed: true }),
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
});
