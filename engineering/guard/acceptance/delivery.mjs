// Guard outer acceptance, Engineering part: the fresh target and the External delivery that
// external.test.mjs and workspace.test.mjs share (guard/C48). Planned in PLAN; DO and CHECK do not change it.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const DELIVER = resolve(HERE, "..", "external", "deliver.mjs");
export const REPO = resolve(HERE, "../../..");
/** KAAL's Skill checker (guard/A9): it reads through kaal-hosting, so it needs KAAL's installed workspace. */
export const CHECK_SKILL = join(REPO, "packages", "skills", "kaal-engineer-skill", "skills", "kaal-engineer-skill", "scripts", "check-skill.mjs");

export function run(cwd, file, args, env) {
  const r = spawnSync(file, args, { cwd, env: { ...process.env, ...env }, encoding: "utf8" });
  return { status: r.status, output: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** A fresh target with a bare remote, its own checks, and a workflow of its own. */
export function target() {
  const root = mkdtempSync(join(tmpdir(), "guard-external-"));
  const dir = join(root, "repo");
  const home = join(root, "home");
  mkdirSync(dir);
  mkdirSync(home);
  const env = { HOME: home, USERPROFILE: home, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: join(home, ".gitconfig") };
  const git = (...a) => run(dir, "git", a, env);
  const write = (p, c) => (mkdirSync(dirname(join(dir, p)), { recursive: true }), writeFileSync(join(dir, p), c));
  run(root, "git", ["init", "-q", "--bare", join(root, "remote.git")], env);
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Target");
  git("config", "user.email", "target@example.invalid");
  git("config", "commit.gpgsign", "false");
  write("package.json", JSON.stringify({ name: "target", version: "1.0.0", private: true, scripts: { test: "node checks/unit.mjs" } }, null, 2) + "\n");
  write("checks/unit.mjs", "process.exit(Number(process.env.UNIT_STATUS ?? 0));\n");
  write(".github/workflows/build.yml", "name: Build\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo build\n");
  git("add", "-A");
  git("commit", "-q", "-m", "target");
  git("remote", "add", "origin", join(root, "remote.git"));
  git("push", "-q", "-u", "origin", "main");
  return { dir, env, git, write, read: (p) => readFileSync(join(dir, p), "utf8") };
}

/** The Skill's canonical location in the target (guard/F25). */
export const SKILL = ".agents/skills/kaal-guard";

/** A delivered file's text without the Skill's own name and its canonical path, which alone may say kaal. */
export const own = (text) => text.replaceAll(SKILL, "").replace(/^name: kaal-guard$/m, "");

/** Delivers Guard into a target on the branch guard, with one check that runs locally and in CI, and any further arguments. */
export function deliver(t, ...more) {
  const checks = join(t.dir, "..", "checks.json");
  writeFileSync(checks, JSON.stringify({ unit: { command: "npm test", runs: ["local", "ci"] } }));
  return run(HERE, process.execPath, [DELIVER, "--target", t.dir, "--checks", checks, "--branch", "guard", ...more], t.env);
}
