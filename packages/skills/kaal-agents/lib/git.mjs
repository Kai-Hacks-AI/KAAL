// What Git records about a directory (agents/A2). Every command runs with GIT_OPTIONAL_LOCKS=0, so
// reading the status never refreshes the index, and nothing here writes (agents/N4).
import { spawnSync } from "node:child_process";

const git = (dir, ...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });

const out = (r) => (r.status === 0 ? r.stdout.trim() : null);

/** The changed, staged and untracked paths of a `status --porcelain=v1 -z` listing, sorted. */
function changed(listing) {
  const paths = new Set();
  const fields = listing.split("\0");
  for (let i = 0; i < fields.length; i++) {
    const entry = fields[i];
    if (entry.length < 4) continue;
    paths.add(entry.slice(3));
    if (entry[0] === "R" || entry[0] === "C") i++;
  }
  return [...paths].sort();
}

/**
 * The repository `dir` is in: HEAD, the branch, the upstream with ahead and behind, and what is in
 * flight. `repository` is null, with the reason, outside any repository or when Git cannot run.
 */
export function inspect(dir) {
  const top = git(dir, "rev-parse", "--show-toplevel");
  if (top.error) return { repository: null, inFlight: [], reason: "git cannot run" };
  if (top.status !== 0) return { repository: null, inFlight: [], reason: "not a Git repository" };
  const head = out(git(dir, "rev-parse", "--verify", "-q", "HEAD"));
  const branch = out(git(dir, "symbolic-ref", "-q", "--short", "HEAD"));
  const upstream = out(git(dir, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"));
  let ahead = null;
  let behind = null;
  if (upstream) {
    const counts = out(git(dir, "rev-list", "--left-right", "--count", "HEAD...@{u}"));
    if (counts) [ahead, behind] = counts.split(/\s+/).map(Number);
  }
  const status = git(dir, "status", "--porcelain=v1", "-z", "--untracked-files=all");
  return { repository: { head, branch, upstream, ahead, behind }, inFlight: status.status === 0 ? changed(status.stdout) : [] };
}
