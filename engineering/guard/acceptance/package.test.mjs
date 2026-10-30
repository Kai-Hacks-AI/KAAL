// Guard outer acceptance, Engineering part: the package's own tests and its consumer verification.
// Requirements verification T98 [N6] (guard/C76, revised in guard/C98), T101–T106 [I8] (guard/C97,
// written in guard/C98), T108–T110 [F38–F40] (guard/C102, written in guard/C104) and T113–T117
// (guard/C107, written in guard/C108). Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { applicability, audit, PLAN } from "./platforms.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");
const PACKAGE = join(REPO, "packages", "kaal-guard");
const NAME = "@kaihacksai/kaal-guard";
const WINDOWS = process.platform === "win32";
const NPM = WINDOWS ? "npm.cmd" : "npm";

/** The environment a child runs in: an inherited NODE_TEST_CONTEXT makes node --test skip every file and pass, so it is never inherited. */
function clean(extra = {}) {
  const env = { ...process.env, ...extra };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

/** Runs a program; never throws, returns { status, stdout, stderr, output }. With `timeout`, a run still going then is stopped, with status null. */
function exec(cwd, file, args, env, timeout) {
  const r = spawnSync(file, args, { cwd, env, encoding: "utf8", shell: WINDOWS && file === "npm", maxBuffer: 64 * 1024 * 1024, timeout });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const must = (r, what) => (assert.equal(r.status, 0, `${what}: ${r.output}`), r);

/** Every temporary root this file makes, removed when the file ends, whether its cases pass or fail (guard/C108). */
const roots = [];
const scratch = (prefix) => {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
};
after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true, maxRetries: 5 });
});

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Every file under a directory, relative to it, with forward slashes, sorted. */
function tree(base) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(base, p).split("\\").join("/"));
    }
  };
  walk(base);
  return out.sort();
}

/** Every file under a directory with the SHA-256 of its bytes. */
const snapshot = (base) => Object.fromEntries(tree(base).map((f) => [f, sha256(readFileSync(join(base, f)))]));

let candidate;

/**
 * The candidate a consumer installs, with its source (guard/N9): `packed`, the package in this tree
 * packed now, unless GUARD_CANDIDATE=registry:<version> names a published one.
 */
function spec() {
  if (candidate) return candidate;
  const named = process.env.GUARD_CANDIDATE;
  if (named) {
    const m = /^registry:(\d+\.\d+\.\d+)$/.exec(named);
    assert.ok(m, `GUARD_CANDIDATE must be registry:<version>, not ${named}`);
    return (candidate = { source: "registry", install: `${NAME}@${m[1]}`, version: m[1], offline: false });
  }
  const out = scratch("kaal-guard-verify-pack-");
  const r = must(exec(PACKAGE, "npm", ["pack", "--pack-destination", out, "--silent"], clean()), "npm pack");
  const version = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).version;
  return (candidate = { source: "packed", install: join(out, r.stdout.trim().split(/\r?\n/).pop()), version, offline: true });
}

/**
 * An unrelated, minimal npm consumer outside the KAAL checkout: `npm init`, `git init`, one file of its
 * own and an npm configuration of its own, with a home and an npm cache of its own, and the candidate
 * installed as a development dependency.
 */
function consumer() {
  const root = scratch("kaal-guard-verify-");
  const home = join(root, "home");
  const dir = join(root, "consumer");
  mkdirSync(home);
  mkdirSync(dir);
  const env = { HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, ".config"), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(home, ".gitconfig"), npm_config_cache: join(root, "npm-cache"), npm_config_update_notifier: "false" };
  const run = (file, args, what) => must(exec(dir, file, args, clean(env)), what);
  const c = spec();
  run("npm", ["init", "-y"], "npm init");
  run("git", ["init", "-q", "-b", "main"], "git init");
  // Git's automatic maintenance would otherwise run in the background after the commit below, and its
  // lock under .git/objects/ come and go between this case's snapshots (guard/C110).
  for (const [k, v] of [["user.name", "Consumer"], ["user.email", "consumer@example.invalid"], ["commit.gpgsign", "false"], ["maintenance.auto", "false"], ["gc.auto", "0"]]) run("git", ["config", k, v], "git config");
  writeFileSync(join(dir, "own.txt"), "The consumer's own file.\n");
  writeFileSync(join(dir, ".npmrc"), "fund=false\naudit=false\n");
  writeFileSync(join(dir, ".gitignore"), "node_modules/\n");
  run("npm", ["install", "--save-dev", "--no-audit", "--no-fund", ...(c.offline ? ["--offline"] : []), c.install], `npm install ${c.install}`);
  run("git", ["add", "-A"], "git add");
  run("git", ["commit", "-q", "-m", "consumer"], "git commit");
  const installed = join(dir, "node_modules", "@kaihacksai", "kaal-guard");
  return {
    root, dir, env, installed, candidate: c,
    /** The documented invocation: `npm explore @kaihacksai/kaal-guard -- npm test`. */
    verify: (extra = {}, timeout) => exec(dir, "npm", ["explore", NAME, "--", "npm", "test"], clean({ ...env, ...extra }), timeout),
  };
}

/** The run's summary line, `kaal-guard-verification {…}`, parsed. Its absence is the evidence that the run names nothing. */
function summary(r) {
  const m = [...r.output.matchAll(/^kaal-guard-verification (\{.*\})\s*$/gm)].pop();
  assert.ok(m, `the run printed no kaal-guard-verification summary line (exit ${r.status}):\n${r.output.slice(-4000)}`);
  return JSON.parse(m[1]);
}

/**
 * The run's summary, with what was observed recorded in the test's own output, so the log of every
 * host that runs this file carries the evidence.
 */
function observed(t, label, r) {
  const s = summary(r);
  t.diagnostic(`observed on ${process.platform}, ${label}: exit ${r.status}, ${s.result}; cases ${s.cases?.declared} declared, ${s.cases?.executed} executed, ${s.cases?.passed} passed, ${s.cases?.failed} failed, ${s.cases?.skipped} skipped; consumer unchanged: ${s.consumer?.unchanged}; causes: ${JSON.stringify(s.causes)}`);
  return s;
}

