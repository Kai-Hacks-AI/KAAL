// Shared by the Cases of hosting/C110: Hosting's build by path, and a scratch repository made with Hosting's own starts.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");
export const load = () => import(pathToFileURL(join(SCRIPTS, "index.js")).href);

/** A scratch repository on branch main, isolated from the user's Git configuration. `cleanup()` removes it. */
export async function repo() {
  const h = await load();
  const home = mkdtempSync(join(tmpdir(), "hosting-revision-"));
  const dir = join(home, "repo");
  mkdirSync(dir);
  const env = h.isolatedEnvironment(home);
  const git = (...args) => {
    const r = h.executeSync("git", ["-c", "user.name=case", "-c", "user.email=case@example.invalid", "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", ...args], { cwd: dir, env });
    if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
    return r.stdout.trim();
  };
  git("init", "-q", "-b", "main");
  return {
    dir,
    home,
    git,
    write(path, bytes) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), bytes);
    },
    commit(message) {
      git("add", "-A");
      git("commit", "-q", "-m", message);
      return git("rev-parse", "HEAD");
    },
    cleanup: () => rmSync(home, { recursive: true, force: true }),
  };
}
