import spawn from "cross-spawn";
import { resolve } from "node:path";
import { HostingError, kind, list, readFile, startPlan, type Files } from "./index.js";
import { contentIdentity, type ContentIdentity } from "./run-facts.js";

/** What `readRevision` may be limited to. */
export interface RevisionOptions {
  /** Repository-relative files or folders, taken literally (`/`-separated, no `..`): a `*`, `?`, `[` or a leading `:(...)` is part of the name, never a Git pathspec; by default the whole revision. A path the revision does not hold gives nothing, not an error. */
  under?: string[];
}

interface Run {
  status: number | null;
  stdout: Buffer;
  stderr: string;
}

// Git is started as any other command is (`startPlan`), but its output is kept as bytes: a file's bytes are not text.
// This is not an export; `execute` stays the one text start.
function gitRun(root: string, args: string[], input?: Buffer): Promise<Run> {
  return new Promise((done, fail) => {
    const plan = startPlan("git", args);
    const child = spawn(plan.command, plan.args, {
      cwd: root,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_OPTIONAL_LOCKS: "0" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const out: Buffer[] = [];
    let stderr = "";
    child.stdout!.on("data", (b: Buffer) => out.push(b));
    child.stderr!.setEncoding("utf8").on("data", (s: string) => (stderr += s));
    child.stdin!.on("error", () => {}); // Git may end before it reads all of its input
    child.on("error", fail);
    child.on("close", (status) => done({ status, stdout: Buffer.concat(out), stderr }));
    child.stdin!.end(input);
  });
}

const unreadable = (what: string, run?: Run) => new HostingError(`${what}${run?.stderr.trim() ? `: ${run.stderr.trim().split("\n")[0]}` : ""}`, "REVISION_UNREADABLE");

/**
 * The commit a revision names in the repository at `root`. A ref is data, never an option: it is passed after
 * `--end-of-options`. Rejects with `REVISION_NOT_FOUND` when the ref names no commit (a blob or a tree is not
 * one), and with `REVISION_UNREADABLE` when the repository or Git cannot be read at all, so that "there is no
 * such revision" and "this could not be determined" are never the same answer.
 */
export async function revision(root: string, ref: string): Promise<{ commit: string }> {
  if (typeof ref !== "string" || ref === "" || /[\0\r\n]/.test(ref)) throw new HostingError(`${JSON.stringify(ref)} is not a ref`, "REVISION_NOT_FOUND");
  let run: Run;
  try {
    run = await gitRun(root, ["rev-parse", "--verify", "--quiet", "--end-of-options", `${ref}^{commit}`]);
  } catch (cause) {
    throw unreadable(`git could not be started (${(cause as Error).message})`);
  }
  const commit = run.stdout.toString("utf8").trim();
  if (run.status === 0 && /^[0-9a-f]{40}([0-9a-f]{24})?$/.test(commit)) return { commit };
  if (run.status === 1) throw new HostingError(`${ref} names no commit in ${root}`, "REVISION_NOT_FOUND");
  throw unreadable(`${ref} could not be resolved in ${root}`, run);
}

function under(paths: string[] | undefined): string[] {
  return (paths ?? []).map((p) => {
    const path = typeof p === "string" ? p.replace(/\/+$/, "") : "";
    if (path === "" || path.includes("\\") || path.includes("\0") || path.startsWith("/") || /^[a-zA-Z]:/.test(path) || path.split("/").some((s) => s === "" || s === "." || s === "..")) {
      throw new HostingError(`${JSON.stringify(p)} is not a repository-relative path`, "INVALID_PATH");
    }
    return path;
  });
}

/**
 * The files of a revision, as `Files` keyed by repository-relative `/`-separated path: what `read` returns for a
 * directory, from a commit instead. Read-only: nothing is checked out, fetched or written, and nothing of the
 * revision is run. A revision is read by three Git starts however many files it holds. An entry that is not a
 * plain file (a symbolic link, a submodule) inside what is asked for is refused as `REVISION_ENTRY`, naming it;
 * ask for a narrower `under` to read around it.
 */
export async function readRevision(root: string, ref: string, options: RevisionOptions = {}): Promise<Files> {
  const limit = under(options.under);
  const { commit } = await revision(root, ref);
  const listed = await gitRun(root, ["--literal-pathspecs", "ls-tree", "-r", "-z", "--full-tree", commit, "--", ...limit]);
  if (listed.status !== 0) throw unreadable(`the tree of ${commit} could not be listed`, listed);
  const entries: { path: string; object: string }[] = [];
  for (const record of listed.stdout.toString("utf8").split("\0").filter(Boolean)) {
    const tab = record.indexOf("\t");
    const [mode, type, object] = record.slice(0, tab).split(" ");
    const path = record.slice(tab + 1);
    if (type !== "blob" || mode === "120000") throw new HostingError(`${path} at ${commit} is not a plain file (mode ${mode})`, "REVISION_ENTRY");
    entries.push({ path, object });
  }
  const files: Files = {};
  if (entries.length === 0) return files;
  const blobs = await gitRun(root, ["cat-file", "--batch"], Buffer.from(entries.map((e) => `${e.object}\n`).join("")));
  if (blobs.status !== 0) throw unreadable(`the files of ${commit} could not be read`, blobs);
  let at = 0;
  for (const { path, object } of entries) {
    const eol = blobs.stdout.indexOf(0x0a, at);
    const [id, kind, size] = eol < 0 ? [] : blobs.stdout.toString("utf8", at, eol).split(" ");
    const length = Number(size);
    if (id !== object || kind !== "blob" || !Number.isInteger(length) || eol + 1 + length > blobs.stdout.length) throw unreadable(`${path} at ${commit} could not be read`);
    files[path] = Buffer.from(blobs.stdout.subarray(eol + 1, eol + 1 + length));
    at = eol + 1 + length + 1;
  }
  return files;
}

/** What `readCheckout` found. */
export interface CheckoutRead {
  /** The identity of the files the working copy holds, `.git` and links to directories left out. */
  content: ContentIdentity;
  /** The identity of the files of the commit `head` names, or `null` when none was asked or that commit is not in the repository. */
  headContent: ContentIdentity | null;
  /** The commit at `HEAD` and its parents, or `null` when `root` is not a Git working copy. */
  git: { commit: string; parents: string[] } | null;
}

/**
 * What a working copy actually holds, and where it comes from: the identity of its files by bytes and paths, the identity of
 * the files of the commit `head` names when that commit is in the repository, and the Git commit and parents. Content is
 * the fact; Git is provenance and an adapter detail, and a directory without `.git` still has content.
 * Read-only, and nothing is judged. A commit that is not there is `null`; a repository or a file that cannot be read is an error, and is never taken for the absence of Git.
 */
export async function readCheckout(root: string, options: { head?: string } = {}): Promise<CheckoutRead> {
  const listed = await list(root, { skip: [".git"], links: "skip" });
  const files: Files = {};
  for (const entry of listed) if (entry.kind === "file") files[entry.path] = await readFile(resolve(root, entry.path));
  // A Git working copy is a directory that holds `.git`; one that does not is an ordinary directory and has no Git provenance.
  // Once `.git` is there, Git must answer: an unreadable repository is an error, never an absent one.
  let git: CheckoutRead["git"] = null;
  if ((await kind(resolve(root, ".git"))) !== "missing") {
    const { commit } = await revision(root, "HEAD");
    const run = await gitRun(root, ["rev-list", "--parents", "-n", "1", "--end-of-options", commit]);
    if (run.status !== 0) throw unreadable(`the parents of ${commit} could not be read`, run);
    git = { commit, parents: run.stdout.toString("utf8").trim().split(/\s+/).slice(1) };
  }
  let headContent: ContentIdentity | null = null;
  if (options.head !== undefined && git !== null) {
    try {
      headContent = contentIdentity(await readRevision(root, options.head));
    } catch (e) {
      if ((e as { code?: string }).code !== "REVISION_NOT_FOUND") throw e;
    }
  }
  return { content: contentIdentity(files), headContent, git };
}
