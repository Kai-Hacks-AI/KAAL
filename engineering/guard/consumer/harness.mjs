// A12 Consumer acceptance: the harness behind the planned tests T36–T44
// (engineering/guard/acceptance/consumer/). It makes disposable consumers of the published
// @kaihacksai/kaal-guard and never touches KAAL's own working tree (N8):
//   - kaalClone(): a clone of KAAL's current commit, with a local bare remote as origin;
//   - minimalRepo(): a simulated consumer with one check of its own and no integration of its own.
// A consumer installs a version through its dependency and lockfile, as any npm consumer does, and
// runs the Guard it installed. candidate() names the version to move to and its source (N9):
// `packed`, the package in this tree packed now (simulated), unless GUARD_CANDIDATE=registry:<version>
// names a published one. It needs the network to reach the registry; the package does not (N2).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KAAL = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PACKAGE = "@kaihacksai/kaal-guard";
const BIN = join("node_modules", "@kaihacksai", "kaal-guard", "bin", "kaal-guard.mjs");

const made = [];
process.on("exit", () => {
  for (const d of made) rmSync(d, { recursive: true, force: true });
});
function scratch(prefix) {
  const d = mkdtempSync(join(tmpdir(), prefix));
  made.push(d);
  return d;
}

// Git sees no system or user configuration, so a developer's settings cannot change a verdict. Each
// execution of the harness has its own empty global configuration, in its own scratch directory, so
// concurrent runs share nothing, and it is removed with the rest at exit. npm keeps the environment
// it has, since registry access depends on it.
const GIT_ENV = { GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(scratch("kaal-a12-run-"), "gitconfig") };
writeFileSync(GIT_ENV.GIT_CONFIG_GLOBAL, "");

/** This execution's own empty global Git configuration. */
export const gitConfig = () => GIT_ENV.GIT_CONFIG_GLOBAL;

