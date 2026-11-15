// The harness of kaal-guard's outer acceptance tests. It packs kaal-guard once, builds a starting
// consumer repository once per test file (a bare remote, a home of its own and the packed tarball
// installed), and gives each test its own independent copy of it. The only KAAL element it uses is
// Hosting's process start and environment (@kaihacksai/kaal-hosting, a dependency of the package);
// the rest is Node built-ins and Git.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { executeSync, isolatedEnvironment, prepare } from "@kaihacksai/kaal-hosting";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { after } from "node:test";
import { fileURLToPath } from "node:url";

/** The package under test: two directories up from here. */
export const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** The one KAAL element the package declares (guard/N6, guard/A8): Hosting, at this exact version, imported only by this harness. */
export const HOSTING = { name: "@kaihacksai/kaal-hosting", version: "0.0.1" };

/** The name the package is published under (N6), in the Owner's npm scope; its command is kaal-guard. */
export const NAME = "@kaihacksai/kaal-guard";

/**
 * Where a repository declares its checks (guard/F1, guard/F28), one `<name>.md` each. Joined, never
 * written out: the established guard/T30 reads every file in the package for that namespace.
 */
export const CONFIG = [".kaal", "config", "guard"].join("/");

/** The repository's installation record (guard/F29), which only Guard writes. */
export const RECORD = [".kaal", "state", "guard", "installation.json"].join("/");

/** The Skill's one standalone deployment (guard/F23, guard/N10); its one source is `skills/kaal-guard/` in the package. */
export const SKILL = ".agents/skills/kaal-guard";

/** Every file under a directory, relative to it, with forward slashes, sorted; none when it does not exist. */
export function tree(base) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(base, p).split("\\").join("/"));
    }
  };
  if (existsSync(base)) walk(base);
  return out.sort();
}

/** The Type every declaration names in its `type` member (core/F6): Guard's own Business Language name. */
export const TYPE = "Guard/Check";

/**
 * One declaration's file: typed frontmatter in guard/F1's strict YAML subset, then a body of guidance
 * Guard never reads. Strings are double-quoted, lists and the outcomes map are flow-style, and each
 * outcome's exit status is a double-quoted key (guard/F1, `guard/C38`).
 */
export function declaration(check, body = "Guidance for people and agents; Guard never reads it.\n") {
  const lines = [`type: ${TYPE}`, `command: ${JSON.stringify(check.command)}`, `runs: [${check.runs.join(", ")}]`];
  if (check.facts) lines.push(`facts: [${check.facts.join(", ")}]`);
  if (check.trusted) lines.push(`trusted: ${JSON.stringify(check.trusted)}`);
  if (check.outcomes) lines.push(`outcomes: {${Object.entries(check.outcomes).map(([k, v]) => `${JSON.stringify(String(k))}: ${v}`).join(", ")}}`);
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

/** Runs a program through Hosting (no `cmd.exe` for `npm`); never throws, returns { status, stdout, stderr }. */
export function exec(cwd, file, args, env = {}, input = "") {
  try {
    const r = executeSync(file, args, { cwd, env: { ...process.env, ...env }, input });
    return { status: r.status, stdout: r.stdout, stderr: r.stderr, output: r.output };
  } catch (error) {
    return { status: null, stdout: "", stderr: String(error?.message ?? error), output: String(error?.message ?? error) };
  }
}

/** Every temporary root a case of this file makes, removed when the file ends, whether its cases pass or fail. */
const roots = [];
export function scratch(prefix) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}
after(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true, maxRetries: 5 });
});

let tarball;

