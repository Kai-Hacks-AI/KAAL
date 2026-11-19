// Fixtures for engineering/C22: a scratch repository with a base branch, and the collector check run against it.
// Git is isolated from the user's configuration; every file lives in the operating system's temporary directory.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CHECK = resolve(dirname(fileURLToPath(import.meta.url)), "../../check.mjs");

export function scratch() {
  const home = mkdtempSync(join(tmpdir(), "collector-reads-revision-"));
  const dir = join(home, "repo");
  mkdirSync(dir);
  const env = { ...process.env, HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: join(home, "xdg"), GIT_CONFIG_GLOBAL: join(home, "gitconfig"), GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...args) => {
    const r = spawnSync("git", ["-c", "user.name=case", "-c", "user.email=case@example.invalid", "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", ...args], { cwd: dir, env, encoding: "utf8" });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  git("init", "-q", "-b", "main");
  return {
    dir,
    git,
    write(path, text) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), text);
    },
    commit() {
      git("add", "-A");
      git("commit", "-q", "-m", "fixture");
    },
    /** Runs the collector check in the scratch repository. `trace` is a file that Git appends one line to for every Git process. */
    check(args, trace) {
      const traced = trace ? { ...env, GIT_TRACE: trace } : env;
      const r = spawnSync(process.execPath, [CHECK, ...args], { cwd: dir, env: traced, encoding: "utf8" });
      return { status: r.status, stdout: r.stdout, stderr: r.stderr };
    },
    /** The Git processes the check started, one trace line each, as the commands they ran. */
    started(trace) {
      return existsSync(trace) ? readFileSync(trace, "utf8").split("\n").filter((l) => /\bgit\b/.test(l) && /trace: (built-in|run_command|exec):/.test(l)).map((l) => l.replace(/^.*?trace: (built-in|run_command|exec): /, "")) : [];
    },
    cleanup: () => rmSync(home, { recursive: true, force: true }),
  };
}