function exec(cwd, file, args, env = {}) {
  const r = spawnSync(file, args, { cwd, env: { ...process.env, ...GIT_ENV, ...env }, encoding: "utf8", shell: process.platform === "win32" && file === "npm" });
  if (r.error) return { status: null, output: r.error.message };
  return { status: r.status, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function must(r, what) {
  if (r.status !== 0) throw new Error(`A12: ${what} failed (${r.status}):\n${r.output}`);
  return r;
}

/** The registry's integrity for a published spec, such as @kaihacksai/kaal-guard@0.0.1. */
export function registryIntegrity(spec) {
  return must(exec(KAAL, "npm", ["view", spec, "dist.integrity"]), `npm view ${spec}`).output.trim();
}

let packed;
/** The version to move to, with its source: `packed` (simulated) or `registry`. */
export function candidate() {
  const named = process.env.GUARD_CANDIDATE;
  if (named) {
    const m = /^registry:(.+)$/.exec(named);
    if (!m) throw new Error(`A12: GUARD_CANDIDATE must be registry:<version>, not ${named}`);
    return { source: "registry", spec: `${PACKAGE}@${m[1]}` };
  }
  if (!packed) {
    const dir = scratch("kaal-a12-pack-");
    must(exec(KAAL, "npm", ["pack", join(KAAL, "packages", "kaal-guard"), "--pack-destination", dir, "--silent"]), "npm pack");
    const tgz = readdirSync(dir).find((f) => f.endsWith(".tgz"));
    packed = { source: "packed", spec: join(dir, tgz) };
  }
  return packed;
}

/** What every disposable consumer can do. */
function consumer(dir, extra = {}) {
  let pushEnv = {};
  const c = {
    dir,
    git: (...args) => exec(dir, "git", args),
    read: (p) => readFileSync(join(dir, p), "utf8"),
    write: (p, text) => (mkdirSync(dirname(join(dir, p)), { recursive: true }), writeFileSync(join(dir, p), text)),
    remove: (p) => rmSync(join(dir, p), { force: true }),
    exists: (p) => existsSync(join(dir, p)),
    /** Moves the consumer to a version through its dependency and lockfile. */
    install: (spec) => must(exec(dir, "npm", ["install", "--save-dev", "--save-exact", "--ignore-scripts", "--no-audit", "--no-fund", spec]), `npm install ${spec}`),
    /** Runs the Guard this consumer installed, with the facts of its last push when there was one. */
    guard: (...args) => exec(dir, process.execPath, [join(dir, BIN), ...args], pushEnv),
    installedVersion: () => JSON.parse(readFileSync(join(dir, "node_modules", "@kaihacksai", "kaal-guard", "package.json"), "utf8")).version,
    lockIntegrity: () => JSON.parse(readFileSync(join(dir, "package-lock.json"), "utf8")).packages?.[`node_modules/${PACKAGE}`]?.integrity,
    /** The display names of every job in the consumer's workflows. */
    jobNames: () => {
      const wf = join(dir, ".github", "workflows");
      if (!existsSync(wf)) return [];
      return readdirSync(wf)
        .filter((f) => /\.ya?ml$/.test(f))
        .flatMap((f) => [...readFileSync(join(wf, f), "utf8").matchAll(/^ {4}name:\s*(.+?)\s*$/gm)].map((m) => m[1]));
    },
    /** Pushes the current branch to the bare remote through Git, so Git runs the consumer's hook. */
    push: () => {
      const branch = c.git("rev-parse", "--abbrev-ref", "HEAD").output.trim();
      const head = c.git("rev-parse", "HEAD").output.trim();
      const target = c.git("symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD").output.trim() || "origin/main";
      const base = c.git("rev-parse", target).output.trim();
      const remoteHead = c.git("ls-remote", "origin", `refs/heads/${branch}`).output.split(/\s/)[0] || "0".repeat(40);
      const r = c.git("push", "origin", branch);
      pushEnv = { KAAL_PUSH_REMOTE: "origin", KAAL_PUSH_REF: `refs/heads/${branch}`, KAAL_PUSH_REMOTE_HEAD: remoteHead };
      return { ...r, facts: ["--head", head, "--base", base, "--base-ref", target] };
    },
    ...extra,
  };
  return c;
}

function identify(c) {
  for (const [k, v] of [["user.name", "A12"], ["user.email", "a12@example.invalid"], ["commit.gpgsign", "false"]]) c.git("config", k, v);
}

/**
 * A clone of KAAL's current commit, on main, with a local bare remote as origin and core.hooksPath
 * set as a KAAL developer sets it. Nothing in it is installed until the test installs a version.
 */
export function kaalClone() {
  const root = scratch("kaal-a12-clone-");
  const remote = join(root, "remote.git");
  const dir = join(root, "kaal");
  must(exec(root, "git", ["init", "-q", "--bare", "-b", "main", remote]), "git init --bare");
  must(exec(KAAL, "git", ["push", "-q", remote, "HEAD:refs/heads/main"]), "seeding the bare remote from KAAL's commit");
  must(exec(root, "git", ["clone", "-q", remote, dir]), "git clone");
  const c = consumer(dir, {
    /** Runs the development Guard of the clone's own tree, packages/kaal-guard. */
    development: (...args) => exec(dir, process.execPath, [join(dir, "packages", "kaal-guard", "bin", "kaal-guard.mjs"), ...args]),
  });
  identify(c);
  c.git("config", "core.hooksPath", ".githooks");
  c.git("checkout", "-q", "-b", "kaal/consumer");
  return c;
}

/** A simulated consumer: one check of its own, no hook and no workflow of its own. */
export function minimalRepo() {
  const root = scratch("kaal-a12-minimal-");
  const remote = join(root, "remote.git");
  const dir = join(root, "repo");
  mkdirSync(dir);
  must(exec(root, "git", ["init", "-q", "--bare", "-b", "main", remote]), "git init --bare");
  const c = consumer(dir);
  must(c.git("init", "-q", "-b", "main"), "git init");
  identify(c);
  c.write("package.json", JSON.stringify({ name: "consumer", version: "1.0.0", private: true }, null, 2) + "\n");
  c.write(".gitignore", "node_modules/\n");
  c.write("checks/unit.mjs", "process.exit(Number(process.env.UNIT_STATUS ?? 0));\n");
  c.write("guard.json", JSON.stringify({ checks: { unit: { command: "node checks/unit.mjs", runs: ["local", "ci"] } } }, null, 2) + "\n");
  c.git("add", "-A");
  must(c.git("commit", "-q", "-m", "consumer"), "git commit");
  c.git("remote", "add", "origin", remote);
  must(c.git("push", "-q", "-u", "origin", "main"), "git push");
  return c;
}
