// The harness of kaal-guard's outer acceptance tests. It packs kaal-guard once, then gives each
// test a fresh consumer repository outside this one, with a bare remote and a home of its own, and
// installs only the packed tarball there. Node built-ins and Git only: no KAAL element.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The package under test: two directories up from here. */
export const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const WINDOWS = process.platform === "win32";

/** Runs a program; never throws, returns { status, stdout, stderr }. */
export function exec(cwd, file, args, env = {}, input = "") {
  const r = spawnSync(file, args, { cwd, env: { ...process.env, ...env }, input, encoding: "utf8", shell: WINDOWS && file === "npm" });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "", output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

let tarball;

/** The packed kaal-guard tarball. While there is no package, a scenario is blocked here, before any behavioural assertion. */
export function packed() {
  if (tarball) return tarball;
  assert.ok(existsSync(join(PACKAGE, "package.json")), "blocked before behavioural assertion: there is no kaal-guard package to pack (packages/kaal-guard/package.json)");
  const out = mkdtempSync(join(tmpdir(), "kaal-guard-pack-"));
  const r = exec(PACKAGE, "npm", ["pack", "--pack-destination", out, "--silent"]);
  assert.equal(r.status, 0, `npm pack failed: ${r.output}`);
  tarball = join(out, r.stdout.trim().split(/\r?\n/).pop());
  return tarball;
}

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** One verdict line: `<verdict>: <check>: <evidence>`. */
const LINE = /^(pass|fail|cannot judge|not applicable|held): ([^:\s]+): ?(.*)$/;

/** The verdicts printed in some output, by check name. */
export function verdicts(output) {
  const found = {};
  for (const l of output.split(/\r?\n/)) {
    const m = LINE.exec(l.trim());
    if (m) found[m[2]] = { verdict: m[1], evidence: m[3] };
  }
  return found;
}

/** A check script that prints its argument and exits with the given status. */
const EXIT = `const [s, ...m] = process.argv.slice(2); console.log(m.join(" ")); process.exit(Number(s));\n`;

/** A check script that records what it received: cwd, stdin and every GUARD_* variable. */
const FACTS = `import { readFileSync, writeFileSync } from "node:fs";
let stdin = ""; try { stdin = readFileSync(0, "utf8"); } catch {}
const guard = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("GUARD_")));
const changed = guard.GUARD_CHANGED ? readFileSync(guard.GUARD_CHANGED, "utf8").split("\\0").filter(Boolean) : null;
writeFileSync(process.argv[2], JSON.stringify({ cwd: process.cwd(), stdin, guard, changed }));
`;

/**
 * A fresh consumer repository with a bare remote `origin`, an isolated home, and the scripts
 * `checks/exit.mjs` and `checks/facts.mjs`. With `install`, the packed tarball is its only
 * development dependency.
 */
export function consumer({ install = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "kaal-guard-consumer-"));
  const home = join(root, "home");
  const remote = join(root, "remote.git");
  const dir = join(root, "repo");
  mkdirSync(home);
  mkdirSync(dir);
  const env = { HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, ".config"), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(home, ".gitconfig"), npm_config_cache: join(root, "npm-cache") };
  const git = (...args) => exec(dir, "git", args, env);
  const must = (r, what) => (assert.equal(r.status, 0, `${what}: ${r.output}`), r);
  must(exec(root, "git", ["init", "-q", "--bare", remote], env), "git init --bare");
  must(git("init", "-q", "-b", "main"), "git init");
  for (const [k, v] of [["user.name", "Consumer"], ["user.email", "consumer@example.invalid"], ["commit.gpgsign", "false"]]) must(git("config", k, v), "git config");
  const repo = {
    root, home, remote, dir, env, git,
    write(path, content) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), content);
    },
    read: (path) => readFileSync(join(dir, path), "utf8"),
    exists: (path) => existsSync(join(dir, path)),
    commit(message) {
      must(git("add", "-A"), "git add");
      must(git("commit", "-q", "--allow-empty", "-m", message), "git commit");
      return git("rev-parse", "HEAD").stdout.trim();
    },
    /** Writes guard.json with these checks, keeping anything else in it. */
    checks(checks) {
      const current = existsSync(join(dir, "guard.json")) ? JSON.parse(readFileSync(join(dir, "guard.json"), "utf8")) : {};
      writeFileSync(join(dir, "guard.json"), JSON.stringify({ ...current, checks }, null, 2) + "\n");
    },
    /** Runs the installed kaal-guard command. */
    guard(args, extra = {}, cwd = dir) {
      const manifest = JSON.parse(readFileSync(join(dir, "node_modules", "kaal-guard", "package.json"), "utf8"));
      const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.["kaal-guard"];
      assert.ok(bin, "kaal-guard declares no kaal-guard command");
      return exec(cwd, process.execPath, [join(dir, "node_modules", "kaal-guard", bin), ...args], { ...env, ...extra });
    },
    /** Every file in the working tree outside .git and node_modules, repository-relative. */
    files() {
      const out = [];
      const walk = (d) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          if (e.name === ".git" || e.name === "node_modules") continue;
          const p = join(d, e.name);
          if (e.isDirectory()) walk(p);
          else out.push(relative(dir, p).split("\\").join("/"));
        }
      };
      walk(dir);
      return out.sort();
    },
  };
  repo.write("package.json", JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }, null, 2) + "\n");
  repo.write(".gitignore", "node_modules/\n");
  repo.write("checks/exit.mjs", EXIT);
  repo.write("checks/facts.mjs", FACTS);
  repo.write("test/own.test.mjs", `import { test } from "node:test";\ntest("the consumer's own test", () => {});\n`);
  repo.commit("consumer");
  must(git("remote", "add", "origin", remote), "git remote add");
  must(git("push", "-q", "-u", "origin", "main"), "git push");
  if (install) {
    must(exec(dir, "npm", ["install", "--save-dev", "--no-audit", "--no-fund", "--offline", packed()], env), "npm install kaal-guard");
    repo.commit("install kaal-guard");
  }
  return repo;
}