/** The packed kaal-guard tarball. While there is no package, a scenario is blocked here, before any behavioural assertion. */
export function packed() {
  if (tarball) return tarball;
  assert.ok(existsSync(join(PACKAGE, "package.json")), "blocked before behavioural assertion: there is no kaal-guard package to pack (packages/kaal-guard/package.json)");
  const out = scratch("kaal-guard-pack-");
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

/** Asserts a program succeeded. */
const must = (r, what) => (assert.equal(r.status, 0, `${what}: ${r.output}`), r);

/** The consumer repository that lives under `root`: its bare remote `origin`, an isolated home and its working tree. */
function open(root) {
  const home = join(root, "home");
  const remote = join(root, "remote.git");
  const dir = join(root, "repo");
  const env = isolatedEnvironment(root, {});
  const git = (...args) => exec(dir, "git", args, env);
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
    /** Declares exactly these checks: one `<name>.md` each in CONFIG, and no other declaration. */
    checks(checks) {
      const config = join(dir, CONFIG);
      if (existsSync(config)) for (const f of readdirSync(config)) if (f.endsWith(".md")) rmSync(join(config, f));
      for (const [name, check] of Object.entries(checks)) repo.write(`${CONFIG}/${name}.md`, declaration(check));
    },
    /** The installation record's assets, by path: `{ sha256, version }` each. */
    installation() {
      assert.ok(existsSync(join(dir, RECORD)), `there is no installation record (${RECORD})`);
      return JSON.parse(readFileSync(join(dir, RECORD), "utf8")).assets;
    },
    /** The version of the installed package. */
    version() {
      return JSON.parse(readFileSync(join(dir, "node_modules", ...NAME.split("/"), "package.json"), "utf8")).version;
    },
    /** The installed package's catalogue (guard/F27): every SHA-256 each asset path has had in a published version. */
    catalogue() {
      const contract = join(dir, "node_modules", ...NAME.split("/"), "contract.json");
      assert.ok(existsSync(contract), "the package ships no contract.json");
      return JSON.parse(readFileSync(contract, "utf8")).catalogue;
    },
    /** The installed package's Skill source (guard/F23): its directory and its files. While the package ships none, a scenario is blocked here. */
    skill() {
      const source = join(dir, "node_modules", ...NAME.split("/"), "skills", "kaal-guard");
      assert.ok(existsSync(join(source, "SKILL.md")), "blocked before behavioural assertion: the package ships no skills/kaal-guard/SKILL.md");
      return { source, files: tree(source) };
    },
    /** Runs the installed kaal-guard command. */
    guard(args, extra = {}, cwd = dir) {
      const installed = join(dir, "node_modules", ...NAME.split("/"));
      assert.ok(existsSync(join(installed, "package.json")), `${NAME} is not installed under its name`);
      const manifest = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
      const bin = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.["kaal-guard"];
      assert.ok(bin, "kaal-guard declares no kaal-guard command");
      return exec(cwd, process.execPath, [join(installed, bin), ...args], { ...env, ...extra });
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
  return repo;
}


/** Builds the starting consumer under `root`: the bare remote, `git init`, its configuration, the first commit and push, and with `install` the packed tarball as its only development dependency. */
function populate(root, install) {
  mkdirSync(join(root, "home"), { recursive: true });
  mkdirSync(join(root, "repo"));
  const repo = open(root);
  const { dir, remote, env, git } = repo;
  must(exec(root, "git", ["init", "-q", "--bare", remote], env), "git init --bare");
  must(git("init", "-q", "-b", "main"), "git init");
  for (const [k, v] of [["user.name", "Consumer"], ["user.email", "consumer@example.invalid"], ["commit.gpgsign", "false"]]) must(git("config", k, v), "git config");
  repo.write("package.json", JSON.stringify({ name: "consumer", version: "1.0.0", private: true, type: "module" }, null, 2) + "\n");
  repo.write(".gitignore", "node_modules/\n");
  repo.write("checks/exit.mjs", EXIT);
  repo.write("checks/facts.mjs", FACTS);
  repo.write("test/own.test.mjs", `import { test } from "node:test";\ntest("the consumer's own test", () => {});\n`);
  repo.commit("consumer");
  must(git("remote", "add", "origin", remote), "git remote add");
  must(git("push", "-q", "-u", "origin", "main"), "git push");
  if (install) {
    must(exec(dir, "npm", ["install", "--save-dev", "--no-audit", "--no-fund", packed()], env), `npm install ${NAME}`);
    repo.commit(`install ${NAME}`);
  }
}

/**
 * The starting consumers, each built once per test file with Hosting's `prepare` (one `npm install` of
 * the packed package, a few Git calls), and removed when the file ends. Every call of `consumer()` takes
 * its own independent copy, so no case sees another's repository, remote, configuration or worktree.
 */
const starting = {
  full: await prepare((dir) => populate(dir, true)),
  bare: await prepare((dir) => populate(dir, false)),
};
after(async () => {
  await starting.full.dispose();
  await starting.bare.dispose();
});

/**
 * A fresh consumer repository with a bare remote `origin`, an isolated home, and the scripts
 * `checks/exit.mjs` and `checks/facts.mjs`. With `install`, the packed tarball is its only
 * development dependency. It is a copy of the file's starting consumer with its remote repointed:
 * Hosting's `copy()` is asynchronous and the cases call this function synchronously, so the copy is made
 * here with the same options (links kept as they are, modes kept).
 */
export function consumer({ install = true } = {}) {
  const root = scratch("kaal-guard-consumer-");
  cpSync((install ? starting.full : starting.bare).dir, root, { recursive: true, verbatimSymlinks: true, dereference: false });
  const repo = open(root);
  must(repo.git("remote", "set-url", "origin", repo.remote), "git remote set-url");
  return repo;
}
