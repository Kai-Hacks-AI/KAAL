// Git, and only Git: what the controls need from a repository, as plain
// values. Nothing here knows what is in a KAAL directory.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const git = (cwd: string, args: string[]) => spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** The paths that differ between `target` and HEAD, renames shown as a deletion and an addition. */
export function changedPaths(cwd: string, target: string): string[] {
  const r = git(cwd, ["diff", "--no-renames", "--name-only", target, "HEAD"]);
  if (r.status !== 0) throw new Error(`cannot compare ${target} with HEAD: ${r.stderr.trim()}`);
  return r.stdout.split("\n").filter((p) => p !== "");
}

/**
 * The `.kaal` directory as it is on `target`, extracted into a fresh
 * directory and handed to `use` with its path; the directory is removed
 * afterwards. A target without `.kaal` gives an empty one: nothing is
 * baselined yet.
 */
export function withBaseline<T>(cwd: string, target: string, kaal: string, use: (baselineKaal: string) => T): T {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-baseline-"));
  try {
    const known = git(cwd, ["cat-file", "-e", `${target}:${kaal}`]);
    if (known.status === 0) {
      const archive = spawnSync("git", ["archive", "--format=tar", target, kaal], { cwd, maxBuffer: 1024 * 1024 * 1024 });
      if (archive.status !== 0) throw new Error(`cannot read ${kaal} on ${target}: ${archive.stderr.toString().trim()}`);
      const extract = spawnSync("tar", ["-x", "-C", scratch], { input: archive.stdout });
      if (extract.status !== 0) throw new Error(`cannot extract ${kaal} of ${target}: ${extract.stderr.toString().trim()}`);
    } else if (git(cwd, ["rev-parse", "--verify", "--quiet", `${target}^{commit}`]).status !== 0) {
      throw new Error(`${target} is not a commit of this repository`);
    }
    return use(join(scratch, kaal));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
