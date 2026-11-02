// Engineering's temporary C129 admission bridge, not a Guard verdict or recorder.
import { appendFileSync, lstatSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SUBJECT = "engineering/guard/suites.mjs";
const git = (root, args) => spawnSync("git", args, { cwd: root, encoding: "utf8", timeout: 60_000 });

export function suiteMode(root, base) {
  try {
    if (!lstatSync(join(root, SUBJECT)).isFile()) throw new Error(`${SUBJECT} is not a regular file`);
    return "orchestrated";
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  // The workflow supplies GitHub's PR base SHA (or push-before SHA), never a
  // candidate-authored flag. Unknown base evidence cannot authorize fallback.
  if (!/^[a-f0-9]{40}$/.test(base ?? "") || /^0+$/.test(base)) throw new Error("Guard bootstrap requires the exact trusted base commit");
  if (git(root, ["cat-file", "-e", `${base}^{commit}`]).status !== 0) {
    const fetched = git(root, ["fetch", "--no-tags", "--depth=1", "origin", base]);
    if (fetched.status !== 0 || git(root, ["cat-file", "-e", `${base}^{commit}`]).status !== 0)
      throw new Error(`cannot establish trusted base ${base} for Guard bootstrap`);
  }
  const tree = git(root, ["ls-tree", "--name-only", base, "--", SUBJECT]);
  if (tree.status !== 0) throw new Error(`cannot inspect trusted base ${base} for Guard bootstrap`);
  if (tree.stdout.trim()) throw new Error(`candidate removed admitted ${SUBJECT}; baseline fallback is forbidden`);
  return "baseline";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const mode = suiteMode(process.cwd(), process.env.GUARD_BASE);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `mode=${mode}\n`);
    console.log(`Guard suite mode: ${mode}${mode === "baseline" ? "; C129 absent from candidate and trusted base, run-record evidence unavailable" : ""}`);
  } catch (error) {
    console.error(`Guard suite mode: cannot judge: ${error.message}`);
    process.exitCode = 2;
  }
}
