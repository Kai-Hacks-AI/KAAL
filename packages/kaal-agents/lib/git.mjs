// What Git records about a directory (agents/A2). Every command runs with GIT_OPTIONAL_LOCKS=0, so
// reading the status never refreshes the index, and nothing here writes (agents/N4). A read that
// fails is reported unresolved with its reason, never as an absent value or a clean tree.
import { spawnSync } from "node:child_process";

const git = (dir, ...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });

/** Why a read failed, in Git's own words when it gave any. */
const why = (what, r) => `${what}: ${r.stderr.trim().split(/\r?\n/).pop() || `git exited ${r.status}`}`;

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
 * flight. Outside any repository, or when Git cannot run or read it, `repository` and `inFlight`
 * are null. A value Git does not have is null (no commit yet, a detached HEAD, no upstream); a
 * value Git failed to give is null as well, with an entry in `unresolved`, and `inFlight` is null
 * when the status cannot be read.
 */
export function inspect(dir) {
  const top = git(dir, "rev-parse", "--show-toplevel");
  if (top.error) return { repository: null, inFlight: null, unresolved: [{ what: "repository", reason: "git cannot run" }] };
  if (top.status !== 0) {
    const reason = /not a git repository/i.test(top.stderr) ? "not a Git repository" : why("the repository cannot be read", top);
    return { repository: null, inFlight: null, unresolved: [{ what: "repository", reason }] };
  }
  const unresolved = [];
  const fail = (what, reason) => unresolved.push({ what, reason });

  // symbolic-ref exits 1, silently, only for a detached HEAD.
  const sym = git(dir, "symbolic-ref", "-q", "--short", "HEAD");
  const branch = sym.status === 0 ? sym.stdout.trim() : null;
  if (sym.status !== 0 && (sym.status !== 1 || sym.stderr.trim())) fail("repository", why("the branch cannot be read", sym));

  // HEAD may lack a commit only on a branch with none yet; a detached HEAD always names one.
  const rev = git(dir, "rev-parse", "--verify", "-q", "HEAD");
  const head = rev.status === 0 ? rev.stdout.trim() : null;
  if (rev.status !== 0 && (rev.status !== 1 || branch === null)) fail("repository", why("HEAD cannot be read", rev));

  let upstream = null;
  let ahead = null;
  let behind = null;
  if (branch !== null) {
    const up = git(dir, "for-each-ref", "--format=%(upstream:short)", `refs/heads/${branch}`);
    if (up.status !== 0) fail("repository", why("the upstream cannot be read", up));
    else upstream = up.stdout.trim() || null;
  }
  if (upstream && head) {
    const counts = git(dir, "rev-list", "--left-right", "--count", "HEAD...@{u}");
    const parsed = counts.status === 0 ? counts.stdout.trim().split(/\s+/).map(Number) : [];
    if (parsed.length === 2 && parsed.every(Number.isInteger)) [ahead, behind] = parsed;
    else fail("repository", why(`ahead and behind ${upstream} cannot be counted`, counts));
  }

  const status = git(dir, "status", "--porcelain=v1", "-z", "--untracked-files=all");
  let inFlight = null;
  if (status.status === 0) inFlight = changed(status.stdout);
  else fail("inFlight", why("the status cannot be read", status));

  return { repository: { head, branch, upstream, ahead, behind }, inFlight, unresolved };
}
