// Guard outer acceptance, Engineering part: the package's own tests and its consumer verification.
// Requirements verification T98 [N6] (guard/C76, revised in guard/C98) and T101–T106 [I8] (guard/C97,
// written in guard/C98). Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE = join(resolve(HERE, "../../.."), "packages", "kaal-guard");
const NAME = "@kaihacksai/kaal-guard";
const WINDOWS = process.platform === "win32";
const NPM = WINDOWS ? "npm.cmd" : "npm";

/** The environment a child runs in: an inherited NODE_TEST_CONTEXT makes node --test skip every file and pass, so it is never inherited. */
function clean(extra = {}) {
  const env = { ...process.env, ...extra };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

/** Runs a program; never throws, returns { status, stdout, stderr, output }. */
function exec(cwd, file, args, env) {
  const r = spawnSync(file, args, { cwd, env, encoding: "utf8", shell: WINDOWS && file === "npm", maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const must = (r, what) => (assert.equal(r.status, 0, `${what}: ${r.output}`), r);

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
  const out = mkdtempSync(join(tmpdir(), "kaal-guard-verify-pack-"));
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
  const root = mkdtempSync(join(tmpdir(), "kaal-guard-verify-"));
  const home = join(root, "home");
  const dir = join(root, "consumer");
  mkdirSync(home);
  mkdirSync(dir);
  const env = { HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, ".config"), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(home, ".gitconfig"), npm_config_cache: join(root, "npm-cache"), npm_config_update_notifier: "false" };
  const run = (file, args, what) => must(exec(dir, file, args, clean(env)), what);
  const c = spec();
  run("npm", ["init", "-y"], "npm init");
  run("git", ["init", "-q", "-b", "main"], "git init");
  for (const [k, v] of [["user.name", "Consumer"], ["user.email", "consumer@example.invalid"], ["commit.gpgsign", "false"]]) run("git", ["config", k, v], "git config");
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
    verify: (extra = {}) => exec(dir, "npm", ["explore", NAME, "--", "npm", "test"], clean({ ...env, ...extra })),
  };
}

/** The run's summary line, `kaal-guard-verification {…}`, parsed. Its absence is the evidence that the run names nothing. */
function summary(r) {
  const m = [...r.output.matchAll(/^kaal-guard-verification (\{.*\})\s*$/gm)].pop();
  assert.ok(m, `the run printed no kaal-guard-verification summary line (exit ${r.status}):\n${r.output.slice(-4000)}`);
  return JSON.parse(m[1]);
}

/** The delivered manifest's location in the installed copy (guard/A18). */
const MANIFEST = join("test", "verify.json");

/**
 * Replaces the installed copy's delivered cases with one small case file and makes the shipped manifest
 * consistent with that copy: it declares `cases` and the SHA-256 of every installed file but itself.
 * A fixture of the verification's own accounting, so a scenario does not run the whole delivered suite.
 */
function reduce(c, source, cases) {
  rmSync(join(c.installed, "test", "acceptance"), { recursive: true, force: true });
  mkdirSync(join(c.installed, "test", "acceptance"), { recursive: true });
  writeFileSync(join(c.installed, "test", "acceptance", "mini.test.mjs"), source);
  const path = join(c.installed, MANIFEST);
  const manifest = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  manifest.cases = cases;
  manifest.files = Object.fromEntries(tree(c.installed).filter((f) => f !== "test/verify.json").map((f) => [f, sha256(readFileSync(join(c.installed, f)))]));
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}

const MINI = "test/acceptance/mini.test.mjs";
const PASSING = `import { it } from "node:test";\nit("guard/T0 passes", () => {});\n`;

let full;

/** One consumer verified twice with the whole delivered suite, and its content before, between and after. */
function twice() {
  if (full) return full;
  const c = consumer();
  const before = snapshot(c.dir);
  const first = c.verify();
  const between = snapshot(c.dir);
  const second = c.verify();
  return (full = { c, before, first, between, second, after: snapshot(c.dir) });
}

describe("guard/N6 [guard/I5] the package's own tests", () => {
  it("guard/T98 [guard/N6]: the package's own test files pass on Node 24, run from packages/kaal-guard, and none of the retired 0.0.1 suite runs", () => {
    // `npm test` is the consumer's verification of the installed copy (guard/F32), so the package's own
    // tests are run by their files.
    const r = spawnSync(process.execPath, ["--test", "test/*.test.mjs", "test/acceptance/*.test.mjs"], { cwd: PACKAGE, env: clean(), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    /** The last summary count node --test printed for `name` (pass or fail), in either reporter's form. */
    const count = (name) => Number([...output.matchAll(new RegExp(`^(?:ℹ|#) ${name} (\\d+)$`, "gm"))].pop()?.[1]);
    assert.ok(count("pass") > 0, `the package's tests ran no test:\n${output.slice(-4000)}`);
    // The retired suite fails on 0.0.2 by design, so a run with no failure runs none of its files.
    assert.equal(count("fail"), 0, `the package's tests failed:\n${output.slice(-4000)}`);
    assert.equal(r.status, 0, `the package's tests exited ${r.status}:\n${output.slice(-4000)}`);
  });
});

describe("guard/I8 consumer verification of the installed package", { timeout: 30 * 60 * 1000 }, () => {
  it("guard/T101 [guard/F31, guard/F32, guard/F33]: the documented command executes the delivered cases, more than zero of them, and a passing run gives verified, exit 0", () => {
    const { first } = twice();
    const s = summary(first);
    assert.ok(s.cases.executed > 0, `the run executed no delivered case:\n${first.output.slice(-4000)}`);
    assert.equal(s.cases.executed, s.cases.declared, "a declared case did not execute");
    assert.equal(s.cases.passed, s.cases.executed, `a delivered case did not pass:\n${first.output.slice(-4000)}`);
    // A shipped file changed without its manifest: node engineering/guard/verify-manifest.mjs writes it again.
    assert.equal(s.result, "verified", `the result is ${s.result}: ${JSON.stringify(s.causes)}`);
    assert.equal(first.status, 0, `verified exited ${first.status}`);
    assert.match(first.output, /^verified\b/m, "the output does not name the result verified");
  });

  it("guard/T102 [guard/F34]: the output and its summary line name the package, the candidate's version, its install location and the installed files' hashes, and these equal the candidate's", () => {
    const { c, first } = twice();
    const s = summary(first);
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

  it("guard/T103 [guard/F33, guard/F34]: one byte changed in the installed lib/runner.mjs gives cannot verify, exit 2, naming the file; a delivered case made to fail gives failed, exit 1, naming the case", () => {
    const changed = consumer();
    reduce(changed, PASSING, [`${MINI} > guard/T0 passes`]);
    const runner = join(changed.installed, "lib", "runner.mjs");
    const bytes = readFileSync(runner);
    bytes[bytes.length - 1] = bytes[bytes.length - 1] === 0x20 ? 0x0a : 0x20;
    writeFileSync(runner, bytes);
    const r = changed.verify();
    const s = summary(r);
    assert.equal(s.result, "cannot verify", `one changed byte gave ${s.result}:\n${r.output.slice(-4000)}`);
    assert.equal(r.status, 2);
    assert.ok(s.files.mismatched.includes("lib/runner.mjs"), "the summary does not name lib/runner.mjs");
    assert.match(r.output, /lib\/runner\.mjs/, "the output does not name lib/runner.mjs");

    const failing = consumer();
    reduce(failing, `import { it } from "node:test";\nit("guard/T0 made to fail", () => { throw new Error("made to fail"); });\n`, [`${MINI} > guard/T0 made to fail`]);
    const f = failing.verify();
    const t = summary(f);
    assert.equal(t.result, "failed", `a failing case gave ${t.result}:\n${f.output.slice(-4000)}`);
    assert.equal(f.status, 1);
    assert.deepEqual(t.cases.failures, [`${MINI} > guard/T0 made to fail`], "the summary does not name the failed case");
    assert.match(f.output, /guard\/T0 made to fail/, "the output does not name the failed case");
  });

  it("guard/T104 [guard/F33]: no git on PATH, zero cases, a skipped case and one declared case not executed each give cannot verify, exit 2, with its cause, and never failed", () => {
    const expect = (r, cause, what) => {
      const s = summary(r);
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

  it("guard/T105 [guard/F35]: after a run, the consumer's working tree, .git, npm configuration and the installed package are as they were, and the output says so", () => {
    const { before, between, first } = twice();
    assert.deepEqual(between, before, "the run changed the consumer");
    const s = summary(first);
    assert.equal(s.consumer.unchanged, true, "the summary does not say the consumer is unchanged");
    assert.match(first.output, /consumer unchanged/i, "the output does not say the consumer is unchanged");
  });

  it("guard/T106 [guard/F32, guard/F36]: a second run against the same installation gives the same result, and the output names kaal-guard verify for integration", () => {
    const { first, second, between, after } = twice();
    const [a, b] = [summary(first), summary(second)];
    assert.equal(second.status, first.status, `the second run exited otherwise: ${JSON.stringify(b.causes)}`);
    assert.equal(b.result, a.result, "the second run gave another result");
    assert.deepEqual(b.cases, a.cases, "the second run accounted for the cases otherwise");
    assert.deepEqual(b.files, a.files, "the second run names other files");
    assert.deepEqual(after, between, "the second run changed the consumer");
    assert.match(first.output, /kaal-guard verify/, "the output does not name kaal-guard verify for integration");
  });
});
