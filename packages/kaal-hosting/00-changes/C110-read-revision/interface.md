# hosting/C110 interface

The drafts the DO takes as its files. Each is exactly what the Cases of this PLAN need; the Cases pass on them in a throwaway copy (`evidence.md`). The PLAN itself adds none of them to the tree. Each draft says where it goes.

## Intent

Appended to `01-intent/intent.md`, after hosting/I17.

`````
## Reading a revision's files

- **hosting/I18.** KAAL code, an agent or a person that needs the files of a Git revision, such as the base a judge reads from, reads them through Hosting alone, from the library or from a command of the Skill, with one meaning on every supported host: the committed bytes, never the working tree, with "there is no such revision" kept apart from "this could not be read", and without checking out, fetching, writing or running anything of the revision. Only reading a revision is Hosting's here: GitHub (pull requests, checks, rulesets) and what a revision's files mean are not.
`````

## Requirements

Appended to `02-requirements/functional/requirements.md`, after hosting/N11.

`````
- **hosting/F80** [hosting/I18]: **`readRevision(root, ref, { under })`** resolves with `Files` for the commit that `ref` names in the repository at `root`: every file of that commit, or only those at or below the repository-relative paths in `under`, keyed by `/`-separated repository-relative path, with the committed bytes exactly (a file that is not text stays as it is). It reads the commit, never the working tree or the index, so uncommitted changes are not seen. It writes nothing, checks nothing out and fetches nothing. A path in `under` that the commit does not hold gives no entry and no error. **`revision(root, ref)`** resolves with `{ commit }`, the commit id.
- **hosting/F81** [hosting/I18]: **Outcomes are kept apart.** A `ref` that names no commit (unknown, or a blob or tree) rejects with `HostingError` `REVISION_NOT_FOUND`. A repository or Git that cannot be read at all (not a repository, Git not startable, an unreadable object) rejects with `REVISION_UNREADABLE`; the two are never the same answer. A `ref` is data and never an option: one that starts with `-` is a ref that names no commit. An entry that is not a plain file (a symbolic link, a submodule) inside what is asked for rejects with `REVISION_ENTRY` naming its path; a narrower `under` reads around it. A path in `under` that is empty, absolute, drive-lettered, with a backslash, or with `.`, `..` or empty segments rejects with `INVALID_PATH`.
- **hosting/F82** [hosting/I18]: **Cost does not grow with the files.** `readRevision` starts Git a fixed number of times (at most four) whether the commit holds five files or eighty.
- **hosting/F83** [hosting/I18]: **One implementation, two ways in.** The Skill ships `scripts/revision-cli.mjs`, declared as the command `kaal-hosting-revision --root <dir> --ref <ref> [--under <path>]...`. It calls `readRevision`, and prints one line `kaal-hosting-revision {json}`: the commit and, for each file, its path, size and SHA-256 (never the bytes). It states facts, not a verdict. It exits 0 when the revision was read, including when `--under` matches nothing, and 2 when it could not be (no such revision, unreadable, a refused entry or path, bad arguments), with the code and the reason in the line. It never exits 1.
- **hosting/F84** [hosting/I18]: **Discoverable.** The `kaal-hosting` Skill and its operation guide name `readRevision` and the command and say when to use them rather than `read`; the shipped Agent instructions (`05-src/AGENTS.md`) point an agent to them instead of ad hoc `git`; the engineering rules of the package (`AGENTS.md`) say the library and the command share one implementation; the README entry list names the two functions.
- **hosting/N12** [hosting/I18]: Reading a revision adds no runtime dependency and takes no `node:test`; it executes nothing from the revision.
`````

## Architecture

Appended to `03-architecture/architecture.md`.

`````
## Reading a revision's files

- **hosting/A38** [hosting/F80, hosting/F81, hosting/F82, hosting/F83, hosting/N12]: `revision` and `readRevision` live in `05-src/skills/kaal-hosting/scripts/revision.ts`, re-exported from `index.ts` (the main entry), and are the one implementation. Git is started through `startPlan`, the one decision of how a command starts, but through a start that keeps output as bytes, because `execute` returns text and a file's bytes are not text; that start is internal to `revision.ts` and is not exported. Three starts do all the work: `rev-parse --verify --quiet --end-of-options <ref>^{commit}`, `ls-tree -r -z --full-tree <commit> -- <under>`, and one `cat-file --batch`. The command is `05-src/skills/kaal-hosting/scripts/revision-cli.mjs`, built beside `boundary-cli.mjs` (a byte-for-byte copy under `dist/skills/kaal-hosting/scripts/`), declared in `bin`, and a thin layer: it parses arguments and prints the line of hosting/F83. `HostingError` gains `REVISION_NOT_FOUND`, `REVISION_UNREADABLE` and `REVISION_ENTRY`. Only reading is in Hosting's scope here: nothing writes, fetches or checks out, and topology queries, GitHub and materializing a revision into a directory are left out.
`````

## Interface table row

Added inside the `kaal-hosting:interface` table of `03-architecture/architecture.md`, after the `kaal-hosting-boundary` row (hosting/A15).

`````
| bin | `kaal-hosting-revision` | `dist/skills/kaal-hosting/scripts/revision-cli.mjs` | delivered |
`````

## revision.ts

New file `05-src/skills/kaal-hosting/scripts/revision.ts`.