/** The delivered manifest's location in the installed copy (guard/A18). */
const MANIFEST = join("test", "verify.json");

/**
 * Rewrites the installed copy's shipped manifest: `change` edits it, then the SHA-256 of every installed
 * file but the manifest is taken again, so the manifest is consistent with the copy as it now is.
 */
function rewrite(c, change) {
  const path = join(c.installed, MANIFEST);
  const manifest = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  change(manifest);
  manifest.files = Object.fromEntries(tree(c.installed).filter((f) => f !== "test/verify.json").map((f) => [f, sha256(readFileSync(join(c.installed, f)))]));
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

/**
 * Replaces the installed copy's delivered cases, outer and inner, with one small case file in one loop
 * and makes the shipped manifest consistent with that copy: it declares `cases`, that one loop, no
 * product identifier and nothing allocated, unverified or not applicable, unless `declare` says otherwise. A fixture
 * of the verification's own accounting, so a scenario does not run the whole delivered suite.
 */
function reduce(c, source, cases, declare = {}) {
  rmSync(join(c.installed, "test", "acceptance"), { recursive: true, force: true });
  rmSync(join(c.installed, "test", "unit"), { recursive: true, force: true });
  mkdirSync(join(c.installed, "test", "acceptance"), { recursive: true });
  writeFileSync(join(c.installed, "test", "acceptance", "mini.test.mjs"), source);
  rewrite(c, (manifest) => {
    Object.assign(manifest, { cases, loops: { Requirements: [MINI] }, identifiers: [], coverage: {}, allocated: {}, unverified: {}, applicability: { cases: {}, identifiers: {} } }, declare);
    delete manifest.exemptions;
  });
}

const MINI = "test/acceptance/mini.test.mjs";
const PASSING = `import { it } from "node:test";\nit("guard/T0 passes", () => {});\n`;

let full;

/** A child's temporary directory, by each name an operating system reads it under. */
const temporary = (dir) => ({ TMPDIR: dir, TEMP: dir, TMP: dir });

/**
 * What is left in a directory, by name. Node's module compile cache, which npm's own CLI turns on in the
 * temporary directory and reuses across runs, is npm's and not a leftover of the run.
 */
const left = (dir) => readdirSync(dir).filter((name) => name !== "node-compile-cache").sort();

/**
 * One consumer verified twice with the whole delivered suite, and its content before, between and after.
 * Each run has a fresh, empty temporary directory of its own, and what each leaves there is recorded.
 */
function twice() {
  if (full) return full;
  const c = consumer();
  const before = snapshot(c.dir);
  const tmp = [scratch("kaal-guard-verify-tmp-"), scratch("kaal-guard-verify-tmp-")];
  const first = c.verify(temporary(tmp[0]));
  const between = snapshot(c.dir);
  const second = c.verify(temporary(tmp[1]));
  return (full = { c, before, first, between, second, after: snapshot(c.dir), leftover: tmp.map(left) });
}

/** The paths npm packs for a package directory and the publisher material among them (guard/T116). */
function publisher(dir) {
  const paths = JSON.parse(must(exec(dir, "npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], clean()), "npm pack --dry-run").stdout)[0].files.map((f) => f.path.split("\\").join("/")).sort();
  const declared = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).files;
  const always = new Set(["package.json", "README.md", "LICENSE"]);
  const engineering = join(REPO, "engineering", "guard");
  // Engineering's plans and its acceptance cases, by content, so a copy under another name is found too.
  const plans = new Set([...tree(engineering).filter((f) => !f.includes("/") && f.endsWith(".md")), ...tree(join(engineering, "acceptance")).map((f) => `acceptance/${f}`)].map((f) => sha256(readFileSync(join(engineering, f)))));
  const material = paths.filter((p) => (!always.has(p) && !declared.some((d) => p === d || p.startsWith(`${d}/`))) || p.split("/").includes("engineering") || plans.has(sha256(readFileSync(join(dir, p)))));
  return { paths, material };
}

describe("guard/N6 [guard/I5] the package's own tests", () => {
  it("guard/T98 [guard/N6, guard/D17]: the package's own test files pass on Node 24, run from packages/kaal-guard, and none of the retired 0.0.1 suite runs; there, npm test is cannot verify, never a pass", (t) => {
    // `npm test` is the consumer's verification of the installed copy (guard/F32), so the package's own
    // tests are run by their files.
    const r = spawnSync(process.execPath, ["--test", "test/unit/*.test.mjs", "test/acceptance/*.test.mjs"], { cwd: PACKAGE, env: clean(), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    /** The last summary count node --test printed for `name` (pass or fail), in either reporter's form. */
    const count = (name) => Number([...output.matchAll(new RegExp(`^(?:ℹ|#) ${name} (\\d+)$`, "gm"))].pop()?.[1]);
    assert.ok(count("pass") > 0, `the package's tests ran no test:\n${output.slice(-4000)}`);
    // The retired suite fails on 0.0.2 by design, so a run with no failure runs none of its files.
    assert.equal(count("fail"), 0, `the package's tests failed:\n${output.slice(-4000)}`);
    assert.equal(r.status, 0, `the package's tests exited ${r.status}:\n${output.slice(-4000)}`);
    // The package's npm test is the installed copy's verification. A source checkout is not an
    // installed copy, so there it runs no case and can never report a pass.
    const own = exec(PACKAGE, "npm", ["test"], clean());
    const s = observed(t, "npm test in the source checkout", own);
    assert.equal(s.result, "cannot verify", `npm test in the source checkout gave ${s.result}`);
    assert.equal(own.status, 2, `npm test in the source checkout exited ${own.status}`);
    assert.ok(s.causes.some((x) => /not installed under a node_modules directory/.test(x)), `npm test in the source checkout names another cause: ${JSON.stringify(s.causes)}`);
  });
});

describe("guard/I8 consumer verification of the installed package", { timeout: 30 * 60 * 1000 }, () => {
  it("guard/T101 [guard/F31, guard/F32, guard/F33]: the documented command executes the delivered cases, more than zero of them, and a passing run gives verified, exit 0", (t) => {
    const { first } = twice();
    const s = observed(t, "the whole delivered suite, first run", first);
    assert.ok(s.cases.executed > 0, `the run executed no delivered case:\n${first.output.slice(-4000)}`);
    // A case declared not applicable on this platform is not run (guard/F40); every other declared case is.
    assert.equal(s.cases.executed + (s.applicability?.notApplicable?.length ?? 0), s.cases.declared, "a declared case did not execute");
    assert.equal(s.cases.passed, s.cases.executed, `a delivered case did not pass:\n${first.output.slice(-4000)}`);
    // A shipped file changed without its manifest: node engineering/guard/verify-manifest.mjs writes it again.
    assert.equal(s.result, "verified", `the result is ${s.result}: ${JSON.stringify(s.causes)}`);
    assert.equal(first.status, 0, `verified exited ${first.status}`);
    assert.match(first.output, /^verified\b/m, "the output does not name the result verified");
  });

  it("guard/T102 [guard/F34]: the output and its summary line name the package, the candidate's version, its install location and the installed files' hashes, and these equal the candidate's", (t) => {
    const { c, first } = twice();
    const s = observed(t, "the whole delivered suite, first run", first);
    t.diagnostic(`observed on ${process.platform}: ${s.package.name}@${s.package.version} at ${s.package.location}; ${Object.keys(s.files.sha256).length} files, digest ${s.files.digest}; lockfile integrity ${s.lockfile.integrity ?? `unknown (${s.lockfile.unknown})`}`);
    const location = realpathSync(c.installed);
    assert.equal(s.package.name, NAME);
    assert.equal(s.package.version, c.candidate.version, "the summary names another version than the candidate's");
    assert.equal(realpathSync(s.package.location), location, "the summary names another install location");
    const files = snapshot(c.installed);
    delete files["test/verify.json"];
    assert.deepEqual(s.files.sha256, files, "the summary's file hashes are not the installed files'");
    assert.ok(first.output.includes(`${NAME}@${c.candidate.version}`), "the output does not name the package and its version");
    assert.ok(first.output.includes(s.package.location), "the output does not name the install location");
    assert.ok(first.output.includes(s.files.digest), "the output does not name the installed files' digest");
    assert.ok("lockfile" in s && ("integrity" in s.lockfile), "the summary does not report the lockfile integrity, known or unknown");
  });

  it("guard/T103 [guard/F33, guard/F34]: one byte changed in the installed lib/runner.mjs gives cannot verify, exit 2, naming the file; a delivered case made to fail gives failed, exit 1, naming the case", (t) => {
    const changed = consumer();
    reduce(changed, PASSING, [`${MINI} > guard/T0 passes`]);
    const runner = join(changed.installed, "lib", "runner.mjs");
    const bytes = readFileSync(runner);
    bytes[bytes.length - 1] = bytes[bytes.length - 1] === 0x20 ? 0x0a : 0x20;
    writeFileSync(runner, bytes);
    const r = changed.verify();
    const s = observed(t, "one byte changed in lib/runner.mjs", r);
    assert.equal(s.result, "cannot verify", `one changed byte gave ${s.result}:\n${r.output.slice(-4000)}`);
    assert.equal(r.status, 2);
    assert.ok(s.files.mismatched.includes("lib/runner.mjs"), "the summary does not name lib/runner.mjs");
    assert.match(r.output, /lib\/runner\.mjs/, "the output does not name lib/runner.mjs");

    const failing = consumer();
    reduce(failing, `import { it } from "node:test";\nit("guard/T0 made to fail", () => { throw new Error("made to fail"); });\n`, [`${MINI} > guard/T0 made to fail`]);
    const f = failing.verify();
    const u = observed(t, "a delivered case made to fail", f);
    assert.equal(u.result, "failed", `a failing case gave ${u.result}:\n${f.output.slice(-4000)}`);
    assert.equal(f.status, 1);
    assert.deepEqual(u.cases.failures, [`${MINI} > guard/T0 made to fail`], "the summary does not name the failed case");
    assert.match(f.output, /guard\/T0 made to fail/, "the output does not name the failed case");
  });

  it("guard/T104 [guard/F33]: no git on PATH, zero cases, a skipped case and one declared case not executed each give cannot verify, exit 2, with its cause, and never failed", (t) => {
    const expect = (r, cause, what) => {
      const s = observed(t, what, r);
      assert.equal(s.result, "cannot verify", `${what} gave ${s.result}:\n${r.output.slice(-4000)}`);
      assert.equal(r.status, 2, `${what} exited ${r.status}`);
      assert.ok(s.causes.some((x) => cause.test(x)), `${what}: no cause matches ${cause}: ${JSON.stringify(s.causes)}`);
      assert.match(r.output, cause, `${what}: the output does not name the cause`);
    };

    const nogit = consumer();
    const bin = dirname(process.execPath);
    assert.ok(!existsSync(join(bin, WINDOWS ? "git.exe" : "git")), "blocked before behavioural assertion: git is installed beside node, so it cannot be taken off PATH");
    const path = Object.fromEntries(Object.keys(process.env).filter((k) => /^path$/i.test(k)).map((k) => [k, bin]));
    expect(nogit.verify({ ...path, PATH: bin, ...(WINDOWS ? {} : { npm_config_shell: "/bin/sh", npm_config_script_shell: "/bin/sh" }) }), /\bgit\b.*\bPATH\b|\bPATH\b.*\bgit\b/, "no git on PATH");

    const zero = consumer();
    reduce(zero, `// No case.\n`, []);
    expect(zero.verify(), /no case executed|zero cases/i, "zero cases");

    const skipped = consumer();
    reduce(skipped, `import { it } from "node:test";\nit("guard/T0 passes", () => {});\nit.skip("guard/T0 skipped", () => {});\n`, [`${MINI} > guard/T0 passes`, `${MINI} > guard/T0 skipped`]);
    expect(skipped.verify(), /skipped.*guard\/T0 skipped|guard\/T0 skipped.*skipped/, "a skipped case");

    const missing = consumer();
    reduce(missing, PASSING, [`${MINI} > guard/T0 passes`, `${MINI} > guard/T0 declared only`]);
    expect(missing.verify(), /not executed.*guard\/T0 declared only|guard\/T0 declared only.*not executed/, "a declared case not executed");
  });

  it("guard/T105 [guard/F35]: after a run, the consumer's working tree, .git, npm configuration and the installed package are as they were, and the output says so", (t) => {
    const { before, between, first } = twice();
    assert.deepEqual(between, before, "the run changed the consumer");
    t.diagnostic(`observed on ${process.platform}: the consumer's ${Object.keys(before).length} files, .git and the installed copy included, are byte for byte the same after the run`);
    const s = observed(t, "the whole delivered suite, first run", first);
    assert.equal(s.consumer.unchanged, true, "the summary does not say the consumer is unchanged");
    assert.match(first.output, /consumer unchanged/i, "the output does not say the consumer is unchanged");
  });

  it("guard/T106 [guard/F32, guard/F36]: a second run against the same installation gives the same result, and the output names kaal-guard verify for integration", (t) => {
    const { first, second, between, after } = twice();
    const [a, b] = [summary(first), observed(t, "the whole delivered suite, second run", second)];
    assert.equal(second.status, first.status, `the second run exited otherwise: ${JSON.stringify(b.causes)}`);
    assert.equal(b.result, a.result, "the second run gave another result");
    assert.deepEqual(b.cases, a.cases, "the second run accounted for the cases otherwise");
    assert.deepEqual(b.files, a.files, "the second run names other files");
    assert.deepEqual(after, between, "the second run changed the consumer");
    assert.match(first.output, /kaal-guard verify/, "the output does not name kaal-guard verify for integration");
  });

  it("guard/T108 [guard/F38]: a candidate in which a declared product identifier has neither a covering case nor an allocation is cannot verify, exit 2, naming the identifier; allocated to the publisher it is verified, and the output and summary line name the allocation as not verified by this run; one no Test Case verifies is named unverified", (t) => {
    const name = `${MINI} > guard/T0 [guard/F1] passes`;
    const source = `import { it } from "node:test";\nit("guard/T0 [guard/F1] passes", () => {});\n`;
    const declare = { identifiers: ["guard/F1", "guard/F2"], coverage: { "guard/F1": { Requirements: [name] } } };

    const bare = consumer();
    reduce(bare, source, [name], declare);
    const r = bare.verify();
    const s = observed(t, "guard/F2 neither covered nor allocated", r);
    assert.equal(s.result, "cannot verify", `an uncovered identifier gave ${s.result}:\n${r.output.slice(-4000)}`);
    assert.equal(r.status, 2);
    assert.deepEqual(s.coverage?.uncovered, ["guard/F2"], `the summary does not name guard/F2 uncovered: ${JSON.stringify(s.coverage)}`);
    assert.ok(s.causes.some((x) => /guard\/F2/.test(x)), `no cause names guard/F2: ${JSON.stringify(s.causes)}`);
    assert.match(r.output, /guard\/F2/, "the output does not name guard/F2");

    const allocated = consumer();
    const where = "in the publisher's release evidence";
    const why = "the publisher reviews it with each release";
    reduce(allocated, source, [name], { ...declare, identifiers: ["guard/F1", "guard/F2", "guard/F3"], allocated: { "guard/F2": where }, unverified: { "guard/F3": why } });
    const e = allocated.verify();
    const u = observed(t, "guard/F2 allocated to the publisher, guard/F3 unverified", e);
    assert.equal(u.result, "verified", `an allocated identifier gave ${u.result}: ${JSON.stringify(u.causes)}`);
    assert.equal(e.status, 0);
    // The allocation stays visibly distinct from what this run executed: never counted as covered here.
    assert.deepEqual(u.coverage.covered, ["guard/F1"], "the summary counts something other than guard/F1 as covered by this run");
    assert.deepEqual(u.coverage.allocated, [{ id: "guard/F2", where }], "the summary does not name the allocation");
    assert.deepEqual(u.coverage.unverified, [{ id: "guard/F3", why }], "the summary does not name guard/F3 unverified");
    assert.deepEqual(u.coverage.uncovered, []);
    const line = e.output.split(/\r?\n/).find((l) => l.includes("guard/F2") && l.includes(where));
    assert.ok(line, "the output does not name the allocation and where it is allocated");
    assert.match(line, /allocated/i, "the allocation's line does not say it is allocated");
    assert.match(line, /not (verified|executed) (by|in) this run/i, "the allocation's line does not say this run did not verify it");
    const unverified = e.output.split(/\r?\n/).find((l) => l.includes("guard/F3") && l.includes(why));
    assert.ok(unverified, "the output does not name guard/F3");
    assert.match(unverified, /\bunverified\b/i, "guard/F3's line does not say it is unverified");
    assert.match(unverified, /no Test Case/i, "guard/F3's line does not say no Test Case verifies it");
  });

  it("guard/T109 [guard/F39]: npm test runs the outer and the inner loop and accounts for each case under its loop; a candidate with the inner loop emptied is cannot verify, naming the loop", (t) => {
    const { first } = twice();
    const s = observed(t, "the whole delivered suite, first run", first);
    assert.equal(s.result, "verified", `the whole suite gave ${s.result}: ${JSON.stringify(s.causes)}`);
    assert.deepEqual(Object.keys(s.loops ?? {}).sort(), ["Architecture", "Code", "Intent", "Requirements"], `the summary does not account for the four loops: ${JSON.stringify(Object.keys(s.loops ?? {}))}`);
    for (const [loop, l] of Object.entries(s.loops)) {
      t.diagnostic(`observed on ${process.platform}: the ${loop} loop executed ${l.executed} of ${l.declared} cases`);
      assert.ok(l.executed > 0, `the ${loop} loop executed no case`);
      assert.equal(l.cases.length, l.declared, `the ${loop} loop does not name each of its cases`);
    }
    const named = Object.values(s.loops).flatMap((l) => l.cases);
    assert.equal(new Set(named).size, named.length, "a case is accounted for under more than one loop");
    assert.equal(named.length, s.cases.declared, "a declared case is accounted for under no loop");
    assert.ok(s.loops.Code.cases.every((n) => n.startsWith("test/unit/")), "the Code loop names a case outside test/unit/");

    const emptied = consumer();
    rmSync(join(emptied.installed, "test", "unit"), { recursive: true, force: true });
    mkdirSync(join(emptied.installed, "test", "unit"));
    rewrite(emptied, (m) => {
      m.cases = (m.cases ?? []).filter((n) => !n.startsWith("test/unit/"));
    });
    const r = emptied.verify();
    const u = observed(t, "the inner loop emptied", r);
    assert.equal(u.result, "cannot verify", `an emptied inner loop gave ${u.result}:\n${r.output.slice(-4000)}`);
    assert.equal(r.status, 2);
    assert.ok(u.causes.some((x) => /\bCode\b.*loop|loop.*\bCode\b/.test(x)), `no cause names the Code loop: ${JSON.stringify(u.causes)}`);
    assert.match(r.output, /\bCode\b.*loop|loop.*\bCode\b/, "the output does not name the Code loop");
  });

  it("guard/T110 [guard/F40]: a case that declares the current platform not applicable is reported as not applicable, named and not run, and the run can still be verified; the same case skipped without that declaration is cannot verify; an identifier only such a case covers is named as not verified here unless the contract declares it not applicable", (t) => {
    const here = process.platform;
    const passes = `${MINI} > guard/T0 passes`;
    const absent = `${MINI} > guard/T0 [guard/F3] not here`;
    const source = `import { it } from "node:test";\nit("guard/T0 passes", () => {});\nit("guard/T0 [guard/F3] not here", { skip: process.platform === ${JSON.stringify(here)} }, () => { throw new Error("ran where it does not apply"); });\n`;
    const why = "the fixture's case does not apply here";

    const declared = consumer();
    reduce(declared, source, [passes, absent], { applicability: { cases: { [absent]: { notOn: [here], why } }, identifiers: {} } });
    const r = declared.verify();
    const s = observed(t, `the case declared not applicable on ${here}`, r);
    assert.equal(s.result, "verified", `a declared not-applicable case gave ${s.result}: ${JSON.stringify(s.causes)}`);
    assert.equal(r.status, 0);
    assert.deepEqual(s.applicability?.notApplicable, [absent], `the summary does not name the case not applicable: ${JSON.stringify(s.applicability)}`);
    assert.equal(s.applicability.platform, here);
    assert.equal(s.cases.skipped, 0, "a declared not-applicable case is counted as skipped");
    assert.equal(s.cases.executed, 1, "the not-applicable case ran");
    assert.ok(r.output.split(/\r?\n/).some((l) => /not applicable/i.test(l) && l.includes("guard/T0 [guard/F3] not here")), "the output does not name the case not applicable");

    const undeclared = consumer();
    reduce(undeclared, source, [passes, absent]);
    const v = undeclared.verify();
    const u = observed(t, "the same case skipped without a declaration", v);
    assert.equal(u.result, "cannot verify", `an undeclared skip gave ${u.result}`);
    assert.equal(v.status, 2);
    assert.ok(u.causes.some((x) => /skipped/.test(x) && x.includes("guard/T0 [guard/F3] not here")), `no cause names the skipped case: ${JSON.stringify(u.causes)}`);

    const only = consumer();
    const coverage = { identifiers: ["guard/F3"], coverage: { "guard/F3": { Requirements: [absent] } } };
    reduce(only, source, [passes, absent], { ...coverage, applicability: { cases: { [absent]: { notOn: [here], why } }, identifiers: {} } });
    const w = only.verify();
    const x = observed(t, `guard/F3 covered only by a case not applicable on ${here}`, w);
    assert.equal(x.result, "cannot verify", `an identifier left uncovered here gave ${x.result}`);
    assert.deepEqual(x.coverage.notHere, ["guard/F3"], `the summary does not name guard/F3 not verified here: ${JSON.stringify(x.coverage)}`);
    assert.ok(x.causes.some((c) => c.includes("guard/F3") && c.includes(here)), `no cause names guard/F3 on ${here}: ${JSON.stringify(x.causes)}`);

    const contract = consumer();
    reduce(contract, source, [passes, absent], { ...coverage, applicability: { cases: { [absent]: { notOn: [here], why } }, identifiers: { "guard/F3": { notOn: [here], why } } } });
    const y = contract.verify();
    const z = observed(t, `guard/F3 declared not applicable on ${here}`, y);
    assert.equal(z.result, "verified", `an identifier the contract declares not applicable gave ${z.result}: ${JSON.stringify(z.causes)}`);
    assert.deepEqual(z.coverage.notApplicable, ["guard/F3"], `the summary does not name guard/F3 not applicable: ${JSON.stringify(z.coverage)}`);
  });

  it("guard/T113 [guard/F35]: two runs of the documented command, one passing and one with a planted failing case, each with the child's temporary directory set to a fresh empty directory, leave that directory empty", (t) => {
    const { leftover } = twice();
    t.diagnostic(`observed on ${process.platform}: the whole delivered suite left ${leftover.map((l) => l.length).join(" and ")} entries in its temporary directory over two runs: ${JSON.stringify(leftover.map((l) => l.slice(0, 8)))}`);
    assert.deepEqual(leftover, [[], []], "a passing run left entries in its temporary directory");

    // A delivered case that makes a fixture with the delivered harness, then fails.
    const c = consumer();
    const harness = readFileSync(join(c.installed, "test", "acceptance", "harness.mjs"));
    const name = `${MINI} > guard/T0 makes a fixture, then fails`;
    reduce(c, `import { it } from "node:test";\nimport { consumer } from "./harness.mjs";\nit("guard/T0 makes a fixture, then fails", () => {\n  consumer({ install: false });\n  throw new Error("planted to fail");\n});\n`, [name]);
    writeFileSync(join(c.installed, "test", "acceptance", "harness.mjs"), harness);
    rewrite(c, () => {});
    const tmp = scratch("kaal-guard-verify-tmp-");
    const r = c.verify(temporary(tmp));
    const s = observed(t, "a planted case that makes a fixture, then fails", r);
    assert.equal(s.result, "failed", `the planted failing case gave ${s.result}:\n${r.output.slice(-4000)}`);
    t.diagnostic(`observed on ${process.platform}: the failing run left ${left(tmp).length} entries in its temporary directory: ${JSON.stringify(left(tmp))}`);
    assert.deepEqual(left(tmp), [], "a failing run left entries in its temporary directory");
  });

  // Registered on every host; where the Engineering Test Plan declares it not applicable, it ends before its body (guard/C118).
  it("guard/T114 [guard/F33, guard/F35]: a consumer holding a Unix socket and a FIFO is verified, exit 0, within the case's time limit, naming neither; replacing the FIFO with a regular file between snapshots is failed, naming it", applicability("guard/T114"), async (t) => {
    const c = consumer();
    const passes = `${MINI} > guard/T0 passes`;
    const replaces = `${MINI} > guard/T0 replaces the FIFO when asked`;
    reduce(c, `import { it } from "node:test";\nimport { rmSync, writeFileSync } from "node:fs";\nit("guard/T0 passes", () => {});\nit("guard/T0 replaces the FIFO when asked", () => {\n  const fifo = process.env.GUARD_T114_FIFO;\n  if (fifo) {\n    rmSync(fifo);\n    writeFileSync(fifo, "a regular file now\\n");\n  }\n});\n`, [passes, replaces]);
    const sock = join(c.dir, "t114.sock");
    const fifo = join(c.dir, "t114.fifo");
    must(exec(c.dir, "mkfifo", [fifo], clean()), "mkfifo");
    const server = createServer();
    await new Promise((done, fail) => server.once("error", fail).listen(sock, done));
    const LIMIT = 5 * 60 * 1000;
    try {
      const r = c.verify({}, LIMIT);
      if (r.status === null) {
        // A reader blocked on the FIFO is released: opening it for writing and closing it gives the reader end of file.
        try {
          fs.closeSync(fs.openSync(fifo, fs.constants.O_WRONLY | fs.constants.O_NONBLOCK));
        } catch {}
      }
      assert.notEqual(r.status, null, `the run did not complete within ${LIMIT / 1000} s:\n${r.output.slice(-4000)}`);
      const s = observed(t, "a consumer holding a Unix socket and a FIFO", r);
      assert.equal(s.result, "verified", `a socket and a FIFO gave ${s.result}:\n${r.output.slice(-4000)}`);
      assert.equal(r.status, 0);
      assert.deepEqual(s.consumer.changed, [], "the summary names a changed path");
      assert.ok(!/t114\.(sock|fifo)/.test(r.output), "the output names the socket or the FIFO");

      const v = c.verify({ GUARD_T114_FIFO: fifo }, LIMIT);
      assert.notEqual(v.status, null, `the run did not complete within ${LIMIT / 1000} s`);
      const u = observed(t, "the FIFO replaced with a regular file during the run", v);
      assert.equal(u.result, "failed", `a FIFO replaced with a regular file gave ${u.result}:\n${v.output.slice(-4000)}`);
      assert.equal(v.status, 1);
      assert.ok(u.consumer.changed.includes("t114.fifo"), `the summary does not name t114.fifo changed: ${JSON.stringify(u.consumer.changed)}`);
    } finally {
      server.close();
    }
  });

  it("guard/T131 [guard/F33, guard/F35]: a consumer holding a cycle of symbolic links is verified, exit 0, within the case's time limit, following neither link; replacing one link of the cycle with a regular file between snapshots is failed, naming it; a directory replaced by a regular file, a regular file replaced by a directory, and an empty directory replaced by a symbolic link are each failed, naming the path", async (t) => {
    const c = consumer();
    const asked = `${MINI} > guard/T0 changes an entry's kind when asked`;
    reduce(c, `import { it } from "node:test";\nimport { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";\nit("guard/T0 changes an entry's kind when asked", () => {\n  const to = process.env.GUARD_T131_TO, at = process.env.GUARD_T131_AT;\n  if (!at) return;\n  rmSync(at, { recursive: true, force: true });\n  if (to === "file") writeFileSync(at, "a regular file now\\n");\n  else if (to === "link") symlinkSync("t131.file", at, "file");\n  else mkdirSync(at);\n});\n`, [asked]);
    try {
      symlinkSync("t131.b", join(c.dir, "t131.a"), "file");
      symlinkSync("t131.a", join(c.dir, "t131.b"), "file");
    } catch (e) {
      assert.fail(`blocked before behavioural assertion: this host refuses to make a symbolic link (${e.code}), so the cycle cannot be set up`);
    }
    mkdirSync(join(c.dir, "t131.dir"));
    writeFileSync(join(c.dir, "t131.dir", "inside.txt"), "inside\n");
    writeFileSync(join(c.dir, "t131.file"), "a regular file\n");
    mkdirSync(join(c.dir, "t131.empty"));
    const LIMIT = 5 * 60 * 1000;
    const r = c.verify({}, LIMIT);
    assert.notEqual(r.status, null, `the run did not complete within ${LIMIT / 1000} s:\n${r.output.slice(-4000)}`);
    const s = observed(t, "a consumer holding a cycle of symbolic links", r);
    assert.equal(s.result, "verified", `a cycle of links gave ${s.result}:\n${r.output.slice(-4000)}`);
    assert.equal(r.status, 0);
    assert.deepEqual(s.consumer.changed, [], "the summary names a changed path");
    for (const [at, to, what] of [["t131.a", "file", "a link of the cycle replaced with a regular file"], ["t131.dir", "file", "a directory replaced with a regular file"], ["t131.file", "dir", "a regular file replaced with a directory"], ["t131.empty", "link", "an empty directory replaced with a symbolic link"]]) {
      const v = c.verify({ GUARD_T131_AT: join(c.dir, at), GUARD_T131_TO: to }, LIMIT);
      assert.notEqual(v.status, null, `${what}: the run did not complete within ${LIMIT / 1000} s`);
      const u = observed(t, what, v);
      assert.equal(u.result, "failed", `${what} gave ${u.result}:\n${v.output.slice(-4000)}`);
      assert.equal(v.status, 1);
      assert.ok(u.consumer.changed.includes(at), `${what}: the summary does not name ${at} changed: ${JSON.stringify(u.consumer.changed)}`);
    }
  });

  it("guard/T115 [guard/F33, guard/F35]: a delivered case that appends to a consumer file gives failed, exit 1, naming the path, with the next step to check concurrent activity and no advice to restore paths", (t) => {
    const c = consumer();
    reduce(c, `import { it } from "node:test";\nimport { appendFileSync } from "node:fs";\nit("guard/T0 changes the consumer", () => appendFileSync(process.env.GUARD_T115_FILE, "changed during the run\\n"));\n`, [`${MINI} > guard/T0 changes the consumer`]);
    const r = c.verify({ GUARD_T115_FILE: join(c.dir, "own.txt") });
    const s = observed(t, "a consumer file changed during the run", r);
    assert.equal(s.result, "failed", `a change during the run gave ${s.result}:\n${r.output.slice(-4000)}`);
    assert.equal(r.status, 1);
    assert.ok(s.consumer.changed.includes("own.txt"), `the summary does not name own.txt changed: ${JSON.stringify(s.consumer.changed)}`);
    const line = r.output.split(/\r?\n/).find((l) => /^failed: the consumer changed during the run/.test(l));
    assert.ok(line, `the output names no change during the run:\n${r.output.slice(-4000)}`);
    t.diagnostic(`observed on ${process.platform}: ${line}`);
    assert.match(line, /own\.txt/, "the cause does not name own.txt");
    assert.match(line, /check whether you, an editor or a tool such as Git changed/i, "the next step does not ask to check concurrent activity");
    assert.ok(!/restore/i.test(r.output), "the output advises restoring paths");
  });

  it("guard/T116 [guard/F37, guard/A19]: the packed candidate holds only the package's declared files, and no path from engineering/, no Engineering Test Plan and no release evidence", (t) => {
    const found = publisher(PACKAGE);
    t.diagnostic(`observed on ${process.platform}: ${found.paths.length} packed files; publisher material: ${JSON.stringify(found.material)}`);
    assert.deepEqual(found.material, [], "the packed candidate holds publisher material");

    // The check discriminates: the same package with an Engineering Test Plan planted in docs/ is found.
    const planted = join(scratch("kaal-guard-verify-plant-"), "kaal-guard");
    cpSync(PACKAGE, planted, { recursive: true, filter: (from) => !from.split(/[\\/]/).includes("node_modules") });
    mkdirSync(join(planted, "docs", "engineering"));
    copyFileSync(join(REPO, "engineering", "guard", "testing.md"), join(planted, "docs", "engineering", "testing.md"));
    const caught = publisher(planted);
    t.diagnostic(`observed on ${process.platform}, with a planted docs/engineering/testing.md: publisher material ${JSON.stringify(caught.material)}`);
    assert.deepEqual(caught.material, ["docs/engineering/testing.md"], "a planted Engineering Test Plan is not found");
  });

  it("guard/T117 [guard/F35]: snapshot(), with its file-system reads patched so a listed file is removed before it is read, completes and records the file as absent", async (t) => {
    const { snapshot } = await import(pathToFileURL(join(PACKAGE, "test", "verify.mjs")).href);
    const dir = scratch("kaal-guard-verify-race-");
    writeFileSync(join(dir, "stays.txt"), "a file that stays\n");
    writeFileSync(join(dir, "maintenance.lock"), "");
    // As Git's background maintenance does with .git/objects/maintenance.lock: listed, then gone before it is read.
    const real = fs.readdirSync;
    fs.readdirSync = function (path, ...rest) {
      const out = real.call(this, path, ...rest);
      if (path === dir) rmSync(join(dir, "maintenance.lock"), { force: true });
      return out;
    };
    syncBuiltinESMExports();
    let shot;
    let error;
    try {
      shot = snapshot(dir);
    } catch (e) {
      error = e;
    } finally {
      fs.readdirSync = real;
      syncBuiltinESMExports();
    }
    t.diagnostic(`observed on ${process.platform}: ${error ? `snapshot() threw ${error.code ?? ""} ${error.message}` : `snapshot() recorded ${JSON.stringify(Object.keys(shot))}`}`);
    assert.equal(error, undefined, `snapshot() threw: ${error?.message}`);
    assert.ok("stays.txt" in shot, "snapshot() does not record the file that stays");
    assert.ok(!("maintenance.lock" in shot), "snapshot() records the removed file as present");
  });
});

describe("guard/I8 what a consumer reads in the verification", { timeout: 30 * 60 * 1000 }, () => {
  it("guard/T120 [guard/F34]: identifiers that share an allocation are named together on one line, never the same allocation twice, and the summary still lists each allocated identifier with its allocation", (t) => {
    const c = consumer();
    const shared = "the publisher's Engineering Test Plan, shared";
    const own = "the publisher's Engineering Test Plan, its own";
    reduce(c, PASSING, [`${MINI} > guard/T0 passes`], { identifiers: ["guard/F901", "guard/F902", "guard/F903"], allocated: { "guard/F901": shared, "guard/F902": shared, "guard/F903": own } });
    const r = c.verify();
    const s = observed(t, "three allocated identifiers, two sharing one allocation", r);
    assert.equal(s.result, "verified", `the result is ${s.result}: ${JSON.stringify(s.causes)}`);
    const prefix = "not verified by this run, allocated to the publisher: ";
    const lines = r.stdout.split(/\r?\n/).filter((l) => l.startsWith(prefix));
    t.diagnostic(`observed allocation lines: ${JSON.stringify(lines)}`);
    assert.deepEqual(lines.sort(), [`${prefix}guard/F901, guard/F902: ${shared}`, `${prefix}guard/F903: ${own}`].sort(), "the allocation lines do not name each allocation once, with every identifier that shares it");
    assert.deepEqual(s.coverage.allocated, [{ id: "guard/F901", where: shared }, { id: "guard/F902", where: shared }, { id: "guard/F903", where: own }], "the summary's allocated list changed its meaning");
  });

  it("guard/T121 [guard/F33]: the package declares its bugs URL, and a next step that asks for a report names it, for a failed case and for a skipped one", (t) => {
    const failing = consumer();
    const bugs = JSON.parse(readFileSync(join(failing.installed, "package.json"), "utf8")).bugs?.url;
    assert.equal(bugs, "https://github.com/Kai-Hacks-AI/KAAL/issues", "the package declares no bugs URL, or another one");
    reduce(failing, `import { it } from "node:test";\nit("guard/T0 made to fail", () => { throw new Error("made to fail"); });\n`, [`${MINI} > guard/T0 made to fail`]);
    const f = failing.verify();
    observed(t, "a delivered case made to fail", f);
    const skipped = consumer();
    reduce(skipped, `import { it } from "node:test";\nit("guard/T0 passes", () => {});\nit.skip("guard/T0 skipped", () => {});\n`, [`${MINI} > guard/T0 passes`, `${MINI} > guard/T0 skipped`]);
    const k = skipped.verify();
    observed(t, "a skipped case", k);
    for (const [r, cause] of [[f, /^failed: a delivered case failed: [^\n]*; do: (.*)$/m], [k, /^cannot verify: a delivered case was skipped: [^\n]*; do: (.*)$/m]]) {
      const next = r.output.match(cause)?.[1];
      assert.ok(next, `the output has no next step for ${cause}:\n${r.output.slice(-4000)}`);
      assert.ok(next.includes(bugs), `the next step names no destination: ${next}`);
      assert.ok(!next.includes("a fallback"), `the next step names the fallback, not the declared URL: ${next}`);
      assert.ok(!r.output.includes("the package's maintainers"), "the output still asks for a report to the package's maintainers");
    }
  });
});

describe("guard/F40 platforms in Guard's tests", () => {
  it("guard/T132 [guard/F40]: every Guard test file registers each case on every platform; no case skips, marks todo or returns by platform; a skip by platform matches the package's declared row; every declared exception names its platforms, a reason, linked evidence and a linked Review judgment; every other platform reference is listed or raised as a Change; and no listed row is stale", () => {
    const ROOT = join(HERE, "..", "..", "..");
    const roots = ["packages/kaal-guard/test", "engineering/guard/acceptance"];
    const files = {};
    for (const root of roots) {
      for (const f of readdirSync(join(ROOT, root), { recursive: true })) {
        const path = `${root}/${String(f).split("\\").join("/")}`;
        // The verifier is product code, and the helper names the platforms it reads.
        if (!path.endsWith(".mjs") || path.endsWith("/test/verify.mjs") || path.endsWith("/platforms.mjs") || path.includes("/fixtures/")) continue;
        files[path] = readFileSync(join(ROOT, path), "utf8");
      }
    }
    const engineering = readFileSync(PLAN, "utf8");
    const delivered = readFileSync(join(ROOT, "packages", "kaal-guard", "docs", "testing.md"), "utf8");
    assert.deepEqual(audit({ files, engineering, delivered }), [], "Guard's tests branch on the platform where no Test Plan says why");

    // Negative fixtures, kept apart so this file names no platform itself: each must be refused.
    const fixtures = JSON.parse(readFileSync(join(HERE, "fixtures", "platforms.json"), "utf8"));
    for (const [name, fixture] of Object.entries(fixtures.sources)) {
      const found = audit({ files: { ...files, "fixture.mjs": `it("guard/T0 [guard/F3] runs everywhere", () => {});\n${fixture}` }, engineering, delivered });
      assert.ok(found.some((f) => f.startsWith("fixture.mjs:")), `${name} is not refused: ${JSON.stringify(found)}`);
    }
    const row = engineering.split("\n").find((l) => l.startsWith("| guard/T114 |"));
    const cells = row.split(" | ");
    const edits = {
      ...Object.fromEntries(Object.entries(fixtures.plan).map(([name, [from, to]]) => [name, row.replace(from, to)])),
      "no reason": cells.map((c, i) => (i === 2 ? "" : c)).join(" | "),
      "no linked evidence": cells.map((c, i) => (i === 3 ? "Hosting said so" : c)).join(" | "),
      "no linked Review judgment": row.replace(/\| [^|]+ \|$/, "| approved in chat |"),
    };
    for (const [name, edited] of Object.entries(edits)) {
      assert.notEqual(edited, row, `the fixture for ${name} did not change the row`);
      const found = audit({ files, engineering: engineering.replace(row, edited), delivered });
      assert.ok(found.some((f) => f.startsWith("guard/T114:")), `a declaration with ${name} is not refused`);
    }
    const stale = audit({ files: { ...files, "packages/kaal-guard/test/acceptance/harness.mjs": "" }, engineering, delivered });
    assert.ok(stale.some((f) => f.includes("matches no line")), "a stale listed difference is not refused");
    const unnamed = engineering.replace(/(\| guard\/C135: )/, "| ");
    assert.ok(audit({ files, engineering: unnamed, delivered }).some((f) => f.includes("names no Change")), "a raised difference with no Change is not refused");
  });
});