`````ts
import spawn from "cross-spawn";
import { HostingError, startPlan, type Files } from "./index.js";

/** What `readRevision` may be limited to. */
export interface RevisionOptions {
  /** Repository-relative files or folders (`/`-separated, no `..`); by default the whole revision. A path the revision does not hold gives nothing, not an error. */
  under?: string[];
}

interface Run {
  status: number | null;
  stdout: Buffer;
  stderr: string;
}

// Git is started as any other command is (`startPlan`), but its output is kept as bytes: a file's bytes are not text.
// This is not an export; `execute` stays the one text start.
function git(root: string, args: string[], input?: Buffer): Promise<Run> {
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
    run = await git(root, ["rev-parse", "--verify", "--quiet", "--end-of-options", `${ref}^{commit}`]);
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
  const listed = await git(root, ["ls-tree", "-r", "-z", "--full-tree", commit, "--", ...limit]);
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
  const blobs = await git(root, ["cat-file", "--batch"], Buffer.from(entries.map((e) => `${e.object}\n`).join("")));
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
`````

## revision-cli.mjs

New file `05-src/skills/kaal-hosting/scripts/revision-cli.mjs`.

`````js
#!/usr/bin/env node
// kaal-hosting-revision --root <dir> --ref <ref> [--under <path>]...
//   Reads the files of a revision through Hosting's `readRevision` and prints one `kaal-hosting-revision {…}` line:
//   the commit and, per file, its path, size and SHA-256 (the bytes are not printed). It prints facts, not a verdict:
//   whether this is the revision the caller meant is the caller's judgment. Exit 0 when the revision was read,
//   including when `--under` matches nothing; 2 when it could not be (no such revision, unreadable repository or
//   entry, bad arguments), with the code and reason in the line. It never exits 1: nothing here can fail a check.
import { digest, readRevision, revision } from "./index.js";

const args = process.argv.slice(2);
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
const many = (flag) => args.flatMap((a, i) => (a === flag ? [args[i + 1]] : []));
const LINE = "kaal-hosting-revision";
const say = (result) => console.log(`${LINE} ${JSON.stringify(result)}`);
const root = value("--root");
const ref = value("--ref");
const limit = many("--under");
if (!root || !ref || limit.some((p) => p === undefined || p.startsWith("--"))) {
  say({ result: "cannot-determine", code: "USAGE", reason: "usage: kaal-hosting-revision --root <dir> --ref <ref> [--under <path>]..." });
  process.exitCode = 2;
} else {
  try {
    const { commit } = await revision(root, ref);
    const files = await readRevision(root, commit, limit.length ? { under: limit } : {});
    say({ result: "read", commit, files: Object.keys(files).sort().map((path) => ({ path, bytes: files[path].length, sha256: digest(files[path]) })) });
  } catch (e) {
    say({ result: "cannot-determine", code: e?.code ?? "ERROR", reason: String(e?.message ?? e) });
    process.exitCode = 2;
  }
}
`````

## Edits to existing files

`05-src/skills/kaal-hosting/scripts/index.ts`: add the three codes to the `HostingError` code union, and at the end of the file the two exports. `package.json`: one `bin` entry. `04-test/engineering-check/build.mjs`: one line in `COPIES`, so the command is copied into `dist` as `boundary-cli.mjs` is.

`````
index.ts   | "NO_DIRECT_START" | "REVISION_NOT_FOUND" | "REVISION_UNREADABLE" | "REVISION_ENTRY",   (the code union)

index.ts   export { readRevision, revision } from "./revision.js";
           export type { RevisionOptions } from "./revision.js";

package.json  "bin": { "kaal-hosting-boundary": "...", "kaal-hosting-revision": "dist/skills/kaal-hosting/scripts/revision-cli.mjs" }

build.mjs  ["05-src/skills/kaal-hosting/scripts/revision-cli.mjs", "skills/kaal-hosting/scripts/revision-cli.mjs"],
`````

## Skill

Appended to `05-src/skills/kaal-hosting/SKILL.md`.

`````
## Read a revision's files

To read the files of a Git revision, such as the base a check must be judged against, use `readRevision(root, ref, { under })` or the command `kaal-hosting-revision --root <dir> --ref <ref> [--under <path>]...` instead of `read` (which reads a directory) or an ad hoc `git`. Both read the committed bytes, never the working tree, and keep "no such revision" (`REVISION_NOT_FOUND`) apart from "could not be read" (`REVISION_UNREADABLE`). The command prints facts (the commit and each file's path, size and SHA-256) and exits 0 or 2; whether this is the right revision is your judgment, not its output.
`````

## Operation guide row

Added to the selection table of `05-src/skills/kaal-hosting/references/operations.md`, after the `executeSync` row. No example block is added, so the delivered example Cases are unchanged.

`````
| Read the files of a Git revision | `readRevision(root, ref, { under })`, `revision(root, ref)`, or the command `kaal-hosting-revision` | The committed bytes, never the working tree. No such revision (`REVISION_NOT_FOUND`) is not an unreadable one (`REVISION_UNREADABLE`). A link or submodule entry in what you ask for is refused (`REVISION_ENTRY`); narrow `under`. The command prints facts and exits 0 or 2. Use it, not `read`, for a revision. |
`````

## Shipped Agent instructions

Appended to `05-src/AGENTS.md`.

`````
- To read the files of a Git revision, read the `kaal-hosting` Skill and use `readRevision` or the command `kaal-hosting-revision`, not an ad hoc `git`. They print or return facts; which revision is the right one is your judgment.
`````

## Engineering rules of the package

Appended to `AGENTS.md` of the package (not shipped).

`````
- `readRevision` and the command `kaal-hosting-revision` share one implementation, `05-src/skills/kaal-hosting/scripts/revision.ts`; the command only parses arguments and prints. A change to one is a change to both, and the Cases of hosting/F80 to hosting/F84 cover both.
`````

## README

The export list in `README.md` gains `readRevision` and `revision` after `prepare`. Nothing else in the README changes.
